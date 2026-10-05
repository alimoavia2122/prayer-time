const API = "https://api.aladhan.com/v1";
const METHOD = 1; // University of Islamic Sciences, Karachi
const PRAYERS = [
  ["Fajr", "الفجر"], ["Sunrise", "الشروق"], ["Dhuhr", "الظهر"],
  ["Asr", "العصر"], ["Maghrib", "المغرب"], ["Isha", "العشاء"],
];
const KEYS = PRAYERS.map((p) => p[0]);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CITIES = Object.entries(CITY_DATA).flatMap(([province, list]) =>
  list.map(([name, lat, lon]) => ({ name, province, lat, lon })));

const $ = (id) => document.getElementById(id);
const state = { city: CITIES.find((c) => c.name === "Bhakkar"), tz: "Asia/Karachi", timings: null, calY: 0, calM: 0, cal: null };
let allTimes = {};
let allStarted = false;

/* ---------- Helpers ---------- */
const setStatus = (m) => ($("status").textContent = m);
const school = () => $("school").value;
const q = (c) => `latitude=${c.lat}&longitude=${c.lon}&method=${METHOD}&school=${school()}`;

async function api(path) {
  const res = await fetch(API + path);
  const json = await res.json();
  if (!res.ok || json.code !== 200) throw new Error("Request failed");
  return json.data;
}

function fmt(hhmm) {
  if (!hhmm) return "...";
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  if ($("fmt24").checked) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}
const mins = (hhmm) => { const [h, m] = hhmm.slice(0, 5).split(":").map(Number); return h * 60 + m; };

