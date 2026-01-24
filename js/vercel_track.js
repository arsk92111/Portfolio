// Device detection function
function getDeviceType() {
    const ua = navigator.userAgent;

    if (/Tablet|iPad/i.test(ua)) {
        return 'Tablet';
    }
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
        return 'Mobile';
    }
    return 'Desktop';
}

// Main tracking function
async function trackVisitor() {
    console.log('🚀 Starting visitor tracking...');

    try {
        // Get or create visitor ID
        let vid = localStorage.getItem('visitor_id');
        if (!vid) {
            vid = 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitor_id', vid);
        }

        // Get device type
        const device = getDeviceType();
        console.log('📱 Device detected:', device);

        // Prepare data
        const data = {
            vid: vid,
            device: device,
            browser: navigator.userAgent.substring(0, 200),
            screen: window.screen.width + 'x' + window.screen.height,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            page: window.location.pathname,
            referrer: document.referrer || 'direct',
            city: 'Unknown',
            country: 'Unknown',
            ip_local: 'Unknown'
        };

        console.log('📤 Sending data to API...');

        // Send to API
        const response = await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('📥 API Response:', result);

        // Update counter
        updateCounter(result);

        return result;

    } catch (error) {
        console.error('❌ Tracking error:', error);
        return { success: false, error: error.message };
    }
}

// Update counter display
function updateCounter(result) {
    const counterElement = document.getElementById('user_count');
    if (!counterElement) return;

    if (result.count !== undefined) {
        counterElement.textContent = result.count;

        // Add animation
        if (result.saved) {
            counterElement.style.color = '#4CAF50';
            counterElement.style.fontWeight = 'bold';
            counterElement.style.transform = 'scale(1.2)';

            setTimeout(() => {
                counterElement.style.color = '';
                counterElement.style.fontWeight = '';
                counterElement.style.transform = 'scale(1)';
            }, 500);
        }
    }
}

// Get current count from file
async function getCurrentCount() {
    try {
        const response = await fetch('https://qq2nxd209l2mgsh8.public.blob.vercel-storage.com/visited.txt');
        if (response.ok) {
            const text = await response.text();
            if (text.trim()) {
                const data = JSON.parse(text);
                const countElement = document.getElementById('user_count');
                if (countElement) {
                    countElement.textContent = data.length;
                }
                return data.length;
            }
        }
        return 0;
    } catch (error) {
        console.log('Could not fetch count:', error);
        return 0;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    console.log('🏁 Page loaded');

    // Show current count
    getCurrentCount();

    // Track after 1 second
    setTimeout(() => {
        trackVisitor();
    }, 1000);
});