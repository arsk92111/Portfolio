import { get, put } from '@vercel/blob';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

    try {
        // Get ALL data from frontend
        const data = req.body;

        // Get IP from headers
        let ip = 'unknown';
        if (req.headers['x-forwarded-for']) {
            ip = req.headers['x-forwarded-for'].split(',')[0].trim();
        }

        // Read existing data
        let allVisitors = [];
        try {
            const blobUrl = 'https://qq2nxd209l2mgsh8.public.blob.vercel-storage.com/visited.txt';
            const response = await fetch(blobUrl);
            if (response.ok) {
                const text = await response.text();
                if (text && text.trim() !== '') {
                    allVisitors = JSON.parse(text);
                }
            }
        } catch (err) {
            console.log('Error reading file:', err.message);
        }

        // Duplicate check (IP + Device Type)
        let alreadyExists = false;
        for (let visitor of allVisitors) {
            if (visitor.ip === ip && visitor.device_type === data.device_type) {
                alreadyExists = true;
                break;
            }
        }

        if (alreadyExists) {
            return res.json({
                success: false,
                message: 'IP+Device already exists',
                count: allVisitors.length,
                duplicate: true
            });
        }

        // Create new visitor with all data
        const newVisitor = {
            id: allVisitors.length + 1,
            timestamp: Date.now(),
            time: new Date().toISOString(),
            ip: ip,

            // Basic info
            vid: data.vid || '',
            visit_type: data.visit_type || 'new',

            // Device info
            device_type: data.device_type || 'Unknown',
            browser_name: data.browser_name || 'Unknown',
            operating_system: data.operating_system || 'Unknown',
            browser: data.browser || 'Unknown',

            // Screen info
            screen: data.screen || 'Unknown',
            screen_details: data.screen_details || {},

            // Location info
            ip_local: data.ip_local || '',
            city: data.city || '',
            region: data.region || '',
            country: data.country || '',
            country_code: data.country_code || '',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
            timezone: data.timezone || 'Unknown',

            // Network info
            network_type: data.network_type || '',
            network_details: data.network_details || {},

            // Page info
            page: data.page || '/',
            page_url: data.page_url || '',
            page_title: data.page_title || '',
            referrer: data.referrer || 'direct',

            // Language info
            language: data.language || 'Unknown',
            languages: data.languages || [],

            // User preferences
            prefers_dark: data.prefers_dark || false,
            user_preferences: data.user_preferences || {},

            // Time info
            time_details: data.time_details || {},

            // Performance
            performance: data.performance || {},

            // Session info
            session: data.session || {},

            // Additional
            cookies_enabled: data.cookies_enabled || false,
            online_status: data.online_status || true,
            platform: data.platform || '',
            vendor: data.vendor || '',
            product: data.product || '',
            app_version: data.app_version || '',
            do_not_track: data.do_not_track || 'unspecified',

            // Engagement (initially 0)
            engagement: {
                scroll_depth: 0,
                time_on_page: 0,
                interactions: 0
            }
        };

        // Add to array
        allVisitors.push(newVisitor);

        // Save to file
        const jsonData = JSON.stringify(allVisitors, null, 2);
        await put('visited.txt', jsonData, {
            access: 'public',
            contentType: 'application/json',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            allowOverwrite: true
        });

        res.json({
            success: true,
            saved: true,
            count: allVisitors.length,
            visitor: newVisitor,
            duplicate: false
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}