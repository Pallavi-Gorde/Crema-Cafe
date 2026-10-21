// Café Crema — Sunlit Roastery Edition. Demo data saved in browser localStorage.
const MANAGER = { user: "crema_manager", pass: "CremaAndheri@2026" };
const PROMO = { CREMA10: 0.1 };
const MENU = [
  { id: 1, name: "Golden Crema Espresso", cat: "Coffee Bar", veg: true, price: 180, img: "espresso_crema.jpg", desc: "Double shot, estate single-origin." },
  { id: 2, name: "Salted Caramel Iced Latte", cat: "Coffee Bar", veg: true, price: 260, img: "caramel_latte.jpg", desc: "House caramel, cold milk, sea salt." },
  { id: 3, name: "Nitro Cold Brew", cat: "Coffee Bar", veg: true, price: 280, img: "cold_brew.jpg", desc: "18-hour steep, silky pour." },
  { id: 4, name: "Biscoff Cream Frappe", cat: "Coffee Bar", veg: true, price: 320, img: "biscoff_frappe.jpg", desc: "Speculoos, whipped cream." },
  { id: 5, name: "Truffle Nachos", cat: "Starters", veg: true, price: 390, img: "truffle_nachos.jpg", desc: "Cheese sauce, jalapeño, truffle." },
  { id: 6, name: "Burrata Margherita", cat: "Oven & Mains", veg: true, price: 650, img: "burrata_pizza.jpg", desc: "48-hour dough, San Marzano, burrata." },
  { id: 7, name: "Truffle Fettuccine", cat: "Oven & Mains", veg: true, price: 520, img: "truffle_pasta.jpg", desc: "Wild mushroom cream, parmesan." },
  { id: 8, name: "Butter Chicken & Garlic Naan", cat: "Oven & Mains", veg: false, price: 560, img: "butter_chicken.jpg", desc: "Our house favourite." },
  { id: 9, name: "Espresso Tiramisu", cat: "Patisserie", veg: true, price: 340, img: "crema_tiramisu.jpg", desc: "Mascarpone, cocoa, house espresso." },
  { id: 10, name: "Basque Burnt Cheesecake", cat: "Patisserie", veg: true, price: 360, img: "burnt_cheesecake.jpg", desc: "Berry compote." },
];
const $ = (s) => document.querySelector(s);
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const get = (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
const put = (k, v) => localStorage.setItem(k, JSON.stringify(v));
let cart = get("sun_cart", []), orders = get("sun_orders", []), resv = get("sun_resv", []), discount = 0;
const find = (id) => MENU.find((m) => m.id === id);
function toast(t) { const e = $("#toast"); e.textContent = t; e.classList.add("on"); setTimeout(() => e.classList.remove("on"), 2200); }

/* Menu */
const cats = ["All", ...new Set(MENU.map((m) => m.cat))];
$("#tabs").innerHTML = cats.map((c, i) => `<button class="${i ? "" : "on"}" data-c="${c}">${c}</button>`).join("");
$("#tabs").onclick = (e) => { const c = e.target.dataset.c; if (!c) return; document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b === e.target)); draw(c); };
function draw(c = "All") {
  $("#list").innerHTML = MENU.filter((m) => c === "All" || m.cat === c).map((m) => `
  <div class="item"><img src="${m.img}" alt="${m.name}" loading="lazy"><div class="t"><h3><i class="dot ${m.veg ? "veg" : "nv"}"></i>${m.name}</h3><p>${m.desc}</p></div>
  <div class="r"><span class="pr">${inr(m.price)}</span><button class="plus" data-id="${m.id}" aria-label="Add">+</button></div></div>`).join("");
}
$("#list").onclick = (e) => { const id = +e.target.dataset.id; if (!id) return; const r = cart.find((c) => c.id === id); r ? r.qty++ : cart.push({ id, qty: 1 }); put("sun_cart", cart); paint(); toast(find(id).name + " added"); };

