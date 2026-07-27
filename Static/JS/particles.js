/* ============================================================
   PARTICLES
   Lightweight canvas starfield. Density scales with viewport
   size; gently reacts to mouse position for depth/parallax.
   ============================================================ */

const Particles = (() => {
  let canvas, ctx, stars = [];
  let w, h, mouseX = 0, mouseY = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let colorSets = {
    dark:  ["rgba(255,255,255,0.9)", "rgba(255,122,41,0.8)", "rgba(53,208,127,0.8)", "rgba(244,201,93,0.8)"],
    light: ["rgba(20,20,20,0.35)", "rgba(255,122,41,0.55)", "rgba(53,208,127,0.5)", "rgba(244,201,93,0.55)"]
  };
  let palette = colorSets.dark;

  function starCount() {
    const area = w * h;
    const density = area < 500000 ? 1 / 5500 : 1 / 9000;
    return Math.min(Math.floor(area * density), 220);
  }

  function makeStars() {
    const count = starCount();
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      baseX: 0, baseY: 0,
      speed: Math.random() * 0.15 + 0.02,
      twinkle: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)]
    }));
    stars.forEach(s => { s.baseX = s.x; s.baseY = s.y; });
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    makeStars();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const parallaxX = (mouseX - w / 2) / w;
    const parallaxY = (mouseY - h / 2) / h;

    stars.forEach(s => {
      s.twinkle += 0.02;
      const alpha = 0.5 + Math.sin(s.twinkle) * 0.5;
      s.x = s.baseX + parallaxX * 18 * s.r;
      s.y = s.baseY + parallaxY * 18 * s.r + Math.sin(s.twinkle * 0.3) * 4;

      ctx.beginPath();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s.color;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  function setPalette() {
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    palette = colorSets[theme] || colorSets.dark;
    makeStars();
  }

  function init() {
    canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    resize();
    setPalette();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    document.addEventListener("themechange", setPalette);

    draw();
    if (reduceMotion) {
      // Draw a single static frame instead of animating.
      draw();
    }
  }

  return { init };
})();
