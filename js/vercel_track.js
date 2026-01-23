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
                console.log('🆕 Generated new visitor ID:', this.vid);
            } else {
                console.log('🔑 Existing visitor ID:', this.vid);
            }

            // Show current count
            await this.showCurrentCount();

            // Track after delay
            setTimeout(() => this.trackVisitor(), 1500);

            this.initialized = true;
        } catch (error) {
            console.error('Tracker init error:', error);
        }
    }

    getDeviceType() {
        const ua = navigator.userAgent;

        // Mobile detection
        const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

        // Tablet detection
        const isTablet = /Tablet|iPad|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua);

        if (isTablet) return "Tablet";
        if (isMobile) return "Mobile";
        return "Desktop";
    }

    async trackVisitor() {
        try {
            console.log('🚀 Starting visitor tracking...');

            // Collect device info
            const deviceType = this.getDeviceType();
            console.log('📱 Device detected:', deviceType);

            const data = {
                vid: this.vid,
                device: deviceType,
                browser: navigator.userAgent.substring(0, 200),
                screen: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                page: window.location.pathname,
                referrer: document.referrer || 'direct'
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
            if (result.count !== undefined) {
                this.updateCount(result.count);
            }

            // If duplicate, show message
            if (result.duplicate) {
                console.log('⚠️ Duplicate visitor detected');
                this.showMessage('Already counted!', 'info');
            }

            return result;

        } catch (error) {
            console.error('❌ Tracking error:', error);
            this.showMessage('Tracking failed', 'error');
            return { success: false, error: error.message };
        }
    }

    async showCurrentCount() {
        try {
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
            this.updateCount(0);
        }
    }

    updateCount(newCount) {
        this.count = newCount;
        const countElement = document.getElementById('user_count');
        if (countElement) {
            const oldCount = parseInt(countElement.textContent) || 0;
            countElement.textContent = newCount;

            // Animation
            if (newCount > oldCount) {
                countElement.classList.add('count-updated');
                setTimeout(() => {
                    countElement.classList.remove('count-updated');
                }, 1000);
            }
        }
    }

    showMessage(text, type) {
        // Create a temporary notification
        const messageDiv = document.createElement('div');
        messageDiv.textContent = text;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
            color: white;
            border-radius: 5px;
            z-index: 1000;
            font-family: sans-serif;
        `;

        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }
}

// Create tracker instance
const visitorTracker = new VisitorTracker();

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    visitorTracker.init();

    // Track on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            setTimeout(() => visitorTracker.trackVisitor(), 1000);
        }
    });
});

// Make tracker available globally
window.visitorTracker = visitorTracker;

// Add CSS for animation
const style = document.createElement('style');
style.textContent = `
    #user_count.count-updated {
        animation: countPulse 0.5s ease-in-out;
        color: #4CAF50;
        font-weight: bold;
    }
    
    @keyframes countPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);