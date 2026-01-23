async function track() {
    let vid = localStorage.getItem("vid");
    if (!vid) {
        vid = crypto.randomUUID();
        localStorage.setItem("vid", vid);
    }

    const geo = await fetch("https://ipwho.is/").then(r => r.json()).catch(() => ({}));

    const data = {
        vid,
        city: geo.city || "",
        country: geo.country || "",
        ip_local: geo.ip || "",
        device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
        browser: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        page: location.pathname,
        referrer: document.referrer
    };

    const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    const new_data = await res.json();

    document.getElementById("user_count").innerText = new_data.count || 0;
}

track();
