// Device detection with more details
function getDeviceInfo() {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const isTablet = /Tablet|iPad/i.test(ua);
    const isDesktop = !isMobile && !isTablet;

    let deviceType = 'Desktop';
    if (isTablet) deviceType = 'Tablet';
    if (isMobile) deviceType = 'Mobile';

    // Browser detection
    let browser = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Opera')) browser = 'Opera';

    // OS detection
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'Mac OS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return {
        device_type: deviceType,
        browser_name: browser,
        operating_system: os,
        is_mobile: isMobile,
        is_tablet: isTablet,
        is_desktop: isDesktop
    };
}

// Network information
function getNetworkInfo() {
    const connection = navigator.connection || {};
    return {
        effective_type: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        save_data: connection.saveData || false,
        network_type: connection.type || 'unknown'
    };
}

// Screen information
function getScreenInfo() {
    return {
        width: window.screen.width,
        height: window.screen.height,
        avail_width: window.screen.availWidth,
        avail_height: window.screen.availHeight,
        color_depth: window.screen.colorDepth,
        pixel_depth: window.screen.pixelDepth,
        orientation: window.screen.orientation?.type || 'unknown',
        is_landscape: window.innerWidth > window.innerHeight
    };
}

// Time information
function getTimeInfo() {
    const now = new Date();
    return {
        local_time: now.toLocaleString(),
        hour: now.getHours(),
        day: now.getDay(),
        month: now.getMonth(),
        year: now.getFullYear(),
        day_of_week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()],
        is_weekend: [0, 6].includes(now.getDay())
    };
}

// User preferences
function getUserPreferences() {
    return {
        prefers_dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
        prefers_reduced_motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefers_reduced_transparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
        prefers_contrast: window.matchMedia('(prefers-contrast: more)').matches ? 'more' :
            window.matchMedia('(prefers-contrast: less)').matches ? 'less' : 'no-preference',
        language_preference: navigator.language,
        languages: navigator.languages || [navigator.language]
    };
}

// Performance metrics
function getPerformanceMetrics() {
    const perf = window.performance;
    if (!perf || !perf.timing) return {};

    const timing = perf.timing;
    return {
        page_load_time: timing.loadEventEnd - timing.navigationStart,
        dom_load_time: timing.domContentLoadedEventEnd - timing.navigationStart,
        tcp_connect_time: timing.connectEnd - timing.connectStart,
        server_response_time: timing.responseEnd - timing.requestStart,
        dom_interactive_time: timing.domInteractive - timing.navigationStart
    };
}

// Session information
function getSessionInfo() {
    let session_start = sessionStorage.getItem('session_start');
    if (!session_start) {
        session_start = Date.now();
        sessionStorage.setItem('session_start', session_start);
    }

    const now = Date.now();
    const session_duration = Math.floor((now - parseInt(session_start)) / 1000); // in seconds

    return {
        session_id: 'session_' + session_start,
        session_start: new Date(parseInt(session_start)).toISOString(),
        session_duration: session_duration,
        page_views: (parseInt(sessionStorage.getItem('page_views') || 0)) + 1
    };
}

