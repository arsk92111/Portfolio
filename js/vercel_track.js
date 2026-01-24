// Simple tracking function
async function trackVisit() {
    console.log('📊 Tracking visitor...');

    try {
        // 1. Create or get visitor ID
        let vid = localStorage.getItem('myVisitorId');
        if (!vid) {
            vid = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('myVisitorId', vid);
        }

        // 2. Detect device type
        const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        const device = isMobile ? 'Mobile' : 'Desktop';

        // 3. Prepare data
        const data = {
            vid: vid,
            device: device,
            browser: navigator.userAgent.substring(0, 150),
            screen: window.screen.width + 'x' + window.screen.height,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            page: window.location.pathname,
            referrer: document.referrer || 'direct'
        };

        console.log('📤 Sending:', data);

        // 4. Send to API
        const response = await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('📥 Response:', result);

        // 5. Update counter on page
        if (result.count !== undefined) {
            const counter = document.getElementById('user_count');
            if (counter) {
                counter.textContent = result.count;

                // Add simple animation
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

        return result;

    } catch (error) {
        console.error('❌ Tracking error:', error);
        return { error: error.message };
    }
}

// Function to get current count from file
async function getCurrentCount() {
    try {
        const response = await fetch('https://qq2nxd209l2mgsh8.public.blob.vercel-storage.com/visited.txt');
        if (response.ok) {
            const text = await response.text();
            if (text.trim()) {
                const data = JSON.parse(text);
                const counter = document.getElementById('user_count');
                if (counter) {
                    counter.textContent = data.length;
                }
                return data.length;
            }
        }
        return 0;
    } catch (e) {
        console.log('Could not get count:', e);
        return 0;
    }
}

// When page loads
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Page loaded');

    // First show current count
    getCurrentCount();

    // Then track after 1 second
    setTimeout(trackVisit, 1000);
});