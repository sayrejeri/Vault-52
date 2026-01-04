const LS_THEME = "v52_theme";
const $ = (id) => document.getElementById(id);

const searchEl = $("search");
const filterEl = $("filter");
const sortEl = $("sort");

const foreignResults = $("foreignResults");
const definitionResults = $("definitionResults");

const toggleThemeBtn = $("toggleThemeBtn");
const noteBox = $("noteBox");
// OPTIONAL: if your foreign.html has asOfText element, we won't use it
const asOfText = $("asOfText");

function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem(LS_THEME, theme);
  toggleThemeBtn.textContent = theme === "amber" ? "Green" : "Amber";
}

function loadTheme() {
  const theme = localStorage.getItem(LS_THEME) || "green";
  setTheme(theme);
}

toggleThemeBtn?.addEventListener("click", () => {
  const current = localStorage.getItem(LS_THEME) || "green";
  setTheme(current === "green" ? "amber" : "green");
});

function escapeHtml(s) {
  return (s ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function fetchJson(path) {
  // service-worker may cache app shell; data fetches should be fresh
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

function parseISODate(iso) {
  // expects YYYY-MM-DD
  if (!iso || typeof iso !== "string") return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo, d)); // normalize to UTC midnight
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function daysSince(dateObj) {
  if (!dateObj) return null;
  const now = new Date();
  // compare in UTC to avoid timezone surprises
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dateUTC = Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate());
  const diffMs = todayUTC - dateUTC;
  return Math.floor(diffMs / 86400000);
}

function formatAsOf(iso) {
  const dt = parseISODate(iso);
  if (!dt) return "As of: Unknown";
  // Render like: Jan 4, 2026
  return `As of: ${dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}`;
}

function freshnessBadge(iso) {
  const dt = parseISODate(iso);
  const age = daysSince(dt);

  if (age === null) {
    return `<span class="badge badge--unknown">NO DATE</span>`;
  }

  if (age <= 7) {
    return `<span class="badge badge--fresh">FRESH</span>`;
  }
  if (age <= 30) {
    return `<span class="badge badge--stale">STALE</span>`;
  }
  return `<span class="badge badge--old">OLD</span>`;
}

function cardHTML({ title, metaLeft, metaRight, body }) {
  return `
    <div class="history__item">
      <div class="history__meta">
        <span>${escapeHtml(metaLeft)}</span>
        <span>${metaRight}</span>
      </div>
      <div class="history__text"><b>${escapeHtml(title)}</b><br>${escapeHtml(body)}</div>
    </div>
  `;
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
    ? defs
        .map((d) =>
          cardHTML({
            title: d.term,
            metaLeft: "Definition",
            metaRight: `<span class="badge badge--info">INFO</span>`,
            body: d.meaning,
          })
        )
        .join("")
    : `<div class="muted">No definitions found.</div>`;

  // Factions
  let items = (DATA.foreignAffairs || [])
    .filter((x) => matchesStatusFilter(x.status, f))
    .filter((x) =>
      matchesQuery(
        `${x.name} ${x.status} ${x.notes ?? ""} ${x.owner ?? ""} ${x.asOf ?? ""}`,
        q
      )
    );

  if (sortMode === "name") {
    items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (sortMode === "updated") {
    // newest (lowest age) first, unknown last
    items.sort((a, b) => {
      const da = daysSince(parseISODate(a.asOf));
      const db = daysSince(parseISODate(b.asOf));
      if (da === null && db === null) return (a.name || "").localeCompare(b.name || "");
      if (da === null) return 1;
      if (db === null) return -1;
      if (da !== db) return da - db;
      return (a.name || "").localeCompare(b.name || "");
    });
  } else {
    // default: by status then name
    items.sort((a, b) => {
      const so = statusOrder(a.status) - statusOrder(b.status);
      if (so !== 0) return so;
      return (a.name || "").localeCompare(b.name || "");
    });
  }

  foreignResults.innerHTML = items.length
    ? items
        .map((x) => {
          const statusUpper = String(x.status || "").toUpperCase();
          const metaRight = `
            ${freshnessBadge(x.asOf)}
            <span class="badge badge--status">${escapeHtml(statusUpper)}</span>
          `;

          const bodyLines = [];
          bodyLines.push(formatAsOf(x.asOf));
          if (x.owner) bodyLines.push(`Owner/Ref: ${x.owner}`);
          if (x.notes) bodyLines.push(x.notes);

          return cardHTML({
            title: x.name,
            metaLeft: "Faction Record",
            metaRight,
            body: bodyLines.join("\n"),
          });
        })
        .join("")
    : `<div class="muted">No matches.</div>`;
}

async function init() {
  loadTheme();

  DATA = await fetchJson("./data/foreign-affairs.json");

  if (asOfText) {
    asOfText.textContent = "Per-entry dates enabled";
  }
  if (noteBox) {
    noteBox.textContent = DATA.note || "";
  }

  [searchEl, filterEl, sortEl].forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  render();
}

init().catch(() => {
  foreignResults.innerHTML = `<div class="muted">Failed to load data files.</div>`;
});
