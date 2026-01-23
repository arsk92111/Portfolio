async function trackVisitor() {
    console.log("🚀 Starting visitor tracking...");

    try {
        // Generate or get visitor ID
        let vid = localStorage.getItem("portfolio_vid");
        if (!vid) {
            vid = 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem("portfolio_vid", vid);
            console.log("🆕 Generated new VID:", vid);
        } else {
            console.log("🔑 Existing VID found:", vid);
        }

        // Collect device information
        const deviceInfo = {
            vid: vid,
            device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
            browser: navigator.userAgent.substring(0, 200), // Limit length
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            page: window.location.pathname,
            referrer: document.referrer || "direct"
        };

        console.log("📱 Device info:", deviceInfo);

        // Get location info with fallback
        try {
            const geoResponse = await fetch('https://ipapi.co/json/');
            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                deviceInfo.city = geoData.city || "Unknown";
                deviceInfo.country = geoData.country_name || "Unknown";
                deviceInfo.ip_local = geoData.ip || "Unknown";
                console.log("📍 Location info:", geoData);
            } else {
                throw new Error("Geo API failed");
            }
        } catch (geoError) {
            console.log("⚠️ Geo location failed, using defaults");
            deviceInfo.city = "Unknown";
            deviceInfo.country = "Unknown";
            deviceInfo.ip_local = "Unknown";

            // Try backup API
            try {
                const backupGeo = await fetch('https://ipwho.is/');
                if (backupGeo.ok) {
                    const backupData = await backupGeo.json();
                    deviceInfo.city = backupData.city || deviceInfo.city;
                    deviceInfo.country = backupData.country || deviceInfo.country;
                    deviceInfo.ip_local = backupData.ip || deviceInfo.ip_local;
                }
            } catch (e) {
                // Ignore backup error
            }
        }

        console.log("📤 Sending data to API...");

        // Send tracking data
        const response = await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(deviceInfo)
        });

        const result = await response.json();
        console.log("📥 API Response:", result);

        // Update visitor count display
        if (result.count !== undefined) {
            const countElement = document.getElementById("user_count");
            if (countElement) {
                // Add animation
                countElement.textContent = result.count;
                countElement.style.color = "#4CAF50";
                countElement.style.fontWeight = "bold";

                // Reset animation
                setTimeout(() => {
                    countElement.style.color = "";
                    countElement.style.fontWeight = "";
                }, 1000);

                console.log("✅ Visitor count updated:", result.count);
            }
        }

        return result;

    } catch (error) {
        console.error("❌ Tracking failed:", error);

        // Show error in count element
        const countElement = document.getElementById("user_count");
        if (countElement) {
            countElement.textContent = "Error";
            countElement.style.color = "red";
        }

        return { success: false, error: error.message };
    }
}

// Function to get current count without tracking
async function getVisitorCount() {
    try {
        // Try to read the file directly from Blob storage
        const response = await fetch('https://qq2nxd209l2mgsh8.public.blob.vercel-storage.com/visited.txt');
        if (response.ok) {
            const text = await response.text();
            if (text.trim()) {
                const visitors = JSON.parse(text);
                return visitors.length;
            }
        }
        return 0;
    } catch (e) {
        console.log("Could not fetch count:", e);
        return 0;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async function () {
    console.log("🏁 Page loaded, initializing tracking...");

    // First, try to show existing count
    const initialCount = await getVisitorCount();
    const countElement = document.getElementById("user_count");
    if (countElement && initialCount > 0) {
        countElement.textContent = initialCount;
    }

    // Then track after delay (to not block page load)
    setTimeout(trackVisitor, 1500);

    // Track on page visibility change
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            console.log("🔍 Page became visible, tracking again");
            setTimeout(trackVisitor, 1000);
        }
    });
});

// Make functions available globally
window.trackVisitor = trackVisitor;
window.getVisitorCount = getVisitorCount;