function partsIn(tz, opts) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour12: false, ...opts }).formatToParts(new Date());
}
function nowSeconds(tz) {
  const p = partsIn(tz, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const g = (t) => Number(p.find((x) => x.type === t).value);
  return (g("hour") % 24) * 3600 + g("minute") * 60 + g("second");
}
function todayIn(tz) {
  const p = partsIn(tz, { year: "numeric", month: "2-digit", day: "2-digit" });
  const g = (t) => Number(p.find((x) => x.type === t).value);
  return { y: g("year"), m: g("month"), d: g("day") };
}

/* ---------- Today ---------- */
async function loadToday() {
  setStatus("");
  $("place").textContent = state.city.name + (state.city.province ? `, ${state.city.province}` : "");
  try {
    const d = await api(`/timings/${Math.floor(Date.now() / 1000)}?${q(state.city)}`);
    state.timings = d.timings;
    state.tz = d.meta.timezone;
    const h = d.date.hijri;
    $("dates").textContent = `${d.date.gregorian.weekday.en}, ${d.date.readable}`;
    $("hijri").textContent = `${h.day} ${h.month.en} ${h.year} AH`;
    renderToday();
  } catch {
    setStatus("Could not load prayer times. Check your internet connection and choose the city again.");
  }
}

function nextPrayer() {
  const now = nowSeconds(state.tz);
  for (const k of KEYS) {
    if (k === "Sunrise") continue;
    const t = mins(state.timings[k]) * 60;
    if (t > now) return { key: k, secs: t - now };
  }
  return { key: "Fajr", secs: 86400 - now + mins(state.timings.Fajr) * 60 };
}

function renderToday() {
  if (!state.timings) return;
  const next = nextPrayer();
  $("tiles").innerHTML = PRAYERS.map(([k, ar]) =>
    `<div class="tile ${k === next.key ? "next" : ""}"><div class="ar">${ar}</div><div class="en">${k}</div><div class="t">${fmt(state.timings[k])}</div></div>`
  ).join("");
  const ar = PRAYERS.find((p) => p[0] === next.key)[1];
  $("nextAr").textContent = ar;
  $("nextName").textContent = next.key;
  $("nextTime").textContent = fmt(state.timings[next.key]);
  tick();
}

function tick() {
  if (!state.timings) return;
  const n = nextPrayer();
  if ($("nextName").textContent !== n.key) return renderToday();
  const p = (x) => String(x).padStart(2, "0");
  $("countdown").textContent = `${p(Math.floor(n.secs / 3600))}:${p(Math.floor((n.secs % 3600) / 60))}:${p(n.secs % 60)}`;
}

/* ---------- Monthly calendar ---------- */
async function loadCalendar() {
  $("calCity").textContent = `for ${state.city.name}`;
  $("calLabel").textContent = `${MONTHS[state.calM - 1]} ${state.calY}`;
  $("calBody").innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;
  try {
    state.cal = await api(`/calendar/${state.calY}/${state.calM}?${q(state.city)}`);
    renderCalendar();
  } catch {
    $("calBody").innerHTML = `<tr><td colspan="7">Could not load the timetable. Try again.</td></tr>`;
  }
}

function renderCalendar() {
  if (!state.cal) return;
  const t = todayIn(state.tz);
  const isNow = t.y === state.calY && t.m === state.calM;
  $("calBody").innerHTML = state.cal.map((d) => {
    const day = Number(d.date.gregorian.day);
    return `<tr class="${isNow && day === t.d ? "today" : ""}"><td>${d.date.gregorian.weekday.en.slice(0, 3)}, ${day} ${MONTHS[state.calM - 1].slice(0, 3)}</td>${
      KEYS.map((k) => `<td>${fmt(d.timings[k])}</td>`).join("")}</tr>`;
  }).join("");
}

function shiftMonth(delta) {
  state.calM += delta;
  if (state.calM < 1) { state.calM = 12; state.calY--; }
  if (state.calM > 12) { state.calM = 1; state.calY++; }
  loadCalendar();
}

/* ---------- All cities ---------- */
function renderAll() {
  const f = $("filter").value.trim().toLowerCase();
  $("allBody").innerHTML = CITIES.map((c, i) => ({ c, i }))
    .filter(({ c }) => !f || `${c.name} ${c.province}`.toLowerCase().includes(f))
    .map(({ c, i }) => `<tr data-i="${i}" class="${c === state.city ? "cur" : ""}"><td>${c.name}</td><td>${c.province}</td>${
      KEYS.map((k) => `<td>${fmt(allTimes[i] && allTimes[i][k])}</td>`).join("")}</tr>`)
    .join("") || `<tr><td colspan="8">No city matches your search.</td></tr>`;
}

async function loadAll() {
  allStarted = true;
  allTimes = {};
  const ts = Math.floor(Date.now() / 1000);
  for (let i = 0; i < CITIES.length; i += 5) {
    await Promise.allSettled(CITIES.slice(i, i + 5).map(async (c, k) => {
      try { allTimes[i + k] = (await api(`/timings/${ts}?${q(c)}`)).timings; } catch { /* leave blank */ }
    }));
    const done = Math.min(i + 5, CITIES.length);
    $("progress").textContent = done < CITIES.length ? `Loading ${done} of ${CITIES.length} cities...` : `Showing today's times for ${CITIES.length} cities.`;
    renderAll();
  }
}

/* ---------- City selection ---------- */
function buildSelect() {
  const sel = $("citySelect");
  sel.innerHTML = Object.keys(CITY_DATA).map((prov) =>
    `<optgroup label="${prov}">${CITIES.map((c, i) => c.province === prov ? `<option value="${i}">${c.name}</option>` : "").join("")}</optgroup>`
  ).join("");
  sel.value = CITIES.indexOf(state.city);
}

function chooseCity(city) {
  state.city = city;
  try { localStorage.setItem("salah-city", city.name); } catch { /* storage unavailable */ }
  loadToday();
  loadCalendar();
  renderAll();
}

/* ---------- Events ---------- */
$("citySelect").addEventListener("change", (e) => chooseCity(CITIES[Number(e.target.value)]));

$("geoBtn").addEventListener("click", () => {
  if (!navigator.geolocation) return setStatus("Your browser does not support location.");
  setStatus("Finding your location...");
  navigator.geolocation.getCurrentPosition(
    (pos) => chooseCity({ name: "Your location", province: "", lat: pos.coords.latitude, lon: pos.coords.longitude }),
    () => setStatus("Location access was blocked. Choose your city from the list instead.")
  );
});

$("school").addEventListener("change", () => { loadToday(); loadCalendar(); if (allStarted) loadAll(); });
$("fmt24").addEventListener("change", () => { renderToday(); renderCalendar(); renderAll(); });
$("calPrev").addEventListener("click", () => shiftMonth(-1));
$("calNext").addEventListener("click", () => shiftMonth(1));
$("filter").addEventListener("input", renderAll);
$("allBody").addEventListener("click", (e) => {
  const row = e.target.closest("tr[data-i]");
  if (!row) return;
  const city = CITIES[Number(row.dataset.i)];
  $("citySelect").value = CITIES.indexOf(city);
  chooseCity(city);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- Start ---------- */
try {
  const saved = localStorage.getItem("salah-city");
  const found = CITIES.find((c) => c.name === saved);
  if (found) state.city = found;
} catch { /* storage unavailable */ }

buildSelect();
const t0 = todayIn(state.tz);
state.calY = t0.y;
state.calM = t0.m;
renderAll();
loadToday();
loadCalendar();
setInterval(tick, 1000);

// Load every city once the table scrolls into view
new IntersectionObserver((entries, obs) => {
  if (entries[0].isIntersecting && !allStarted) { obs.disconnect(); loadAll(); }
}, { rootMargin: "300px" }).observe($("cities"));
