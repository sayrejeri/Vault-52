// theme.js — shared theme toggle for all pages
(() => {
  const THEME_KEY = "v52_theme";
  const btn = document.getElementById("toggleThemeBtn");

  function applyTheme(theme) {
    document.body.dataset.theme = theme; // "green" or "amber"
    localStorage.setItem(THEME_KEY, theme);

    // Button shows what you'll switch TO
    if (btn) btn.textContent = theme === "amber" ? "Green" : "Amber";
  }

  // Apply saved theme immediately
  const saved = localStorage.getItem(THEME_KEY) || "green";
  applyTheme(saved);

  // Wire toggle if button exists on this page
  if (btn) {
    btn.addEventListener("click", () => {
      const current = localStorage.getItem(THEME_KEY) || "green";
      applyTheme(current === "green" ? "amber" : "green");
    });
  }
})();
