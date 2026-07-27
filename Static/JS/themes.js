/* ============================================================
   THEMES & TEMPLATES
   Handles dark/light mode and the 4 visual templates.
   Both choices persist in localStorage.
   ============================================================ */

const Themes = (() => {
  const THEME_KEY = "portfolio:theme";
  const TEMPLATE_KEY = "portfolio:template";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  function applyTemplate(id) {
    document.body.setAttribute("data-template", id);
    localStorage.setItem(TEMPLATE_KEY, id);
    document.querySelectorAll("#template-menu button").forEach(b => {
      b.classList.toggle("active", b.dataset.templateChoice === id);
    });
    document.querySelectorAll(".section[data-page]").forEach((s, i) => s.setAttribute("data-page", `— ${i + 1} —`));
    document.dispatchEvent(new CustomEvent("templatechange", { detail: { id } }));
  }

  function initThemeToggle() {
    const saved = localStorage.getItem(THEME_KEY) ||
      (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    applyTheme(saved);

    document.getElementById("theme-toggle").addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  function initTemplateSwitch() {
    const saved = localStorage.getItem(TEMPLATE_KEY) || "default";
    applyTemplate(saved);

    document.getElementById("template-menu").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-template-choice]");
      if (!btn) return;
      applyTemplate(btn.dataset.templateChoice);
      document.getElementById("template-select").classList.remove("open");
    });
  }

  function init() {
    initThemeToggle();
    initTemplateSwitch();
  }

  return { init };
})();
