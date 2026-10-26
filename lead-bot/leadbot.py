"""Telegram-бот приёма заявок с сайта.

Сайт отправляет форму POST-запросом на /lead, бот присылает заявку менеджерам
с кнопками «Взял в работу» / «Спам», ведёт журнал leads.csv и отвечает на /stats.

Запуск:  BOT_TOKEN=... ADMIN_CHAT=... python leadbot.py
"""
import csv
import json
import os
import threading
import time
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import requests

TOKEN = os.environ["BOT_TOKEN"]
ADMIN_CHAT = int(os.environ["ADMIN_CHAT"])
PORT = int(os.environ.get("PORT", 8080))
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
API = f"https://api.telegram.org/bot{TOKEN}/"
LOG = Path(__file__).with_name("leads.csv")
lock = threading.Lock()


def tg(method, **data):
    return requests.post(API + method, json=data, timeout=30).json()


def save(lead_id, lead, status):
    with lock:
        new = not LOG.exists()
        with open(LOG, "a", newline="", encoding="utf-8-sig") as f:
            w = csv.writer(f, delimiter=";")
            if new:
                w.writerow(["id", "date", "name", "phone", "source", "message", "status"])
            w.writerow([lead_id, datetime.now().strftime("%d.%m.%Y %H:%M"), lead.get("name"), lead.get("phone"),
                        lead.get("source"), lead.get("message"), status])


def notify(lead):
    lead_id = int(time.time() * 1000) % 10_000_000
    text = (f"🔥 <b>Новая заявка #{lead_id}</b>\n\n"
            f"👤 {lead.get('name', '—')}\n📞 {lead.get('phone', '—')}\n"
            f"🌐 {lead.get('source', 'сайт')}\n💬 {lead.get('message', '—')}")
    tg("sendMessage", chat_id=ADMIN_CHAT, text=text, parse_mode="HTML", reply_markup={"inline_keyboard": [[
        {"text": "✅ Взял в работу", "callback_data": f"take:{lead_id}"},
        {"text": "🚫 Спам", "callback_data": f"spam:{lead_id}"}]]})
    save(lead_id, lead, "new")


def stats():
    if not LOG.exists():
        return "Заявок пока нет"
    rows = list(csv.DictReader(open(LOG, encoding="utf-8-sig"), delimiter=";"))
    today = datetime.now().strftime("%d.%m.%Y")
    return (f"📊 Всего заявок: {len(rows)}\nСегодня: {sum(r['date'].startswith(today) for r in rows)}\n"
            f"В работе: {sum(r['status'] == 'taken' for r in rows)} · спам: {sum(r['status'] == 'spam' for r in rows)}")


def poll():
    offset = None
    while True:
        try:
            upd = requests.post(API + "getUpdates", json={"offset": offset, "timeout": 50}, timeout=70).json()
        except requests.RequestException:
            time.sleep(5)
            continue
        for u in upd.get("result", []):
            offset = u["update_id"] + 1
            if "callback_query" in u:
                q = u["callback_query"]
                action, lead_id = q["data"].split(":")
                who = q["from"].get("first_name", "менеджер")
                label = f"✅ В работе у {who}" if action == "take" else "🚫 Помечено как спам"
                tg("editMessageReplyMarkup", chat_id=q["message"]["chat"]["id"], message_id=q["message"]["message_id"],
                   reply_markup={"inline_keyboard": [[{"text": label, "callback_data": "noop:0"}]]})
                tg("answerCallbackQuery", callback_query_id=q["id"], text=label)
                save(lead_id, {}, "taken" if action == "take" else "spam")
            elif u.get("message", {}).get("text", "").startswith("/stats"):
                tg("sendMessage", chat_id=u["message"]["chat"]["id"], text=stats())


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path != "/lead":
            self.send_error(404)
            return
        try:
            lead = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        except ValueError:
            self.send_error(400)
            return
        if lead.get("website"):  # honeypot-поле: его заполняют только боты
            self.send_response(204)
            self._cors()
            self.end_headers()
            return
        notify({k: str(v)[:500] for k, v in lead.items()})
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"ok":true}')


if __name__ == "__main__":
    threading.Thread(target=poll, daemon=True).start()
    print(f"Принимаю заявки на http://0.0.0.0:{PORT}/lead")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
