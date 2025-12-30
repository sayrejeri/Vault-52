/* Vault 52 Security Terminal (PWA)
   - LocalStorage: username, rank, timezone, theme
   - Patrol timer with start/end stamps + duration
   - Generates formatted log blocks for Discord
   - Copy + export + history
*/

const $ = (id) => document.getElementById(id);

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./rules.html",
  "./rules.js",
  "./data/foreign-affairs.json",
  "./manifest.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg"
];

const usernameEl = $("username");
const rankEl = $("rank");
const timezoneEl = $("timezone");
const logTypeEl = $("logType");

const patrolSection = $("patrolSection");
const backupSection = $("backupSection");
const inactivitySection = $("inactivitySection");
const dischargeSection = $("dischargeSection");
const ammoSection = $("ammoSection");

const timerText = $("timerText");
const startStamp = $("startStamp");
const endStamp = $("endStamp");
const startBtn = $("startBtn");
const endBtn = $("endBtn");
const resetBtn = $("resetBtn");

const patrolNotes = $("patrolNotes");
const taskList = $("taskList");

const backupPriority = $("backupPriority");
const backupNotes = $("backupNotes");

const inactivityLength = $("inactivityLength");
const inactivityReason = $("inactivityReason");

const dischargeDate = $("dischargeDate");
const dischargeReason = $("dischargeReason");

const ammoReason = $("ammoReason");
const ammoCurrentProof = $("ammoCurrentProof");
const ammoBullets = $("ammoBullets");
const ammoCells = $("ammoCells");
const ammoNote = $("ammoNote");

const generateBtn = $("generateBtn");
const outputEl = $("output");
const copyBtn = $("copyBtn");
const exportBtn = $("exportBtn");

const historyEl = $("history");
const clearHistoryBtn = $("clearHistoryBtn");
const clearSavedBtn = $("clearSavedBtn");

const toastEl = $("toast");
const installBtn = $("installBtn");
const toggleThemeBtn = $("toggleThemeBtn");

let timerInterval = null;
let patrolStartMs = null;
let patrolEndMs = null;

const LS_KEYS = {
  username: "v52_username",
  rank: "v52_rank",
  tz: "v52_timezone",
  theme: "v52_theme",
  history: "v52_history",
  patrol: "v52_patrol_state"
};

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  setTimeout(() => { toastEl.hidden = true; }, 1400);
}

function pad2(n){ return String(n).padStart(2, "0"); }

