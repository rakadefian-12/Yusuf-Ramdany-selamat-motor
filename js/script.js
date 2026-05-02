/* =========================================================
   Yusuf Ramdany Motor — main script (FIX iPhone + anti error)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

const WA_NUMBER = "6283163895963";
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
const fmtRp = (n) => n == null ? "-" : "Rp " + Number(n).toLocaleString("id-ID");

/* ---------- Year ---------- */
const yearEl = document.getElementById("year");
if(yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- Default WA links ---------- */
const defaultMsg = "Halo Bang Yusuf, saya tertarik dengan motor Honda. Bisa info lebih lanjut?";
["heroWa","ctaWa","floatWa","kontakWa","calcWa"].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.href = waLink(defaultMsg);
});

/* ---------- Theme toggle ---------- */
const themeToggle = document.getElementById("themeToggle");
if(themeToggle){
  const savedTheme = localStorage.getItem("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", savedTheme);

  themeToggle.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });
}

/* ---------- Mobile nav ---------- */
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

if(hamburger && navMenu){
  hamburger.addEventListener("click", () => navMenu.classList.toggle("open"));
  navMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navMenu.classList.remove("open")));
}

/* ---------- Products ---------- */
const PRODUCTS = [
  { name: "BEAT SPORTY", img: "images/beat.jpg", sheet: "BEAT SPORTY CBS" },
  { name: "VARIO 125", img: "images/vario.jpg", sheet: "VARIO 125 CBS" },
  { name: "Scoopy", img: "images/scoopy.jpg", sheet: "SCOOPY ENERGETIC" },
  { name: "PCX 160", img: "images/pcx.jpg", sheet: "PCX 160 CBS" },
  { name: "ADV 160", img: "images/adv.jpg", sheet: "ADV 160 CBS" },
  { name: "VARIO 160", img: "images/cbr.jpg", sheet: "VARIO 160 CBS" },
];

const productsEl = document.getElementById("products");

if(productsEl){
  PRODUCTS.forEach(p => {
    const data = window.ANGSURAN_DATA ? window.ANGSURAN_DATA[p.sheet] : null;
    const price = data ? data.price : 0;

    const card = document.createElement("div");
    card.className = "product reveal";
    card.innerHTML = `
      <div class="product-img"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <span class="product-price">${fmtRp(price)}</span>
        <div class="product-actions">
          <button class="btn btn-outline" data-cek="${p.sheet}">Cek Angsuran</button>
          <a class="btn btn-wa" target="_blank" rel="noopener"
             href="${waLink(`Halo Bang Yusuf, saya tertarik dengan ${p.name} (${data?.name||p.name}) seharga ${fmtRp(price)}. Mohon info lebih lanjut.`)}">WhatsApp</a>
        </div>
      </div>`;
    productsEl.appendChild(card);
  });
}

/* ---------- Angsuran calculator ---------- */
const motorSel   = document.getElementById("calcMotor");
const dpSel      = document.getElementById("calcDp");
const hargaInp   = document.getElementById("calcHarga");
const tenorPills = document.getElementById("tenorPills");
const calcBtn    = document.getElementById("calcBtn");

const TENORS = [11,17,23,29,35];
let activeTenorIdx = 2;

/* Populate motor */
if(motorSel && window.ANGSURAN_DATA){
  Object.entries(window.ANGSURAN_DATA).forEach(([key,val])=>{
    const o = document.createElement("option");
    o.value = key;
    o.textContent = val.name + " — " + fmtRp(val.price);
    motorSel.appendChild(o);
  });
}

/* Tenor pills */
function renderTenors(){
  if(!tenorPills) return;

  tenorPills.innerHTML = "";
  TENORS.forEach((t,i)=>{
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = t + " bln";
    if(i === activeTenorIdx) b.classList.add("active");

    b.addEventListener("click", ()=>{
      activeTenorIdx = i;
      renderTenors();
      calculate();
    });

    tenorPills.appendChild(b);
  });
}
renderTenors();

/* Refresh DP */
function refreshDp(){
  if(!motorSel || !dpSel) return;

  const motor = window.ANGSURAN_DATA ? window.ANGSURAN_DATA[motorSel.value] : null;
  dpSel.innerHTML = "";

  if(!motor || !motor.rows) return;

  if(hargaInp) hargaInp.value = fmtRp(motor.price);

  motor.rows.forEach((r,i)=>{
    const o = document.createElement("option");
    o.value = i;
    o.textContent = fmtRp(r.dp);
    dpSel.appendChild(o);
  });

  dpSel.value = Math.floor(motor.rows.length / 2);
}

/* 🔥 FIXED CALCULATE (ANTI ERROR SAFARI) */
function calculate(){
  try {
    if(!motorSel || !dpSel) return;

    const motor = window.ANGSURAN_DATA ? window.ANGSURAN_DATA[motorSel.value] : null;
    if(!motor || !motor.rows) return;

    const rowIndex = Number(dpSel.value);
    if(isNaN(rowIndex) || !motor.rows[rowIndex]) return;

    const row = motor.rows[rowIndex];
    if(!row.ang || !row.ang[activeTenorIdx]) return;

    const ang = row.ang[activeTenorIdx];
    const tenor = TENORS[activeTenorIdx];

    document.getElementById("resAngsuran").textContent = fmtRp(ang);
    document.getElementById("resMotor").textContent = motor.name;
    document.getElementById("resHarga").textContent = fmtRp(motor.price);
    document.getElementById("resDp").textContent = fmtRp(row.dp);
    document.getElementById("resTenor").textContent = tenor + " bulan";
    document.getElementById("resTotal").textContent = fmtRp(row.dp + ang * tenor);

    const msg = `Halo Bang Yusuf, saya mau simulasi kredit:
- Motor: ${motor.name}
- Harga: ${fmtRp(motor.price)}
- DP: ${fmtRp(row.dp)}
- Tenor: ${tenor} bulan
- Angsuran: ${fmtRp(ang)}/bulan`;

    const calcWa = document.getElementById("calcWa");
    if(calcWa) calcWa.href = waLink(msg);

  } catch (e) {
    console.log("Error calculate:", e);
  }
}

/* Events FIX iPhone */
if(motorSel){
  motorSel.addEventListener("change", ()=>{
    refreshDp();
    calculate();
  });
}

if(dpSel){
  ["input","change"].forEach(evt=>{
    dpSel.addEventListener(evt, calculate);
  });
}

if(calcBtn){
  calcBtn.addEventListener("click", calculate);
}

/* Klik dari produk */
document.addEventListener("click", (e)=>{
  const btn = e.target.closest("[data-cek]");
  if(!btn || !motorSel) return;

  motorSel.value = btn.dataset.cek;
  refreshDp();
  calculate();

  const angsuranEl = document.getElementById("angsuran");
  if(angsuranEl) angsuranEl.scrollIntoView({behavior:"smooth"});
});

/* Init */
if(motorSel){
  motorSel.value = "BEAT SPORTY CBS";
  refreshDp();
  calculate();
}

/* ---------- Reveal (SAFE iPhone) ---------- */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add("show");
        io.unobserve(en.target);
      }
    });
  },{threshold:.12});

  document.querySelectorAll(".section, .product, .feature, .testi, .galeri figure, .kontak-card")
    .forEach(el=>{
      el.classList.add("reveal");
      io.observe(el);
    });
}

/* ---------- Navbar shadow ---------- */
const nav = document.getElementById("navbar");
if(nav){
  window.addEventListener("scroll", ()=>{
    nav.style.boxShadow = window.scrollY > 10 ? "0 6px 20px rgba(0,0,0,.08)" : "none";
  });
}

});