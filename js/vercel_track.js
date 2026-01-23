class VisitorTracker {
    constructor () {
        this.vid = null;
        this.count = 0;
        this.init();
    }

    init() {
        // Generate or get visitor ID
        this.vid = localStorage.getItem('visitor_id');
        if (!this.vid) {
            this.vid = 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitor_id', this.vid);
        }

        // Wait for DOM to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.track());
        } else {
            this.track();
        }
    }

    async track() {
        try {
            // Collect visitor data
            const data = {
                vid: this.vid,
                device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                browser: navigator.userAgent,
                screen: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                page: window.location.pathname,
                referrer: document.referrer || 'direct'
            };

            // Get IP and location
            try {
                const geoResponse = await fetch('https://ipapi.co/json/');
                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    data.city = geoData.city || 'Unknown';
                    data.country = geoData.country_name || 'Unknown';
                    data.ip_local = geoData.ip || 'Unknown';
                }
            } catch (geoError) {
                console.log('Geo location failed, using defaults');
                data.city = 'Unknown';
                data.country = 'Unknown';
                data.ip_local = 'Unknown';
            }

            console.log('📤 Sending tracking data:', data);

            // Send to API
            const response = await fetch('/api/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log('📥 Tracking response:', result);

            // Update count on page
            this.updateCount(result.count || this.count);

        } catch (error) {
            console.error('❌ Tracking error:', error);
            this.updateCount(this.count);
        }
    }

    updateCount(newCount) {
        this.count = newCount;
        const countElement = document.getElementById('user_count');
        if (countElement) {
            // Animate the count update
            countElement.textContent = newCount;
            countElement.classList.add('pulse');
            setTimeout(() => countElement.classList.remove('pulse'), 300);
        }
    }

    // Method to get current count (public)
    getCount() {
        return this.count;
    }
}

// Initialize tracker when page loads
let visitorTracker;

if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        visitorTracker = new VisitorTracker();

        // Also fetch current count from file
        fetchCurrentCount();
    });
}

// Function to fetch current count directly from blob
async function fetchCurrentCount() {
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
        console.log('Could not fetch count:', e);
    }
}

// CSS for animation
const style = document.createElement('style');
style.textContent = `
    .pulse {
        animation: pulse 0.3s ease-in-out;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);