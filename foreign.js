const DATA_URL = "./data/foreign-affairs.json";

const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
const sortSelect = document.getElementById("sort");

const foreignResults = document.getElementById("foreignResults");
const definitionResults = document.getElementById("definitionResults");

/* ---------- Date + freshness helpers ---------- */

function daysBetween(dateStr){
  if(!dateStr) return null;
  const then = new Date(dateStr);
  if (isNaN(then)) return null;
  const now = new Date();
  const diff = Math.floor((now - then) / (1000 * 60 * 60 * 24));
  return diff;
}

function freshnessBadge(days){
  if(days === null) return `<span class="badge badge--unknown">UNKNOWN</span>`;
  if(days <= 7) return `<span class="badge badge--fresh">FRESH</span>`;
  if(days <= 30) return `<span class="badge badge--stale">STALE</span>`;
  return `<span class="badge badge--old">OLD</span>`;
}

function formatDate(dateStr){
  if(!dateStr) return "Unknown";
  const d = new Date(dateStr);
  if(isNaN(d)) return "Unknown";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

/* ---------- Rendering ---------- */

let DATA = null;

function renderDefinitions(defs){
  definitionResults.innerHTML = "";
  defs.forEach(d => {
    const el = document.createElement("div");
    el.className = "history__item";
    el.innerHTML = `
      <div class="history__meta">
        <strong>${d.term}</strong>
      </div>
      <div class="history__text">${d.meaning}</div>
    `;
    definitionResults.appendChild(el);
  });
}

function renderFactions(){
  const q = searchInput.value.toLowerCase();
  const filter = filterSelect.value;
  const sort = sortSelect.value;

  let list = [...DATA.foreignAffairs];

  /* filter */
  if(filter !== "any"){
    list = list.filter(f => f.status.toLowerCase() === filter);
  }

  /* search */
  if(q){
    list = list.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.owner || "").toLowerCase().includes(q) ||
      (f.notes || "").toLowerCase().includes(q)
    );
  }

  /* sort */
  if(sort === "name"){
    list.sort((a,b) => a.name.localeCompare(b.name));
  }
  else if(sort === "updated"){
    list.sort((a,b) => {
      const da = daysBetween(a.asOf);
      const db = daysBetween(b.asOf);
      if(da === null && db === null) return 0;
      if(da === null) return 1;
      if(db === null) return -1;
      return da - db; // most recent first
    });
  }
  else {
    const order = { allied:1, neutral:2, hostile:3, enemy:4 };
    list.sort((a,b) =>
      (order[a.status.toLowerCase()] || 99) -
      (order[b.status.toLowerCase()] || 99)
    );
  }

  foreignResults.innerHTML = "";

  list.forEach(f => {
    const days = daysBetween(f.asOf);
    const item = document.createElement("div");
    item.className = "history__item";

    item.innerHTML = `
      <div class="history__meta">
        <span>
          <strong>${f.name}</strong>
          ${f.owner ? ` — ${f.owner}` : ""}
        </span>
        <span>
          <span class="badge badge--status">${f.status.toUpperCase()}</span>
          ${freshnessBadge(days)}
        </span>
      </div>

      <div class="history__text">
        <strong>As of:</strong> ${formatDate(f.asOf)}
        ${f.notes ? `<br><strong>Notes:</strong> ${f.notes}` : ""}
      </div>
    `;

    foreignResults.appendChild(item);
  });
}

/* ---------- Load + Events ---------- */

fetch(DATA_URL)
  .then(r => r.json())
  .then(json => {
    DATA = json;
    renderDefinitions(DATA.definitions || []);
    renderFactions();
  });

searchInput.addEventListener("input", renderFactions);
filterSelect.addEventListener("change", renderFactions);
sortSelect.addEventListener("change", renderFactions);
