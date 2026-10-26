const PRODUCTS = [
  {id:"tgy", name:"Те Гуань Инь", cat:"oolong", img:"img/tea_p1.jpg", price:890, meta:"Улун, Фуцзянь · 100 г",
   desc:"Классический тегуаньинь: орхидея, сливочность, долгий вкус. 6–8 проливов."},
  {id:"sencha", name:"Сенча Premium", cat:"green", img:"img/tea_p2.jpg", price:760, meta:"Зелёный, Япония · 80 г",
   desc:"Яркая сенча с морской свежестью. Заваривать 70°C, 40 секунд."},
  {id:"dian", name:"Дянь Хун", cat:"black", img:"img/tea_p3.jpg", price:640, meta:"Красный, Юньнань · 100 г",
   desc:"Медовый юньнаньский красный. Утром вместо кофе, вечером без горечи."},
  {id:"gaiwan", name:"Гайвань 150 мл", cat:"ware", img:"img/tea_p4.jpg", price:1490, meta:"Фарфор селадон",
   desc:"Ручная форма, крышка плотно садится. Для улунов и красных чаёв."},
  {id:"matcha", name:"Матча церемониальная", cat:"green", img:"img/tea_p5.jpg", price:1190, meta:"Удзи · 30 г",
   desc:"Яркий помол, без горечи. Венчик в комплект не входит — есть отдельно."},
  {id:"cups", name:"Пиалы, 4 шт.", cat:"ware", img:"img/tea_p6.jpg", price:1990, meta:"Глина, обжиг",
   desc:"Неглазурованные внутри, держат тепло. Объём около 40 мл."}
];
const CATS = {all:"Все", oolong:"Улун", green:"Зелёный", black:"Красный", ware:"Посуда"};
const KEY="leaf-cart-v2";
const cart = JSON.parse(localStorage.getItem(KEY)||"{}");
const save=()=>localStorage.setItem(KEY, JSON.stringify(cart));
const rub=n=>n.toLocaleString("ru-RU")+" ₽";
const count=()=>Object.values(cart).reduce((a,b)=>a+b,0);
function add(id,n=1){ cart[id]=(cart[id]||0)+n; if(cart[id]<=0) delete cart[id]; save(); badge(); toast("В корзине"); }
function badge(){ document.querySelectorAll("[data-cart-count]").forEach(el=>el.textContent=count()); }
function toast(t){ let el=document.querySelector(".toast"); if(!el){el=document.createElement("div"); el.className="toast"; document.body.appendChild(el);} el.textContent=t; el.style.display="block"; clearTimeout(toast._t); toast._t=setTimeout(()=>el.style.display="none",1400); }
document.addEventListener("DOMContentLoaded", badge);
function cardHTML(p){ return `<article class="card"><a class="pic" href="product.html?id=${p.id}"><img src="${p.img}" alt="${p.name}"></a>
  <div class="body"><h3><a href="product.html?id=${p.id}">${p.name}</a></h3><div class="meta">${p.meta}</div>
  <div class="row"><span class="price">${rub(p.price)}</span><button class="btn" style="padding:8px 12px" onclick="add('${p.id}')">В корзину</button></div></div></article>`; }