function msToHMS(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function fmtLocalTime(ms, tzLabel) {
  const d = new Date(ms);
  // Keep it simple: local time string + user-provided label
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  const mo = pad2(d.getMonth() + 1);
  const da = pad2(d.getDate());
  const yr = d.getFullYear();
  const tz = (tzLabel || "").trim();
  return `${mo}/${da}/${yr} ${hh}:${mm}:${ss}${tz ? ` ${tz}` : ""}`;
}

function saveBasics() {
  localStorage.setItem(LS_KEYS.username, usernameEl.value.trim());
  localStorage.setItem(LS_KEYS.rank, rankEl.value);
  localStorage.setItem(LS_KEYS.tz, timezoneEl.value.trim());
}

function loadBasics() {
  usernameEl.value = localStorage.getItem(LS_KEYS.username) || "";
  rankEl.value = localStorage.getItem(LS_KEYS.rank) || "";
  timezoneEl.value = localStorage.getItem(LS_KEYS.tz) || "EST";
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem(LS_KEYS.theme, theme);
  toggleThemeBtn.textContent = theme === "amber" ? "Green" : "Amber";
}

function loadTheme() {
  const theme = localStorage.getItem(LS_KEYS.theme) || "green";
  setTheme(theme);
}

function modeSwitch(type) {
  patrolSection.classList.toggle("hidden", type !== "patrol");
  backupSection.classList.toggle("hidden", type !== "backup");
  inactivitySection.classList.toggle("hidden", type !== "inactivity");
  dischargeSection.classList.toggle("hidden", type !== "discharge");
  ammoSection.classList.toggle("hidden", type !== "ammo");
}

function getSelectedTasks() {
  const checked = [...taskList.querySelectorAll("input[type=checkbox]:checked")];
  return checked.map(x => x.value);
}

function clampNumber(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.min(max, Math.max(min, n));
}

function ensureAmmoLimits() {
  ammoBullets.value = String(clampNumber(ammoBullets.value, 0, 1500));
  ammoCells.value = String(clampNumber(ammoCells.value, 0, 500));
}

function validateBasics() {
  const u = usernameEl.value.trim();
  const r = rankEl.value.trim();
  if (!u) return "Username (In-game @) is required.";
  if (!r) return "Security Rank is required.";
  return null;
}

function generateOutput() {
  const err = validateBasics();
  if (err) {
    showToast(err);
    return;
  }

  saveBasics();

  const type = logTypeEl.value;
  const username = usernameEl.value.trim();
  const rank = rankEl.value.trim();

  let text = "";

  if (type === "patrol") {
    const tz = timezoneEl.value.trim();
    const duration = msToHMS((patrolEndMs ?? Date.now()) - (patrolStartMs ?? Date.now()));
    const tasks = getSelectedTasks();
    const notes = patrolNotes.value.trim();

    text += `Username (In-game @): ${username}\n`;
    text += `Security Rank: ${rank}\n`;
    text += `Patrol Duration: ${duration}\n`;

    if (patrolStartMs) text += `Time Started: ${fmtLocalTime(patrolStartMs, tz)}\n`;
    if (patrolEndMs) text += `Time Ended: ${fmtLocalTime(patrolEndMs, tz)}\n`;

    if (tasks.length) {
      text += `Notes:\n`;
      text += `- Tasks: ${tasks.join("; ")}\n`;
      if (notes) text += `- Details: ${notes}\n`;
    } else if (notes) {
      text += `Notes: ${notes}\n`;
    } else {
      text += `Notes: (Optional)\n`;
    }

    text += `Proof: [2 screenshots (start/end) OR !STOPWATCH]\n`;

  } else if (type === "backup") {
    const pr = backupPriority.value.trim();
    const notes = backupNotes.value.trim();

    text += `Username (In-game @): ${username}\n`;
    text += `Priority: ${pr || "—"}\n`;
    text += `Additional Notes: ${notes || "—"}\n`;
    text += `@Backup Request\n`;
    text += `Priority Key: Medium threat level: 3-4 raiders / High threat level: 5+ Raiders\n`;

  } else if (type === "inactivity") {
    const len = inactivityLength.value.trim();
    const reason = inactivityReason.value.trim();

    text += `Username (In-game @): ${username}\n`;
    text += `Security Rank: ${rank}\n`;
    text += `Length of Inactivity: ${len || "—"}\n`;
    if (reason) text += `Reason: ${reason}\n`;

  } else if (type === "discharge") {
    const date = dischargeDate.value;
    const reason = dischargeReason.value.trim();

    text += `Username (In-game @): ${username}\n`;
    text += `Security Rank: ${rank}\n`;
    text += `Date of Discharge: ${date || "—"}\n`;
    text += `Reason: ${reason || "—"}\n`;

  } else if (type === "ammo") {
    ensureAmmoLimits();
    const reason = ammoReason.value.trim();
    const proof = ammoCurrentProof.value.trim();
    const bullets = ammoBullets.value.trim() || "0";
    const cells = ammoCells.value.trim() || "0";
    const note = ammoNote.value.trim();

    text += `Name: ${username}\n`;
    text += `Rank: ${rank}\n`;
    text += `Reason for Request: ${reason || "—"}\n`;
    text += `Current Bullet Count: ${proof || "(show picture proof)"}\n`;
    text += `Amount Requesting: ${bullets} Bullets, ${cells} Fusion Cells\n`;
    text += `Note: ${note || "—"}\n`;
    text += `Limit 1.5k Bullets, and 500 Fusion Cells\n`;
  }

  outputEl.textContent = text.trim();
  addToHistory(type, text.trim());
}

function addToHistory(type, text) {
  const entry = {
    id: crypto.randomUUID(),
    type,
    ts: Date.now(),
    text
  };
  const arr = getHistory();
  arr.unshift(entry);
  // keep last 20
  const trimmed = arr.slice(0, 20);
  localStorage.setItem(LS_KEYS.history, JSON.stringify(trimmed));
  renderHistory();
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEYS.history) || "[]");
  } catch {
    return [];
  }
}

