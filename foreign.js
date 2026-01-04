const LS_THEME = "v52_theme";
const $ = (id) => document.getElementById(id);

const searchEl = $("search");
const filterEl = $("filter");
const sortEl = $("sort");

const foreignResults = $("foreignResults");
const definitionResults = $("definitionResults");

const toggleThemeBtn = $("toggleThemeBtn");
const asOfText = $("asOfText");
const noteBox = $("noteBox");

function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem(LS_THEME, theme);
  toggleThemeBtn.textContent = theme === "amber" ? "Green" : "Amber";
}

function loadTheme() {
  const theme = localStorage.getItem(LS_THEME) || "green";
  setTheme(theme);
}

toggleThemeBtn.addEventListener("click", () => {
  const current = localStorage.getItem(LS_THEME) || "green";
  setTheme(current === "green" ? "amber" : "green");
});

function escapeHtml(s) {
  return (s ?? "")
    .toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function card(title, meta, body) {
  return `
    <div class="history__item">
      <div class="history__meta">
        <span>${escapeHtml(title)}</span>
        <span>${escapeHtml(meta)}</span>
      </div>
      <div class="history__text">${escapeHtml(body)}</div>
    </div>
  `;
}

async function fetchJson(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function matchesQuery(text, q) {
  if (!q) return true;
  return text.toLowerCase().includes(q.toLowerCase());
}

function matchesStatusFilter(status, filter) {
  if (filter === "any") return true;
  return (status || "").toLowerCase() === filter.toLowerCase();
}

function statusOrder(s) {
  const v = (s || "").toLowerCase();
  if (v === "enemy") return 0;
  if (v === "hostile") return 1;
  if (v === "neutral") return 2;
  if (v === "allied") return 3;
  return 9;
}

let DATA = null;

function render() {
  if (!DATA) return;

  const q = searchEl.value.trim();
  const f = filterEl.value;
  const sortMode = sortEl.value;

  // Definitions
  const defs = DATA.definitions || [];
  definitionResults.innerHTML = defs.length
    ? defs.map(d => card(d.term, "Definition", d.meaning)).join("")
    : `<div class="muted">No definitions found.</div>`;

  // Factions
  let items = (DATA.foreignAffairs || [])
    .filter(x => matchesStatusFilter(x.status, f))
    .filter(x => matchesQuery(`${x.name} ${x.status} ${x.notes ?? ""} ${x.owner ?? ""}`, q));

  if (sortMode === "name") {
    items.sort((a,b) => (a.name||"").localeCompare(b.name||""));
  } else {
    items.sort((a,b) => {
      const so = statusOrder(a.status) - statusOrder(b.status);
      if (so !== 0) return so;
      return (a.name||"").localeCompare(b.name||"");
    });
  }

  foreignResults.innerHTML = items.length
    ? items.map(x => card(
        x.name,
        `${String(x.status).toUpperCase()} • as of ${DATA.asOf}`,
        `${x.owner ? `Owner/Ref: ${x.owner}\n` : ""}${x.notes || ""}`
      )).join("")
    : `<div class="muted">No matches.</div>`;
}

async function init() {
  loadTheme();
  DATA = await fetchJson("./data/foreign-affairs.json");

  asOfText.textContent = `As of ${DATA.asOf}`;
  noteBox.textContent = DATA.note || "";

  [searchEl, filterEl, sortEl].forEach(el => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  render();
}

init().catch(() => {
  foreignResults.innerHTML = `<div class="muted">Failed to load data files.</div>`;
});
