// frontend-tracker.js
async function trackVisit() {
    try {
        // Device info collect karein
        const deviceInfo = {
            vid: localStorage.getItem('visitor_id') || generateVisitorId(),
            device: navigator.platform,
            browser: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            page: window.location.pathname,
            referrer: document.referrer || 'direct'
        };

        // IP aur location ke liye API (optional)
        const geoResponse = await fetch('https://ipapi.co/json/');
        const geoData = await geoResponse.json();

        const data = {
            ...deviceInfo,
            city: geoData.city,
            country: geoData.country_name,
            ip_local: geoData.ip
        };

        // Vercel function ko call karein
        const response = await fetch('/api/track-visit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Tracking result:', result);

        // Visitor ID save karein localStorage mein
        if (!localStorage.getItem('visitor_id')) {
            localStorage.setItem('visitor_id', deviceInfo.vid);
        }

    } catch (error) {
        console.error('Tracking failed:', error);
    }
}

function generateVisitorId() {
    return 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Page load pe track karein
if (typeof window !== 'undefined') {
    trackVisit();
}