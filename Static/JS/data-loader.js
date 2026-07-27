/* ============================================================
   DATA LOADER
   Fetches data/portfolio.json and exposes it globally as
   window.PORTFOLIO_DATA. Fails gracefully with an on-screen
   error state instead of a blank page.
   ============================================================ */

const DataLoader = (() => {
  const JSON_PATH = "data/portfolio.json";

  async function load() {
    try {
      const res = await fetch(JSON_PATH, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      window.PORTFOLIO_DATA = data;
      return data;
    } catch (err) {
      console.error("[DataLoader] Failed to load portfolio.json:", err);
      showFatalError(err);
      return null;
    }
  }

  function showFatalError(err) {
    const root = document.getElementById("app-root") || document.body;
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
                  background:#08090b;color:#edf1f3;font-family:'JetBrains Mono',monospace;
                  text-align:center;padding:40px;">
        <div>
          <div style="font-size:48px;margin-bottom:16px;">⚠</div>
          <h1 style="font-family:inherit;font-size:22px;margin-bottom:10px;">Content failed to load</h1>
          <p style="color:#a6b0b8;max-width:420px;margin:0 auto 6px;">
            The portfolio data (data/portfolio.json) could not be fetched.
            If you're opening this file directly, run it through a local server instead
            (e.g. <code>python -m http.server</code>) since browsers block JSON fetches
            from the <code>file://</code> protocol.
          </p>
          <p style="color:#6b747c;font-size:12px;">${(err && err.message) || ""}</p>
        </div>
      </div>`;
  }

  return { load };
})();
