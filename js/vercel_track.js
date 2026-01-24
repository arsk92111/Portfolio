// Device detection
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
        return 'Mobile';
    }
    return 'Desktop';
}

async function trackVisitor() {
    try {
        let vid = localStorage.getItem('visitor_id');
        if (!vid) {
            vid = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitor_id', vid);
        }

        // Geo
        let geo = {};
        try {
            const res = await fetch("https://ipwho.is/");
            geo = await res.json();
        } catch {
            geo = {};
        }

        const device = getDeviceType();

        // Extra useful fields
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const connection = navigator.connection || {};
        const visitType = localStorage.getItem('visitor_id') ? 'returning' : 'new';

        const data = {
            vid: vid,
            ip_local: geo.ip || "",
            city: geo.city || "",
            country: geo.country || "",
            device: device,
            page: window.location.pathname,
            page_title: document.title || '',
            referrer: document.referrer || 'direct',
            language: navigator.language,
            screen: window.screen.width + 'x' + window.screen.height,
            prefers_dark: prefersDark,
            visit_type: visitType,
            network_type: connection.effectiveType || '',
            downlink: connection.downlink || 0,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            browser: navigator.userAgent
        };

        const response = await fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        updateCounter(result);

        return result;

    } catch (error) {
        return { error: error.message };
    }
}

// Update counter on page
function updateCounter(result) {
    const counter = document.getElementById('user_count');
    if (!counter) return;

    if (result.count !== undefined) {
        counter.textContent = result.count;

        if (result.saved) {
            counter.style.color = '#4CAF50';
            counter.style.fontWeight = 'bold';
            setTimeout(() => {
                counter.style.color = '';
                counter.style.fontWeight = '';
            }, 1000);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    console.log('📊 Page loaded');
    setTimeout(trackVisitor, 1000);
});
