// Professional Business Tracking WITHOUT External APIs
class ProfessionalTracker {
    constructor () {
        this.data = {};
        this.startTime = Date.now();
    }

    async init() {
        await this.collectAllData();
        await this.sendData();
        this.trackEngagement();
    }

    async collectAllData() {
        // 1. BASIC IDENTIFICATION
        this.data.visitor_id = this.getVisitorId();
        this.data.session_id = 'session_' + Date.now();
        this.data.timestamp = new Date().toISOString();

        // 2. COMPANY/ORGANIZATION DATA (estimated from IP pattern)
        this.data.company = this.estimateCompanyFromIP();

        // 3. NETWORK & CONNECTION
        this.data.network = this.getNetworkDetails();
        this.data.connection = this.getConnectionType();

        // 4. DEVICE FINGERPRINTING
        this.data.fingerprint = this.generateFingerprint();

        // 5. PROFESSIONAL DETAILS
        this.data.user_agent = navigator.userAgent;
        this.data.platform = navigator.platform;
        this.data.vendor = navigator.vendor || 'Unknown';

        // 6. SECURITY & PRIVACY
        this.data.security = {
            cookies_enabled: navigator.cookieEnabled,
            do_not_track: navigator.doNotTrack || 'unspecified',
            secure_connection: window.location.protocol === 'https:'
        };

        // 7. BUSINESS INTELLIGENCE
        this.data.business = {
            referral_source: this.getReferralSource(),
            campaign_data: this.getUTMParameters(),
            landing_page: window.location.href,
            entry_time: new Date().toLocaleTimeString(),
            day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
            hour_of_day: new Date().getHours(),
            is_business_hours: this.isBusinessHours()
        };

        // 8. TECHNOLOGY STACK DETECTION
        this.data.tech_stack = {
            browser_engine: this.getBrowserEngine(),
            javascript_enabled: true,
            webgl_support: this.hasWebGL(),
            websocket_support: 'WebSocket' in window,
            service_worker_support: 'serviceWorker' in navigator,
            push_notification_support: 'PushManager' in window
        };

        // 9. PERFORMANCE METRICS
        this.data.performance = {
            connection_speed: navigator.connection ? (navigator.connection.downlink || 0) + ' Mbps' : 'Unknown',
            screen_resolution: window.screen.width + 'x' + window.screen.height,
            color_depth: window.screen.colorDepth + ' bit',
            pixel_ratio: window.devicePixelRatio,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            languages: navigator.languages
        };
    }

    getVisitorId() {
        let vid = localStorage.getItem('pro_visitor_id');
        if (!vid) {
            vid = 'biz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
            localStorage.setItem('pro_visitor_id', vid);
        }
        return vid;
    }

    estimateCompanyFromIP() {
        // Simple company estimation based on user agent and other clues
        const ua = navigator.userAgent.toLowerCase();

        let company = 'Unknown';
        if (ua.includes('chrome') && ua.includes('google')) {
            company = 'Google';
        } else if (ua.includes('firefox')) {
            company = 'Mozilla';
        } else if (ua.includes('safari') && ua.includes('apple')) {
            company = 'Apple';
        } else if (ua.includes('edge') || ua.includes('edg/')) {
            company = 'Microsoft';
        } else if (ua.includes('opera')) {
            company = 'Opera';
        }

        // Check for corporate network patterns
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const isCorporateHours = (new Date().getHours() >= 9 && new Date().getHours() <= 17);
        const isWeekday = (new Date().getDay() >= 1 && new Date().getDay() <= 5);

        return {
            name: company,
            isp: 'Unknown',
            asn: '',
            hosting: false,
            proxy: false,
            vpn: false,
            tor: false,
            city: this.guessCityFromTimezone(timezone),
            region: 'Unknown',
            country: this.guessCountryFromLanguage(),
            country_code: this.getCountryCode(),
            latitude: '',
            longitude: ''
        };
    }

    guessCityFromTimezone(timezone) {
        const timezoneMap = {
            'Asia/Karachi': 'Karachi',
            'Asia/Kolkata': 'Mumbai',
            'Asia/Dubai': 'Dubai',
            'America/New_York': 'New York',
            'America/Los_Angeles': 'Los Angeles',
            'Europe/London': 'London',
            'Europe/Paris': 'Paris',
            'Asia/Singapore': 'Singapore',
            'Asia/Tokyo': 'Tokyo',
            'Australia/Sydney': 'Sydney'
        };
        return timezoneMap[timezone] || 'Unknown';
    }

    guessCountryFromLanguage() {
        const lang = navigator.language;
        if (lang.includes('en')) return 'United States';
        if (lang.includes('ur')) return 'Pakistan';
        if (lang.includes('hi')) return 'India';
        if (lang.includes('ar')) return 'Saudi Arabia';
        if (lang.includes('es')) return 'Spain';
        if (lang.includes('fr')) return 'France';
        if (lang.includes('de')) return 'Germany';
        if (lang.includes('ja')) return 'Japan';
        if (lang.includes('zh')) return 'China';
        return 'Unknown';
    }

