// Device detection
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
        return 'Mobile';
    }
    return 'Desktop';
}

// Main tracking function
async function trackVisitor() { 
    try { 
        let vid = localStorage.getItem('visitor_id');
        if (!vid) {
            vid = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitor_id', vid);
        }

        const device = getDeviceType(); 
        const data = {
            vid: vid, 
            ip_local: geo.ip || "",
            city: geo.city || "",
            country: geo.country || "", 
            device: device, 
            page: window.location.pathname,
            referrer: document.referrer || 'direct',
            language: navigator.language,
            screen: window.screen.width + 'x' + window.screen.height,
            browser: navigator.userAgent,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        const response = await fetch('/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json(); 
        updateCounter(result);

        return result;

    } catch (error) { 
        return { error: error.message };
    }
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
            setTimeout(() => {
                counter.style.color = '';
                counter.style.fontWeight = '';
            }, 1000);
        }
    }
}

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

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    console.log('📊 Page loaded'); 
    getCurrentCount(); 
    setTimeout(trackVisitor, 1000);
});