/* ============================================================
   APP
   Entry point. Loads JSON, renders the DOM from it, then boots
   navigation, theme, particle, 3D, and animation modules.
   ============================================================ */

(async function bootstrap() {
  const data = await DataLoader.load();
  if (!data) return; // DataLoader already rendered a fatal error state.

  Renderer.renderAll(data);

  // Theme/template must init before the 3D scene reads the active theme.
  Themes.init();
  Navigation.init();
  Particles.init();
  ThreeScene.init();
  Animations.init();

  document.dispatchEvent(new CustomEvent("app:ready"));
})();