// Main tracking function
async function trackVisitor() {
    try {
        // Visitor ID
        let vid = localStorage.getItem('visitor_id');
        if (!vid) {
            vid = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitor_id', vid);
        }

        // Update session page views
        let pageViews = parseInt(sessionStorage.getItem('page_views') || 0);
        sessionStorage.setItem('page_views', pageViews + 1);

        // Collect all data
        const deviceInfo = getDeviceInfo();
        const networkInfo = getNetworkInfo();
        const screenInfo = getScreenInfo();
        const timeInfo = getTimeInfo();
        const userPrefs = getUserPreferences();
        const perfMetrics = getPerformanceMetrics();
        const sessionInfo = getSessionInfo();

        // Geo location (optional - might fail due to rate limits)
        let geo = {};
        try {
            const res = await fetch("https://ipapi.co/json/");
            if (res.ok) geo = await res.json();
        } catch {
            // Fallback to free API
            try {
                const res = await fetch("https://ipwhois.pro/free/?key=free&output=json");
                if (res.ok) geo = await res.json();
            } catch {
                geo = {};
            }
        }

        // Visit type
        const visitType = localStorage.getItem('visitor_id') ? 'returning' : 'new';

        // Prepare data
        const data = {
            // Basic info
            vid: vid,
            visit_type: visitType,

            // Device info
            device_type: deviceInfo.device_type,
            browser_name: deviceInfo.browser_name,
            operating_system: deviceInfo.operating_system,
            browser: navigator.userAgent.substring(0, 500),

            // Screen info
            screen: `${screenInfo.width}x${screenInfo.height}`,
            screen_details: {
                width: screenInfo.width,
                height: screenInfo.height,
                avail_width: screenInfo.avail_width,
                avail_height: screenInfo.avail_height,
                color_depth: screenInfo.color_depth,
                orientation: screenInfo.orientation,
                is_landscape: screenInfo.is_landscape
            },

            // Location info
            ip_local: geo.ip || "",
            city: geo.city || "",
            region: geo.region || "",
            country: geo.country_name || "",
            country_code: geo.country_code || "",
            latitude: geo.latitude || "",
            longitude: geo.longitude || "",
            timezone: geo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,

            // Network info
            network_type: networkInfo.effective_type,
            network_details: {
                effective_type: networkInfo.effective_type,
                downlink: networkInfo.downlink,
                rtt: networkInfo.rtt,
                save_data: networkInfo.save_data
            },

            // Page info
            page: window.location.pathname,
            page_url: window.location.href,
            page_title: document.title || '',
            referrer: document.referrer || 'direct',

            // Language info
            language: navigator.language,
            languages: navigator.languages || [navigator.language],

            // User preferences
            prefers_dark: userPrefs.prefers_dark,
            user_preferences: userPrefs,

            // Time info
            time_details: timeInfo,

            // Performance
            performance: perfMetrics,

            // Session info
            session: sessionInfo,

            // Additional
            cookies_enabled: navigator.cookieEnabled,
            online_status: navigator.onLine,
            platform: navigator.platform,
            vendor: navigator.vendor || '',
            product: navigator.product || '',
            app_version: navigator.appVersion.substring(0, 200),
            do_not_track: navigator.doNotTrack || 'unspecified',

            // Engagement (will be updated later)
            scroll_depth: 0,
            time_on_page: 0,
            interactions: 0
        };

        console.log('📊 Collected data:', data);

        // Send to API
        const response = await fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // Update counter
        updateCounter(result);

        // Track engagement (start tracking after page loads)
        setTimeout(() => trackEngagement(data.vid), 1000);

        return result;

    } catch (error) {
        console.error('❌ Tracking error:', error);
        return { error: error.message };
    }
}

// Track user engagement
function trackEngagement(vid) {
    let scrollDepth = 0;
    let interactions = 0;
    let startTime = Date.now();

    // Track scrolling
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > scrollDepth) {
            scrollDepth = Math.round(scrollPercent);
            // You can send this data to your backend if needed
            console.log('📈 Scroll depth:', scrollDepth + '%');
        }
    });

    // Track clicks
    document.addEventListener('click', () => {
        interactions++;
        console.log('🖱️ Interactions:', interactions);
    });

    // Track time on page when user leaves
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000); // in seconds

        // Send engagement data (optional)
        const engagementData = {
            vid: vid,
            scroll_depth: scrollDepth,
            time_on_page: timeOnPage,
            interactions: interactions,
            exit_time: new Date().toISOString()
        };

        // You can send this to another endpoint if needed
        console.log('📊 Engagement data:', engagementData);
    });
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
            counter.style.transform = 'scale(1.1)';

            setTimeout(() => {
                counter.style.color = '';
                counter.style.fontWeight = '';
                counter.style.transform = 'scale(1)';
            }, 500);
        }
    }
}

// Show current count from file
async function showCurrentCount() {
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
            }
        }
    } catch (e) {
        console.log('Could not fetch count:', e);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Page loaded');

    // Show current count
    showCurrentCount();

    // Track visitor after delay
    setTimeout(trackVisitor, 1000);
});