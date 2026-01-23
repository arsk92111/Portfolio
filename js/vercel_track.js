class VisitorTracker {
    constructor () {
        this.vid = null;
        this.count = 0;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Generate or get visitor ID
            this.vid = localStorage.getItem('visitor_id');
            if (!this.vid) {
                this.vid = 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('visitor_id', this.vid);
            }

            // First, show existing count if available
            await this.showCurrentCount();

            // Then track visitor (with delay to not block page load)
            setTimeout(() => this.trackVisitor(), 1000);

            this.initialized = true;
        } catch (error) {
            console.error('Tracker init error:', error);
        }
    }

    async trackVisitor() {
        try {
            console.log('🚀 Starting visitor tracking...');

            // Collect basic visitor data (NO external API calls)
            const data = {
                vid: this.vid,
                device: this.getDeviceType(),
                browser: navigator.userAgent.substring(0, 200),
                screen: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                page: window.location.pathname,
                referrer: document.referrer || 'direct',
                city: "Unknown",  // Backend will try to get this
                country: "Unknown", // Backend will try to get this
                ip_local: "Unknown" // Backend will get real IP
            };

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
            this.updateCount(result.count || 0);

            return result;

        } catch (error) {
            console.error('❌ Tracking error:', error);
            this.updateCount(this.count);
            return { success: false, error: error.message };
        }
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return "Tablet";
        } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return "Mobile";
        }
        return "Desktop";
    }

    async showCurrentCount() {
        try {
            // Try to read the current count from the blob file
            const response = await fetch('https://qq2nxd209l2mgsh8.public.blob.vercel-storage.com/visited.txt');
            if (response.ok) {
                const text = await response.text();
                if (text.trim()) {
                    const visitors = JSON.parse(text);
                    this.count = visitors.length;
                    this.updateCount(this.count);
                    console.log(`📊 Current count: ${this.count}`);
                }
            }
        } catch (e) {
            console.log('Could not fetch initial count:', e);
            // Start with 0
            this.updateCount(0);
        }
    }

    updateCount(newCount) {
        this.count = newCount;
        const countElement = document.getElementById('user_count');
        if (countElement) {
            // Animate the count update
            countElement.textContent = newCount;
            countElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                countElement.style.transform = 'scale(1)';
            }, 300);
        }
    }

    getCount() {
        return this.count;
    }
}

// Create and initialize tracker
const visitorTracker = new VisitorTracker();

// Initialize when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        visitorTracker.init();
    });

    // Also track when page becomes visible again
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(() => visitorTracker.trackVisitor(), 2000);
        }
    });
}

// Make tracker available globally
window.visitorTracker = visitorTracker;