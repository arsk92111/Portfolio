// Professional Business Tracking
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

        // 2. COMPANY/ORGANIZATION DATA (from IP)
        this.data.company = await this.getCompanyInfo();

        // 3. NETWORK & CONNECTION
        this.data.network = this.getNetworkDetails();
        this.data.connection = this.getConnectionType();

        // 4. DEVICE FINGERPRINTING (for unique identification)
        this.data.fingerprint = this.generateFingerprint();

        // 5. PROFESSIONAL DETAILS
        this.data.user_agent = navigator.userAgent;
        this.data.platform = navigator.platform;
        this.data.vendor = navigator.vendor || 'Unknown';

        // 6. SECURITY & PRIVACY
        this.data.security = {
            cookies_enabled: navigator.cookieEnabled,
            do_not_track: navigator.doNotTrack || 'unspecified',
            privacy_mode: this.isPrivateBrowsing(),
            secure_connection: window.location.protocol === 'https:',
            vpn_detected: await this.detectVPN()
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
            connection_speed: navigator.connection ? navigator.connection.downlink + ' Mbps' : 'Unknown',
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

    async getCompanyInfo() {
        try {
            // Try multiple IP intelligence services
            const responses = await Promise.race([
                fetch('https://ipapi.co/json/'),
                fetch('https://ipwho.is/'),
                fetch('https://ipinfo.io/json')
            ]);

            const geo = await responses.json();

            return {
                ip_address: geo.ip || '',
                isp: geo.org || geo.isp || '',
                asn: geo.asn || '',
                company: geo.org || geo.company || '',
                hosting: this.isHostingProvider(geo.org),
                proxy: geo.proxy || false,
                vpn: geo.vpn || false,
                tor: geo.tor || false,
                city: geo.city || '',
                region: geo.region || '',
                country: geo.country || '',
                country_code: geo.country_code || '',
                latitude: geo.latitude || '',
                longitude: geo.longitude || ''
            };
        } catch {
            return { ip_address: 'unknown', isp: 'unknown' };
        }
    }

    isHostingProvider(org) {
        if (!org) return false;
        const hostingKeywords = ['digitalocean', 'aws', 'amazon', 'google', 'cloud', 'azure', 'linode', 'vultr', 'ovh', 'host', 'server'];
        return hostingKeywords.some(keyword => org.toLowerCase().includes(keyword));
    }

    async detectVPN() {
        try {
            // Check for common VPN IP ranges or use a service
            const response = await fetch('https://vpnapi.io/api/' + this.data.company.ip_address);
            const data = await response.json();
            return data.security && (data.security.vpn || data.security.proxy || data.security.tor);
        } catch {
            return false;
        }
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
        // Detect connection type (WiFi, 4G, Ethernet, etc.)
        const connection = navigator.connection;
        if (!connection) return 'unknown';

        if (connection.type === 'wifi') return 'WiFi';
        if (connection.type === 'cellular') return 'Mobile Data';
        if (connection.type === 'ethernet') return 'Ethernet';
        if (connection.type === 'bluetooth') return 'Bluetooth';
        if (connection.type === 'wimax') return 'WiMAX';

        return connection.type || 'unknown';
    }

    generateFingerprint() {
        // Create a unique device fingerprint
        const components = [
            navigator.userAgent,
            navigator.platform,
            navigator.language,
            screen.colorDepth,
            (new Date()).getTimezoneOffset(),
            navigator.hardwareConcurrency || 'unknown',
            navigator.deviceMemory || 'unknown',
            navigator.maxTouchPoints || 'unknown'
        ].join('|');

        // Simple hash
        let hash = 0;
        for (let i = 0; i < components.length; i++) {
            const char = components.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return Math.abs(hash).toString(36);
    }

    getReferralSource() {
        const referrer = document.referrer;
        if (!referrer) return 'Direct';

        if (referrer.includes('google')) return 'Google Search';
        if (referrer.includes('bing')) return 'Bing Search';
        if (referrer.includes('yahoo')) return 'Yahoo Search';
        if (referrer.includes('facebook')) return 'Facebook';
        if (referrer.includes('twitter')) return 'Twitter';
        if (referrer.includes('linkedin')) return 'LinkedIn';
        if (referrer.includes('github')) return 'GitHub';

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
        return hour >= 9 && hour <= 17;
    }

    getBrowserEngine() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Blink (Chrome/Edge)';
        if (ua.includes('Firefox')) return 'Gecko (Firefox)';
        if (ua.includes('Safari')) return 'WebKit (Safari)';
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

    isPrivateBrowsing() {
        // Check if in incognito/private mode
        return new Promise((resolve) => {
            const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
            if (!fs) {
                resolve(false);
                return;
            }

            fs(window.TEMPORARY, 100, () => {
                resolve(false);
            }, () => {
                resolve(true);
            });
        });
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
        if (counter && result.count) {
            counter.textContent = result.count;

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
            if (timeSpent % 30 === 0) { // Every 30 seconds
                console.log(`⏱️ Time on page: ${timeSpent} seconds`);
            }
        }, 1000);

        // Track exit
        window.addEventListener('beforeunload', () => {
            const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
            console.log(`👋 Visitor spent ${totalTime} seconds on site`);
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const tracker = new ProfessionalTracker();
    setTimeout(() => tracker.init(), 1500);
});