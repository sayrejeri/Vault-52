const LS_THEME = "v52_theme";
const $ = (id) => document.getElementById(id);

const searchEl = $("search");
const sectionEl = $("section");
const filterEl = $("filter");

const foreignResults = $("foreignResults");
const definitionResults = $("definitionResults");
const ruleResults = $("ruleResults");
const toggleThemeBtn = $("toggleThemeBtn");

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
  return s
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function card(title, meta, body, extraBtns = "") {
  return `
    <div class="history__item">
      <div class="history__meta">
        <span>${escapeHtml(title)}</span>
        <span>${escapeHtml(meta)}</span>
      </div>
      <div class="history__text">${escapeHtml(body)}</div>
      ${extraBtns ? `<div class="row" style="margin-top:8px">${extraBtns}</div>` : ""}
    </div>
  `;
}

async function fetchJson(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

let DATA = null;

function matchesQuery(text, q) {
  if (!q) return true;
  return text.toLowerCase().includes(q.toLowerCase());
}

function matchesStatusFilter(status, filter) {
  if (filter === "any") return true;
  return status.toLowerCase() === filter.toLowerCase();
}

function shouldShowSection(sectionKey) {
  const sel = sectionEl.value;
  return sel === "all" || sel === sectionKey;
}

function render() {
  if (!DATA) return;

  const q = searchEl.value.trim();
  const f = filterEl.value;

  // FOREIGN
  if (shouldShowSection("foreign")) {
    const items = DATA.foreignAffairs
      .filter(x => matchesStatusFilter(x.status, f))
      .filter(x => matchesQuery(`${x.name} ${x.status} ${x.notes ?? ""} ${x.owner ?? ""}`, q));

    foreignResults.innerHTML = items.length
      ? items.map(x => card(
          x.name,
          `${x.status.toUpperCase()} • as of ${DATA.asOf}`,
          `${x.owner ? `Owner/Ref: ${x.owner}\n` : ""}${x.notes || ""}`
        )).join("")
      : `<div class="muted">No matches.</div>`;
  } else {
    foreignResults.innerHTML = `<div class="muted">Hidden by section filter.</div>`;
  }

  // DEFINITIONS
  if (shouldShowSection("definitions")) {
    const defs = DATA.definitions.filter(x => matchesQuery(`${x.term} ${x.meaning}`, q));
    definitionResults.innerHTML = defs.length
      ? defs.map(d => card(d.term, "Definition", d.meaning)).join("")
      : `<div class="muted">No matches.</div>`;
  } else {
    definitionResults.innerHTML = `<div class="muted">Hidden by section filter.</div>`;
  }

  // RULES (starter)
  if (shouldShowSection("rules")) {
    const rules = DATA.quickRules.filter(r => matchesQuery(`${r.title} ${r.details} ${r.tags.join(" ")}`, q));
    ruleResults.innerHTML = rules.length
      ? rules.map(r => card(r.title, r.tags.join(" • "), r.details)).join("")
      : `<div class="muted">No matches.</div>`;
  } else {
    ruleResults.innerHTML = `<div class="muted">Hidden by section filter.</div>`;
  }
}

async function init() {
  loadTheme();
  DATA = await fetchJson("./data/foreign-affairs.json");

  // Hook up search controls
  [searchEl, sectionEl, filterEl].forEach(el => el.addEventListener("input", render));
  [sectionEl, filterEl].forEach(el => el.addEventListener("change", render));

  render();
}

init().catch(() => {
  foreignResults.innerHTML = `<div class="muted">Failed to load data files.</div>`;
});
