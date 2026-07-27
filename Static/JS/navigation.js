/* ============================================================
   NAVIGATION
   Mobile menu toggle, scroll-spy active link, scroll progress,
   back-to-top button.
   ============================================================ */

const Navigation = (() => {

  function initMobileToggle() {
    const toggle = document.getElementById("nav-toggle");
    const links = document.getElementById("nav-links-list");
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
      const open = links.classList.contains("open");
      toggle.querySelector(".material-symbols-outlined").textContent = open ? "close" : "menu";
    });
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.querySelector(".material-symbols-outlined").textContent = "menu";
      }
    });
  }

  function initTemplateDropdown() {
    const wrap = document.getElementById("template-select");
    const btn = document.getElementById("template-btn");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      wrap.classList.toggle("open");
    });
    document.addEventListener("click", () => wrap.classList.remove("open"));
  }

  function initScrollSpy() {
    const sections = [...document.querySelectorAll("section[id]")];
    const links = () => [...document.querySelectorAll("#nav-links-list a")];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links().forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
        }
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

    sections.forEach(s => observer.observe(s));
  }

  function initScrollProgressAndBackToTop() {
    const bar = document.getElementById("scroll-progress");
    const backBtn = document.getElementById("back-to-top");

    function onScroll() {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = `${scrolled}%`;
      backBtn.classList.toggle("show", h.scrollTop > 500);
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    backBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    onScroll();
  }

  function init() {
    initMobileToggle();
    initTemplateDropdown();
    initScrollSpy();
    initScrollProgressAndBackToTop();
  }

  return { init };
})();
