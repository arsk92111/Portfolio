// Simple Tracking Script - No External APIs
async function trackVisitor() {
    console.log("📊 Starting visitor tracking...");

    // Generate unique ID
    let vid = localStorage.getItem('visitor_id');
    if (!vid) {
        vid = 'vid_' + Date.now();
        localStorage.setItem('visitor_id', vid);
    }

    // Detect device
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const device = isMobile ? "Mobile" : "Desktop";

    // Prepare data
    const data = {
        vid: vid,
        device: device,
        browser: navigator.userAgent.substring(0, 100),
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        page: window.location.pathname,
        referrer: document.referrer || "direct"
    };

    console.log("📤 Sending data:", data);

    try {
        // Send to API
        const response = await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("📥 Response:", result);

        // Update counter
        if (result.count !== undefined) {
            const countElement = document.getElementById('user_count');
            if (countElement) {
                countElement.textContent = result.count;

                // Animation
                countElement.style.color = '#4CAF50';
                countElement.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    countElement.style.transform = 'scale(1)';
                    countElement.style.color = '';
                }, 300);
            }
        }

        return result;

    } catch (error) {
        console.error("❌ Tracking error:", error);
        return { success: false, error: error.message };
    }
}

// Show current count
async function showCurrentCount() {
    try {
        const response = await fetch('https://qq2nxd209l2mgsh8.public.blob.vercel-storage.com/visited.txt');
        if (response.ok) {
            const text = await response.text();
            if (text.trim()) {
                const visitors = JSON.parse(text);
                const countElement = document.getElementById('user_count');
                if (countElement) {
                    countElement.textContent = visitors.length;
                }
            }
        }
    } catch (e) {
        console.log("Couldn't fetch count:", e);
    }
}

// Initialize
if (typeof window !== 'undefined') {
    // When page loads
    document.addEventListener('DOMContentLoaded', function () {
        // First show current count
        showCurrentCount();

        // Then track after 1 second
        setTimeout(trackVisitor, 1000);
    });
}