/* ============================================================
   ANIMATIONS
   IntersectionObserver-based reveal, subtle card tilt on hover,
   optional custom cursor on desktop, hero role-line typewriter.
   ============================================================ */

const Animations = (() => {
  const isTouch = matchMedia("(hover: none)").matches;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    const targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(t => obs.observe(t));
  }

  // Re-observe newly rendered nodes (projects re-render on filter click).
  function observeNew(selector) {
    const obs = new MutationObserver(() => {
      document.querySelectorAll(`${selector} [data-reveal]:not(.in)`).forEach(el => el.classList.add("in"));
    });
    const target = document.querySelector(selector);
    if (target) obs.observe(target, { childList: true });
  }

  function initTilt() {
    if (isTouch || reduceMotion) return;
    document.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".project-card.tilt");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    document.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".project-card.tilt");
      if (card) card.style.transform = "";
    }, true);
  }

  function initCursor() {
    if (isTouch) return;
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;
    let rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      dot.style.left = `${e.clientX}px`; dot.style.top = `${e.clientY}px`;
      rx = e.clientX; ry = e.clientY;
    });
    function loop() {
      const cur = ring.getBoundingClientRect();
      const curX = parseFloat(ring.style.left) || rx;
      const curY = parseFloat(ring.style.top) || ry;
      const nx = curX + (rx - curX) * 0.18;
      const ny = curY + (ry - curY) * 0.18;
      ring.style.left = `${nx}px`; ring.style.top = `${ny}px`;
      requestAnimationFrame(loop);
    }
    loop();
    document.addEventListener("mouseover", (e) => {
      ring.style.width = e.target.closest("a,button") ? "50px" : "34px";
      ring.style.height = e.target.closest("a,button") ? "50px" : "34px";
    });
  }

  function initHeroTypewriter() {
    const el = document.getElementById("hero-role-text");
    if (!el) return;
    const lines = JSON.parse(el.dataset.lines || "[]");
    if (!lines.length) return;
    let li = 0, ci = 0, deleting = false;

    function tick() {
      const word = lines[li];
      if (!deleting) {
        ci++;
        el.textContent = word.slice(0, ci);
        if (ci === word.length) { deleting = true; setTimeout(tick, 1200); return; }
      } else {
        ci--;
        el.textContent = word.slice(0, ci);
        if (ci === 0) { deleting = false; li = (li + 1) % lines.length; }
      }
      setTimeout(tick, deleting ? 40 : 80);
    }
    tick();
  }

  function hidePreloader() {
    const pre = document.getElementById("preloader");
    if (!pre) return;
    setTimeout(() => pre.classList.add("hidden"), 400);
  }

  function init() {
    initReveal();
    observeNew("#projects-grid");
    initTilt();
    initCursor();
    initHeroTypewriter();
    hidePreloader();
  }

  return { init };
})();
