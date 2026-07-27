/* ============================================================
   THREE-SCENE
   The hero's signature 3D element: a wireframe icosahedron
   "core" with small glowing nodes orbiting it, representing
   the developer's stack orbiting a central system. Falls back
   to a CSS-only rotating cube if Three.js can't load (e.g. no
   network access), so the hero never breaks.
   ============================================================ */

const ThreeScene = (() => {
  let renderer, scene, camera, core, group, nodes = [];
  let mount, rafId;
  let targetRotX = 0, targetRotY = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function colorForTheme() {
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    return {
      core: theme === "dark" ? 0xff7a29 : 0xd9691f,
      node: [0x35d07f, 0xf4c95d, 0xff7a29],
      bg: null
    };
  }

  function buildScene() {
    const THREE = window.THREE;
    const width = mount.clientWidth, height = mount.clientHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const colors = colorForTheme();
    group = new THREE.Group();
    scene.add(group);

    // Core wireframe icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(2, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: colors.core, wireframe: true, transparent: true, opacity: 0.85 });
    core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Inner glow sphere
    const glowGeo = new THREE.IcosahedronGeometry(1.4, 1);
    const glowMat = new THREE.MeshBasicMaterial({ color: colors.node[1], wireframe: true, transparent: true, opacity: 0.25 });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    // Orbiting nodes
    const nodeGeo = new THREE.SphereGeometry(0.11, 12, 12);
    const orbitCount = 8;
    for (let i = 0; i < orbitCount; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: colors.node[i % colors.node.length] });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      const radius = 3 + (i % 3) * 0.4;
      const speed = 0.4 + Math.random() * 0.5;
      const offset = Math.random() * Math.PI * 2;
      const tilt = (Math.random() - 0.5) * 1.4;
      nodes.push({ mesh, radius, speed, offset, tilt });
      scene.add(mesh);

      // faint orbit ring
      const ringGeo = new THREE.RingGeometry(radius - 0.004, radius + 0.004, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: colors.core, side: THREE.DoubleSide, transparent: true, opacity: 0.08 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + tilt;
      scene.add(ring);
    }

    mount.addEventListener("mousemove", (e) => {
      const rect = mount.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.6;
      targetRotX = y * 0.4;
    });
  }

  function tick(t) {
    if (!renderer) return;
    core.rotation.y += 0.003;
    core.rotation.x += 0.0012;

    group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
    group.rotation.x += (targetRotX - group.rotation.x) * 0.04;

    nodes.forEach(n => {
      const angle = t * 0.001 * n.speed + n.offset;
      n.mesh.position.set(
        Math.cos(angle) * n.radius,
        Math.sin(angle) * n.radius * Math.sin(n.tilt + 1),
        Math.sin(angle) * n.radius * Math.cos(n.tilt + 1)
      );
    });

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }

  function onResize() {
    if (!renderer || !mount) return;
    const width = mount.clientWidth, height = mount.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function fallback() {
    mount.classList.add("css3d-fallback");
    mount.innerHTML = `
      <div class="css3d-stage">
        <div class="css3d-cube">
          <div class="face front"></div><div class="face back"></div>
          <div class="face right"></div><div class="face left"></div>
          <div class="face top"></div><div class="face bottom"></div>
        </div>
      </div>`;
    if (!document.getElementById("css3d-style")) {
      const style = document.createElement("style");
      style.id = "css3d-style";
      style.textContent = `
        .css3d-fallback{ display:flex; align-items:center; justify-content:center; perspective: 900px; }
        .css3d-stage{ transform-style: preserve-3d; }
        .css3d-cube{
          width:160px; height:160px; position:relative; transform-style:preserve-3d;
          animation: cubeSpin 12s linear infinite;
        }
        .css3d-cube .face{
          position:absolute; width:160px; height:160px;
          border:1px solid var(--orange); background: rgba(255,122,41,0.08);
          box-shadow: 0 0 30px rgba(255,122,41,.15) inset;
        }
        .face.front{ transform: translateZ(80px); }
        .face.back{ transform: translateZ(-80px) rotateY(180deg); }
        .face.right{ transform: rotateY(90deg) translateZ(80px); border-color: var(--green); }
        .face.left{ transform: rotateY(-90deg) translateZ(80px); border-color: var(--green); }
        .face.top{ transform: rotateX(90deg) translateZ(80px); border-color: var(--yellow); }
        .face.bottom{ transform: rotateX(-90deg) translateZ(80px); border-color: var(--yellow); }
        @keyframes cubeSpin{ from{ transform: rotateX(0) rotateY(0);} to{ transform: rotateX(360deg) rotateY(360deg);} }
      `;
      document.head.appendChild(style);
    }
  }

  function rebuild() {
    if (rafId) cancelAnimationFrame(rafId);
    if (renderer) {
      renderer.dispose();
      mount.innerHTML = "";
    }
    nodes = [];
    buildScene();
    rafId = requestAnimationFrame(tick);
  }

  function init() {
    mount = document.getElementById("hero-3d");
    if (!mount) return;

    if (!window.THREE) {
      fallback();
      return;
    }
    try {
      buildScene();
      rafId = requestAnimationFrame(tick);
      window.addEventListener("resize", onResize);
      document.addEventListener("themechange", rebuild);
    } catch (err) {
      console.warn("[ThreeScene] WebGL unavailable, using CSS fallback.", err);
      fallback();
    }
  }

  return { init };
})();
