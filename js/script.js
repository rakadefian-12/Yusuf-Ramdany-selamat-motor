/* =========================================================
   Yusuf Ramdany Motor — main script
   ========================================================= */

const WA_NUMBER = "6283163895963"; // +62 831-6389-5963
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
const fmtRp = (n) => n == null ? "-" : "Rp " + Number(n).toLocaleString("id-ID");

/* ---------- Year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Default WA links ---------- */
const defaultMsg = "Halo Bang Yusuf, saya tertarik dengan motor Honda. Bisa info lebih lanjut?";
["heroWa","ctaWa","floatWa","kontakWa","calcWa"].forEach(id=>{
  const el = document.getElementById(id);
  if(el) el.href = waLink(defaultMsg);
});

/* ---------- Theme toggle ---------- */
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.addEventListener("click", () => {
  const cur = document.documentElement.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

/* ---------- Mobile nav ---------- */
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
hamburger.addEventListener("click", () => navMenu.classList.toggle("open"));
navMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navMenu.classList.remove("open")));

/* ---------- Products (showcase the 6 main models) ---------- */
const PRODUCTS = [
  { name: "BEAT SPORTY", img: "images/beat.jpg", sheet: "BEAT SPORTY CBS" },
  { name: "VARIO 125", img: "images/vario.jpg", sheet: "VARIO 160 CBS" },
  { name: "Scoopy", img: "images/scoopy.jpg", sheet: "SCOOPY ENERGETIC" },
  { name: "PCX 160", img: "images/pcx.jpg", sheet: "PCX 160 CBS" },
  { name: "ADV 160", img: "images/adv.jpg", sheet: "ADV 160 CBS" },
  { name: "VARIO 160", img: "images/cbr.jpg", sheet: "CBR150R STD (BK)" },
];

const productsEl = document.getElementById("products");
PRODUCTS.forEach(p => {
  const data = window.ANGSURAN_DATA[p.sheet];
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

/* ---------- Angsuran calculator ---------- */
const motorSel  = document.getElementById("calcMotor");
const dpSel     = document.getElementById("calcDp");
const hargaInp  = document.getElementById("calcHarga");
const tenorPills= document.getElementById("tenorPills");
const calcBtn   = document.getElementById("calcBtn");

const TENORS = [11,17,23,29,35];
let activeTenorIdx = 2; // default 23

// Populate motor dropdown (all 53 sheets)
Object.entries(window.ANGSURAN_DATA).forEach(([key,val])=>{
  const o = document.createElement("option");
  o.value = key;
  o.textContent = val.name + " — " + fmtRp(val.price);
  motorSel.appendChild(o);
});

// Tenor pills
function renderTenors(){
  tenorPills.innerHTML = "";
  TENORS.forEach((t,i)=>{
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = t + " bln";
    if(i === activeTenorIdx) b.classList.add("active");
    b.addEventListener("click", ()=>{ activeTenorIdx = i; renderTenors(); calculate(); });
    tenorPills.appendChild(b);
  });
}
renderTenors();

// Populate DP for selected motor
function refreshDp(){
  const motor = window.ANGSURAN_DATA[motorSel.value];
  dpSel.innerHTML = "";
  if(!motor) return;
  hargaInp.value = fmtRp(motor.price);
  motor.rows.forEach((r,i)=>{
    const o = document.createElement("option");
    o.value = i;
    o.textContent = fmtRp(r.dp);
    dpSel.appendChild(o);
  });
  // Default DP: middle row
  dpSel.value = Math.floor(motor.rows.length/2);
}

function calculate(){
  const motor = window.ANGSURAN_DATA[motorSel.value];
  if(!motor) return;
  const row = motor.rows[Number(dpSel.value)];
  const ang = row.ang[activeTenorIdx];
  const tenor = TENORS[activeTenorIdx];
  document.getElementById("resAngsuran").textContent = fmtRp(ang);
  document.getElementById("resMotor").textContent = motor.name;
  document.getElementById("resHarga").textContent = fmtRp(motor.price);
  document.getElementById("resDp").textContent = fmtRp(row.dp);
  document.getElementById("resTenor").textContent = tenor + " bulan";
  document.getElementById("resTotal").textContent = ang ? fmtRp(row.dp + ang*tenor) : "-";

  // Update calc WA link
  const msg = `Halo Bang Yusuf, saya mau simulasi kredit:
- Motor: ${motor.name}
- Harga: ${fmtRp(motor.price)}
- DP: ${fmtRp(row.dp)}
- Tenor: ${tenor} bulan
- Angsuran: ${fmtRp(ang)}/bulan
Mohon dibantu prosesnya. Terima kasih.`;
  document.getElementById("calcWa").href = waLink(msg);
}

motorSel.addEventListener("change", ()=>{ refreshDp(); calculate(); });
dpSel.addEventListener("change", calculate);
calcBtn.addEventListener("click", calculate);

// Cek Angsuran from product cards -> jump & set
document.addEventListener("click", (e)=>{
  const btn = e.target.closest("[data-cek]");
  if(!btn) return;
  motorSel.value = btn.dataset.cek;
  refreshDp();
  calculate();
  document.getElementById("angsuran").scrollIntoView({behavior:"smooth"});
});

// Init
motorSel.value = "BEAT SPORTY CBS";
refreshDp();
calculate();

/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("show"); io.unobserve(en.target);} });
},{threshold:.12});
document.querySelectorAll(".section, .product, .feature, .testi, .galeri figure, .kontak-card").forEach(el=>{
  el.classList.add("reveal"); io.observe(el);
});

/* ---------- Navbar shadow on scroll ---------- */
const nav = document.getElementById("navbar");
addEventListener("scroll", ()=>{
  nav.style.boxShadow = scrollY > 10 ? "0 6px 20px rgba(0,0,0,.08)" : "none";
});