    getCountryCode() {
        const lang = navigator.language;
        if (lang.includes('en')) return 'US';
        if (lang.includes('ur')) return 'PK';
        if (lang.includes('hi')) return 'IN';
        if (lang.includes('ar')) return 'SA';
        return 'Unknown';
    }

    getNetworkDetails() {
        const connection = navigator.connection || {};
        return {
            effective_type: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 'unknown',
            rtt: connection.rtt || 'unknown',
            save_data: connection.saveData || false,
            type: connection.type || 'unknown'
        };
    }

    getConnectionType() {
        const connection = navigator.connection;
        if (!connection) return 'unknown';

        if (connection.type === 'wifi') return 'WiFi';
        if (connection.type === 'cellular') return 'Mobile Data';
        if (connection.type === 'ethernet') return 'Ethernet';

        return connection.type || 'unknown';
    }

    generateFingerprint() {
        // Create a unique device fingerprint WITHOUT external calls
        const components = [
            navigator.userAgent,
            navigator.platform,
            navigator.language,
            screen.colorDepth.toString(),
            (new Date()).getTimezoneOffset().toString(),
            (navigator.hardwareConcurrency || 'unknown').toString(),
            (navigator.deviceMemory || 'unknown').toString(),
            (navigator.maxTouchPoints || 'unknown').toString(),
            window.screen.width.toString(),
            window.screen.height.toString()
        ].join('|');

        // Simple hash
        let hash = 0;
        for (let i = 0; i < components.length; i++) {
            const char = components.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return 'fp_' + Math.abs(hash).toString(36);
    }

    getReferralSource() {
        const referrer = document.referrer;
        if (!referrer) return 'Direct';

        if (referrer.includes('google')) return 'Google';
        if (referrer.includes('bing')) return 'Bing';
        if (referrer.includes('yahoo')) return 'Yahoo';
        if (referrer.includes('facebook')) return 'Facebook';
        if (referrer.includes('twitter')) return 'Twitter';
        if (referrer.includes('linkedin')) return 'LinkedIn';
        if (referrer.includes('github')) return 'GitHub';
        if (referrer.includes('vercel')) return 'Vercel';

        return 'Other Website';
    }

    getUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            source: urlParams.get('utm_source') || 'direct',
            medium: urlParams.get('utm_medium') || 'none',
            campaign: urlParams.get('utm_campaign') || 'none',
            term: urlParams.get('utm_term') || 'none',
            content: urlParams.get('utm_content') || 'none'
        };
    }

    isBusinessHours() {
        const hour = new Date().getHours();
        const isWeekday = new Date().getDay() >= 1 && new Date().getDay() <= 5;
        return isWeekday && hour >= 9 && hour <= 17;
    }

    getBrowserEngine() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome') || ua.includes('Edg')) return 'Blink';
        if (ua.includes('Firefox')) return 'Gecko';
        if (ua.includes('Safari')) return 'WebKit';
        return 'Unknown';
    }

    hasWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch {
            return false;
        }
    }

    async sendData() {
        try {
            const response = await fetch('/api/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tracking-Version': '2.0'
                },
                body: JSON.stringify(this.data)
            });

            const result = await response.json();

            // Update visitor counter
            this.updateCounter(result);

            return result;
        } catch (error) {
            console.error('Professional tracking failed:', error);
            return { error: error.message };
        }
    }

    updateCounter(result) {
        const counter = document.getElementById('user_count');
        if (counter) {
            if (result.count !== undefined) {
                counter.textContent = result.count;
            } else {
                // Increment local counter if API fails
                let localCount = parseInt(localStorage.getItem('local_visitor_count') || '0');
                localCount++;
                localStorage.setItem('local_visitor_count', localCount.toString());
                counter.textContent = localCount;
            }

            // Professional animation
            counter.style.fontSize = '18px';
            counter.style.fontWeight = 'bold';
            counter.style.color = '#2196F3';
            counter.style.transition = 'all 0.3s';

            setTimeout(() => {
                counter.style.fontSize = '';
                counter.style.color = '';
            }, 500);
        }
    }

    trackEngagement() {
        // Track time spent
        setInterval(() => {
            const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
            if (timeSpent % 60 === 0) { // Every 60 seconds
                console.log(`⏱️ Time on page: ${Math.floor(timeSpent / 60)} minutes`);
            }
        }, 1000);

        // Track exit
        window.addEventListener('beforeunload', () => {
            const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
            console.log(`👋 Visitor spent ${totalTime} seconds on site`);
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Professional tracker initializing...');

    // Show current count from localStorage as fallback
    const counter = document.getElementById('user_count');
    if (counter) {
        const localCount = localStorage.getItem('local_visitor_count') || '0';
        counter.textContent = localCount;
    }

    // Start tracking after delay
    setTimeout(() => {
        const tracker = new ProfessionalTracker();
        tracker.init();
    }, 1500);
});