/* Cart */
function sums() { const sub = cart.reduce((s, c) => s + find(c.id).price * c.qty, 0); const d = sub * discount; return { sub, d, gst: (sub - d) * 0.05, tot: (sub - d) * 1.05 }; }
function paint() {
  $("#cnt").textContent = cart.reduce((s, c) => s + c.qty, 0);
  $("#pItems").innerHTML = cart.length ? cart.map((c) => { const m = find(c.id); return `<div class="p-row"><img src="${m.img}" alt=""><div>${m.name}<br><small>${inr(m.price)}</small></div><span class="q"><button data-d="${c.id}">−</button> ${c.qty} <button data-i="${c.id}">+</button></span></div>`; }).join("") : `<p class="empty">Nothing here yet — add something delicious.</p>`;
  const s = sums(); $("#pSub").textContent = inr(s.sub); $("#pDisc").textContent = "−" + inr(s.d); $("#pGst").textContent = inr(s.gst); $("#pTot").textContent = inr(s.tot);
}
$("#pItems").onclick = (e) => { const i = +e.target.dataset.i, d = +e.target.dataset.d; if (i) cart.find((c) => c.id === i).qty++; if (d) { const r = cart.find((c) => c.id === d); if (!--r.qty) cart = cart.filter((c) => c !== r); } put("sun_cart", cart); paint(); };
$("#applyPromo").onclick = () => { const code = $("#promo").value.trim().toUpperCase(); if (PROMO[code]) { discount = PROMO[code]; toast("CREMA10 applied — 10% off"); } else { discount = 0; toast("Invalid code"); } paint(); };
$("#send").onclick = () => {
  if (!cart.length) return toast("Your order is empty");
  orders.unshift({ id: "T" + Date.now().toString().slice(-4), table: $("#tbl").value || "Counter", items: cart.map((c) => `${find(c.id).name} ×${c.qty}`), total: sums().tot, status: "New", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
  put("sun_orders", orders); cart = []; discount = 0; $("#promo").value = ""; put("sun_cart", cart); paint(); close(); toast("Sent to the kitchen!");
};
const open = () => { $("#panel").classList.add("open"); $("#shade").classList.add("on"); };
function close() { $("#panel").classList.remove("open"); $("#shade").classList.remove("on"); }
$("#orderBtn").onclick = open; $("#shade").onclick = close;
$("#burger").onclick = () => $("#links").classList.toggle("open");
document.querySelectorAll("#links a").forEach((a) => (a.onclick = () => $("#links").classList.remove("open")));
document.addEventListener("click", (e) => { if ("close" in e.target.dataset) close(); if ("closeadmin" in e.target.dataset) $("#admin").classList.remove("on"); });

/* Booking */
$("#bookForm").onsubmit = (e) => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); resv.unshift(f); put("sun_resv", resv); $("#bookMsg").textContent = `Thanks ${f.name}! We've reserved a table for ${f.guests} on ${f.date}, ${f.time}.`; e.target.reset(); };

/* Admin / KDS */
$("#adminBtn").onclick = () => { $("#admin").classList.add("on"); sessionStorage.getItem("sun_auth") ? showKds() : showLogin(); };
function showLogin() { $("#login").style.display = "block"; $("#kds").style.display = "none"; }
function showKds() { $("#login").style.display = "none"; $("#kds").style.display = "block"; kds(); }
$("#loginForm").onsubmit = (e) => { e.preventDefault(); if ($("#u").value.trim() === MANAGER.user && $("#p").value === MANAGER.pass) { sessionStorage.setItem("sun_auth", "1"); $("#err").textContent = ""; showKds(); } else $("#err").textContent = "Incorrect credentials."; };
$("#out").onclick = () => { sessionStorage.removeItem("sun_auth"); showLogin(); };
function kds() {
  $("#rev").textContent = inr(orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0));
  $("#cards").innerHTML = orders.length ? orders.map((o, i) => `<div class="kcard ${o.status}"><b>#${o.id} · Table ${o.table}</b> <small>${o.time}</small><ul>${o.items.map((x) => `<li>${x}</li>`).join("")}</ul>
    <div>Status: <b>${o.status}</b> · ${inr(o.total)}</div><div class="acts2">${["New", "Preparing", "Ready", "Cancelled"].map((s) => `<button data-k="${i}" data-s="${s}">${s}</button>`).join("")}</div></div>`).join("") : `<p class="empty">No live orders.</p>`;
  $("#res").innerHTML = resv.length ? `<table><tr><th>Guest</th><th>Phone</th><th>Date</th><th>Time</th><th>Guests</th><th>Occasion</th></tr>${resv.map((r) => `<tr><td>${r.name}</td><td>${r.phone}</td><td>${r.date}</td><td>${r.time}</td><td>${r.guests}</td><td>${r.occasion}</td></tr>`).join("")}</table>` : `<p class="empty">No reservations yet.</p>`;
}
$("#cards").onclick = (e) => { const k = e.target.dataset.k; if (k === undefined) return; orders[k].status = e.target.dataset.s; put("sun_orders", orders); kds(); };
$("#demo").onclick = () => {
  const a = MENU[Math.floor(Math.random() * MENU.length)], b = MENU[Math.floor(Math.random() * MENU.length)];
  orders.unshift({ id: "T" + Date.now().toString().slice(-4), table: String(1 + Math.floor(Math.random() * 14)), items: [a.name + " ×1", b.name + " ×1"], total: (a.price + b.price) * 1.05, status: "New", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
  resv.unshift({ name: ["Neha R.", "Kabir D.", "Sana A."][Math.floor(Math.random() * 3)], phone: "98190 2" + Math.floor(1000 + Math.random() * 8999), date: new Date().toISOString().slice(0, 10), time: "13:00", guests: "4", occasion: "Birthday" });
  put("sun_orders", orders); put("sun_resv", resv); kds(); toast("Demo order added");
};

draw(); paint();
