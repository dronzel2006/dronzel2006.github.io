const PRODUCTS = [
  {id:"aurora", name:"Северное сияние", cat:"batteries", img:"img/pyro_p1.jpg",
   price:6490, shots:49, cal:0.8, time:"40 сек", level:"III",
   short:"49 залпов, золото и фиолет",
   desc:"Батарея среднего калибра для двора или площадки. Веер золотых пионов и фиолетовых хризантем, финал — крупный букет."},
  {id:"arrows", name:"Стрелы Амура", cat:"rockets", img:"img/pyro_p2.jpg",
   price:1890, shots:6, cal:1.2, time:"6 пусков", level:"II",
   short:"Набор из 6 ракет",
   desc:"Классические ракеты на направляющих. Высокий подъём, яркий разрыв. Удобно для небольшого праздника."},
  {id:"rome", name:"Римская ночь", cat:"candles", img:"img/pyro_p3.jpg",
   price:1290, shots:8, cal:0.6, time:"45 сек", level:"II",
   short:"Свечи, 8 стволов",
   desc:"Набор римских свечей: звёзды, треск и цветные шары. Ставятся в снег или мягкий грунт."},
  {id:"spark", name:"Бенгальский лес", cat:"sparklers", img:"img/pyro_p4.jpg",
   price:390, shots:10, cal:"—", time:"40 сек", level:"I",
   short:"10 бенгальских, 70 см",
   desc:"Длинные бенгальские огни для торта, фотозоны и улицы. Горят ровно, искр много."},
  {id:"emerald", name:"Изумруд", cat:"fountains", img:"img/pyro_p5.jpg",
   price:890, shots:1, cal:"—", time:"30 сек", level:"I",
   short:"Наземный фонтан",
   desc:"Конусный фонтан: зелёные и серебряные искры до 3 метров. Безопасно на открытой площадке."},
  {id:"dragon", name:"Красный дракон", cat:"batteries", img:"img/pyro_p6.jpg",
   price:18900, shots:150, cal:1.2, time:"90 сек", level:"III",
   short:"150 залпов, шоу-класс",
   desc:"Двойной блок для большой площадки. Красное золото, плотный рисунок, громкий финал. Нужна дистанция 30 м."},
  {id:"waltz", name:"Свадебный вальс", cat:"batteries", img:"img/pyro_p7.jpg",
   price:7990, shots:36, cal:0.8, time:"35 сек", level:"II",
   short:"Тихий свадебный салют",
   desc:"Светлые пионы и золотые хвосты, без жёсткого треска. Для регистрации и вечерней фотозоны."},
  {id:"party", name:"Хлопушки Party", cat:"party", img:"img/pyro_p8.jpg",
   price:490, shots:12, cal:"—", time:"мгновенно", level:"I",
   short:"12 хлопушек с конфетти",
   desc:"Пневмохлопушки для зала: цветное конфетти, без огня. Можно в помещении."},
  {id:"compact", name:"Компакт 16", cat:"batteries", img:"img/pyro_p9.jpg",
   price:2490, shots:16, cal:0.8, time:"25 сек", level:"II",
   short:"Маленькая батарея во двор",
   desc:"Короткий яркий залп для частного дома. Ставится на твёрдую поверхность, фитиль сбоку."},
  {id:"sun", name:"Солнце", cat:"fountains", img:"img/pyro_p10.jpg",
   price:740, shots:1, cal:"—", time:"20 сек", level:"I",
   short:"Наземная вертушка",
   desc:"Вертушка с красно-золотыми искрами. Эффект «солнца» на земле, детям нравится издалека."}
];
const CATS = {all:"Все", batteries:"Батареи", rockets:"Ракеты", candles:"Свечи", fountains:"Фонтаны", sparklers:"Бенгальские", party:"Для зала"};
const KEY = "nebo-cart";
const cart = JSON.parse(localStorage.getItem(KEY) || "{}");
const save = () => localStorage.setItem(KEY, JSON.stringify(cart));
const rub = n => n.toLocaleString("ru-RU") + " ₽";
const count = () => Object.values(cart).reduce((a,b)=>a+b,0);
function add(id, n=1) {
  cart[id] = (cart[id]||0)+n;
  if (cart[id]<=0) delete cart[id];
  save(); badge(); toast("Добавлено в корзину");
}
function badge() {
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = count());
}
function toast(t) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className="toast"; document.body.appendChild(el); }
  el.textContent = t; el.style.display="block";
  clearTimeout(toast._t); toast._t = setTimeout(()=>el.style.display="none", 1600);
}
function ageGate() {
  if (sessionStorage.getItem("nebo18")) return;
  const d = document.createElement("div");
  d.className = "age";
  d.innerHTML = `<div class="age-box">
    <div class="kicker">18+</div>
    <h2>Вам есть 18 лет?</h2>
    <p style="color:var(--muted);margin-bottom:18px">Пиротехника продаётся только совершеннолетним. Это демо-каталог.</p>
    <div class="row-btns" style="justify-content:center">
      <button class="btn btn-gold" id="ageYes">Да, есть 18</button>
      <a class="btn btn-ghost" href="../">Нет</a>
    </div></div>`;
  document.body.appendChild(d);
  d.querySelector("#ageYes").onclick = () => { sessionStorage.setItem("nebo18","1"); d.remove(); };
}
document.addEventListener("DOMContentLoaded", () => { badge(); ageGate(); });