function renderHistory() {
  const arr = getHistory();
  if (!arr.length) {
    historyEl.innerHTML = `<div class="muted">No submissions yet.</div>`;
    return;
  }

  historyEl.innerHTML = arr.map(e => {
    const d = new Date(e.ts);
    const stamp = `${pad2(d.getMonth()+1)}/${pad2(d.getDate())}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    const typeLabel = ({
      patrol: "Patrol",
      backup: "Backup",
      inactivity: "Inactivity",
      discharge: "Discharge",
      ammo: "Ammo"
    })[e.type] || e.type;

    return `
      <div class="history__item">
        <div class="history__meta">
          <span>${typeLabel}</span>
          <span>${stamp}</span>
        </div>
        <div class="history__text">${escapeHtml(e.text)}</div>
        <div class="row" style="margin-top:8px">
          <button class="btn btn--ghost" data-action="use" data-id="${e.id}">Use</button>
          <button class="btn btn--ghost" data-action="copy" data-id="${e.id}">Copy</button>
        </div>
      </div>
    `;
  }).join("");
}

function escapeHtml(s) {
  return s
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

historyEl.addEventListener("click", async (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  const arr = getHistory();
  const entry = arr.find(x => x.id === id);
  if (!entry) return;

  if (action === "use") {
    outputEl.textContent = entry.text;
    showToast("Loaded from history.");
  } else if (action === "copy") {
    await navigator.clipboard.writeText(entry.text);
    showToast("Copied.");
  }
});

async function copyOutput() {
  const text = outputEl.textContent.trim();
  if (!text || text.startsWith("Ready to format")) {
    showToast("Nothing to copy yet.");
    return;
  }
  await navigator.clipboard.writeText(text);
  showToast("Copied.");
}

function exportTxt() {
  const text = outputEl.textContent.trim();
  if (!text || text.startsWith("Ready to format")) {
    showToast("Nothing to export yet.");
    return;
  }
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `v52-log-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function resetPatrol() {
  patrolStartMs = null;
  patrolEndMs = null;
  timerText.textContent = "00:00:00";
  startStamp.textContent = "—";
  endStamp.textContent = "—";
  endBtn.disabled = true;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // clear tasks/notes
  [...taskList.querySelectorAll("input[type=checkbox]")].forEach(x => x.checked = false);
  patrolNotes.value = "";

  localStorage.removeItem(LS_KEYS.patrol);
  showToast("Patrol reset.");
}

function persistPatrolState() {
  const state = {
    patrolStartMs,
    patrolEndMs
  };
  localStorage.setItem(LS_KEYS.patrol, JSON.stringify(state));
}

function loadPatrolState() {
  try {
    const state = JSON.parse(localStorage.getItem(LS_KEYS.patrol) || "null");
    if (!state) return;
    patrolStartMs = state.patrolStartMs ?? null;
    patrolEndMs = state.patrolEndMs ?? null;

    // If patrol started but not ended, resume ticking
    if (patrolStartMs && !patrolEndMs) {
      startStamp.textContent = fmtLocalTime(patrolStartMs, timezoneEl.value.trim());
      endStamp.textContent = "—";
      endBtn.disabled = false;
      startTimerTick();
    } else if (patrolStartMs && patrolEndMs) {
      startStamp.textContent = fmtLocalTime(patrolStartMs, timezoneEl.value.trim());
      endStamp.textContent = fmtLocalTime(patrolEndMs, timezoneEl.value.trim());
      timerText.textContent = msToHMS(patrolEndMs - patrolStartMs);
      endBtn.disabled = true;
    }
  } catch {
    // ignore
  }
}

function startTimerTick() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!patrolStartMs) return;
    timerText.textContent = msToHMS(Date.now() - patrolStartMs);
  }, 250);
}

function startPatrol() {
  if (timerInterval) clearInterval(timerInterval);

  patrolStartMs = Date.now();
  patrolEndMs = null;

  startStamp.textContent = fmtLocalTime(patrolStartMs, timezoneEl.value.trim());
  endStamp.textContent = "—";
  endBtn.disabled = false;

  startTimerTick();
  persistPatrolState();
  showToast("Patrol started.");
}

function endPatrol() {
  if (!patrolStartMs) {
    showToast("Start patrol first.");
    return;
  }

  patrolEndMs = Date.now();
  endStamp.textContent = fmtLocalTime(patrolEndMs, timezoneEl.value.trim());

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  timerText.textContent = msToHMS(patrolEndMs - patrolStartMs);
  endBtn.disabled = true;

  persistPatrolState();
  showToast("Patrol ended. Generate output.");
}

function clearSaved() {
  localStorage.removeItem(LS_KEYS.username);
  localStorage.removeItem(LS_KEYS.rank);
  localStorage.removeItem(LS_KEYS.tz);
  loadBasics();
  showToast("Saved settings cleared.");
}

function clearHistory() {
  localStorage.removeItem(LS_KEYS.history);
  renderHistory();
  showToast("History cleared.");
}

/* Theme toggle */
toggleThemeBtn.addEventListener("click", () => {
  const current = localStorage.getItem(LS_KEYS.theme) || "green";
  setTheme(current === "green" ? "amber" : "green");
});

/* Save on change */
[usernameEl, rankEl, timezoneEl].forEach(el => {
  el.addEventListener("change", saveBasics);
  el.addEventListener("input", saveBasics);
});

/* Mode switching */
logTypeEl.addEventListener("change", () => modeSwitch(logTypeEl.value));

/* Patrol controls */
startBtn.addEventListener("click", startPatrol);
endBtn.addEventListener("click", endPatrol);
resetBtn.addEventListener("click", resetPatrol);

/* Generate & output actions */
generateBtn.addEventListener("click", generateOutput);
copyBtn.addEventListener("click", copyOutput);
exportBtn.addEventListener("click", exportTxt);

clearHistoryBtn.addEventListener("click", clearHistory);
clearSavedBtn.addEventListener("click", clearSaved);

/* Ammo limit enforcement */
[ammoBullets, ammoCells].forEach(el => el.addEventListener("change", ensureAmmoLimits));

/* PWA install */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

/* Service worker */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

/* Init */
loadTheme();
loadBasics();
modeSwitch(logTypeEl.value);
renderHistory();
loadPatrolState();
