async function track() {
    // Unique visitor ID
    let vid = localStorage.getItem("vid");
    if (!vid) {
        vid = crypto.randomUUID();
        localStorage.setItem("vid", vid);
    }

    // Geo + IP info
    const geo = await fetch("https://ipwho.is/")
        .then(r => r.json())
        .catch(() => ({}));

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
        referrer: document.referrer || "direct"
    };

    try {
        const res = await fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const new_data = await res.json();

        // Display user count
        if (document.getElementById("user_count")) {
            document.getElementById("user_count").innerText = new_data.count || "0";
        }

        // Debug log (remove in production)
        console.log("Tracking response:", new_data);

    } catch (error) {
        console.error("Tracking error:", error);
        if (document.getElementById("user_count")) {
            document.getElementById("user_count").innerText = "Error";
        }
    }
}

// Call track function when page loads
if (typeof window !== 'undefined') {
    // Wait for DOM to load
    document.addEventListener('DOMContentLoaded', function () {
        // Track with delay to ensure everything is loaded
        setTimeout(track, 1000);
    });
}