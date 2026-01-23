// Simple Tracking Function
async function trackVisitor() {
    console.log('🚀 Starting visitor tracking...');

    try {
        // Get or create visitor ID
        let vid = localStorage.getItem('visitor_id');
        if (!vid) {
            vid = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitor_id', vid);
            console.log('🆕 Created new visitor ID:', vid);
        } else {
            console.log('🔑 Using existing visitor ID:', vid);
        }

        // Detect device
        const userAgent = navigator.userAgent;
        let device = 'Desktop';
        if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
            device = 'Mobile';
        }
        if (/Tablet|iPad/i.test(userAgent)) {
            device = 'Tablet';
        }

        // Collect data
        const data = {
            vid: vid,
            device: device,
            browser: navigator.userAgent.substring(0, 100),
            screen: window.screen.width + 'x' + window.screen.height,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            page: window.location.pathname,
            referrer: document.referrer || 'direct',
            // We'll get IP and location from backend
            city: 'Unknown',
            country: 'Unknown',
            ip_local: 'Unknown'
        };

        console.log('📤 Sending data:', data);

        // Send to API
        const response = await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('📥 Response:', result);

        // Update counter on page
        const counterElement = document.getElementById('user_count');
        if (counterElement) {
            const oldCount = parseInt(counterElement.textContent) || 0;
            counterElement.textContent = result.count || oldCount;

            // Add animation
            if (result.success && result.saved) {
                counterElement.style.color = '#4CAF50';
                counterElement.style.fontWeight = 'bold';
                setTimeout(() => {
                    counterElement.style.color = '';
                    counterElement.style.fontWeight = '';
                }, 1000);
            }
        }

        return result;

    } catch (error) {
        console.error('❌ Tracking failed:', error);
        return { success: false, error: error.message };
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
                const count = data.length;

                const counterElement = document.getElementById('user_count');
                if (counterElement) {
                    counterElement.textContent = count;
                }

                return count;
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
    console.log('🏁 Page loaded, initializing tracker...');

    // First, show current count
    getCurrentCount();

    // Then track visitor after delay
    setTimeout(() => {
        trackVisitor();
    }, 1500);
});