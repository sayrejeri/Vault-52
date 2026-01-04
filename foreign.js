const DATA_URL = "./data/foreign-affairs.json";

const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
const sortSelect = document.getElementById("sort");

const foreignResults = document.getElementById("foreignResults");
const definitionResults = document.getElementById("definitionResults");
const noteBox = document.getElementById("noteBox");
const asOfText = document.getElementById("asOfText");

/* ---------- helpers ---------- */

function esc(s){
  return (s ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function parseDate(dateStr){
  if(!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
}

function daysSince(dateStr){
  const d = parseDate(dateStr);
  if(!d) return null;
  const now = new Date();
  // compare in UTC midnight-ish to avoid timezone weirdness
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dateUTC  = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((todayUTC - dateUTC) / 86400000);
}

function freshnessBadge(days){
  if(days === null) return `<span class="badge badge--unknown">NO DATE</span>`;
  if(days <= 7) return `<span class="badge badge--fresh">FRESH</span>`;
  if(days <= 30) return `<span class="badge badge--stale">STALE</span>`;
  return `<span class="badge badge--old">OLD</span>`;
}

function formatAsOf(dateStr){
  const d = parseDate(dateStr);
  if(!d) return "As of: Unknown";
  return `As of: ${d.toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" })}`;
}

function statusLabel(status){
  const s = (status || "").toLowerCase();
  if(s === "enemy") return "ENEMIES";
  return s.toUpperCase();
}

function normalizeStatus(status){
  // Accept legacy capitalized values if they exist in older data
  return (status || "").toString().trim().toLowerCase();
}

function statusOrder(status){
  const s = normalizeStatus(status);
  // ordering similar to how people scan: allied/neutral/hostile/enemy
  if(s === "allied") return 1;
  if(s === "neutral") return 2;
  if(s === "hostile") return 3;
  if(s === "enemy") return 4;
  return 99;
}

/* ---------- render ---------- */

let DATA = null;

function renderDefinitions(defs){
  definitionResults.innerHTML = "";

  (defs || []).forEach(d => {
    const item = document.createElement("div");
    item.className = "history__item";
    item.innerHTML = `
      <div class="history__meta">
        <span>Definition</span>
        <span class="badge badge--info">INFO</span>
      </div>
      <div class="history__text"><b>${esc(d.term)}</b><br>${esc(d.meaning)}</div>
    `;
    definitionResults.appendChild(item);
  });

  if(!(defs || []).length){
    definitionResults.innerHTML = `<div class="muted">No definitions found.</div>`;
  }
}

function renderFactions(){
  const q = (searchInput.value || "").trim().toLowerCase();
  const filter = filterSelect.value; // any/allied/neutral/hostile/enemy
  const sort = sortSelect.value; // status/name/updated

  let list = (DATA.foreignAffairs || []).map(f => ({
    ...f,
    status: normalizeStatus(f.status)
  }));

  // filter
  if(filter !== "any"){
    list = list.filter(f => f.status === filter);
  }

  // search
  if(q){
    list = list.filter(f => {
      const blob = `${f.name} ${f.owner || ""} ${f.notes || ""} ${f.status} ${f.asOf || ""}`.toLowerCase();
      return blob.includes(q);
    });
  }

  // sort
  if(sort === "name"){
    list.sort((a,b) => (a.name || "").localeCompare(b.name || ""));
  } else if(sort === "updated") {
    // most recent first: smaller daysSince => newer
    list.sort((a,b) => {
      const da = daysSince(a.asOf);
      const db = daysSince(b.asOf);
      if(da === null && db === null) return (a.name || "").localeCompare(b.name || "");
      if(da === null) return 1;
      if(db === null) return -1;
      if(da !== db) return da - db;
      return (a.name || "").localeCompare(b.name || "");
    });
  } else {
    list.sort((a,b) => {
      const o = statusOrder(a.status) - statusOrder(b.status);
      if(o !== 0) return o;
      return (a.name || "").localeCompare(b.name || "");
    });
  }

  foreignResults.innerHTML = "";

  if(!list.length){
    foreignResults.innerHTML = `<div class="muted">No matches.</div>`;
    return;
  }

  list.forEach(f => {
    const days = daysSince(f.asOf);
    const badge = freshnessBadge(days);

    const metaRight = `
      <span class="badge badge--status">${statusLabel(f.status)}</span>
      ${badge}
    `;

    const bodyLines = [];
    bodyLines.push(formatAsOf(f.asOf));
    if(f.owner) bodyLines.push(`Owner/Ref: ${f.owner}`);
    if(f.notes) bodyLines.push(f.notes);

    const item = document.createElement("div");
    item.className = "history__item";
    item.innerHTML = `
      <div class="history__meta">
        <span>Faction Record</span>
        <span>${metaRight}</span>
      </div>
      <div class="history__text"><b>${esc(f.name)}</b><br>${esc(bodyLines.join("\n"))}</div>
    `;
    foreignResults.appendChild(item);
  });
}

/* ---------- load ---------- */

fetch(DATA_URL, { cache: "no-cache" })
  .then(r => r.json())
  .then(json => {
    DATA = json;

    if(asOfText) asOfText.textContent = "Per-entry “As of” • Freshness indicators enabled";
    if(noteBox) noteBox.textContent = DATA.note || "";

    renderDefinitions(DATA.definitions);
    renderFactions();
  })
  .catch(() => {
    if(asOfText) asOfText.textContent = "Failed to load data";
    foreignResults.innerHTML = `<div class="muted">Failed to load Foreign Affairs data.</div>`;
  });

searchInput.addEventListener("input", () => renderFactions());
filterSelect.addEventListener("change", () => renderFactions());
sortSelect.addEventListener("change", () => renderFactions());
