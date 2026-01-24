import { get, put } from '@vercel/blob';

// Helper function outside handler
function calculateDataCompleteness(data) {
    const fields = [
        'company', 'location', 'device_profile',
        'acquisition', 'security_assessment', 'technology'
    ];

    let filledFields = 0;
    fields.forEach(field => {
        if (data[field] && Object.keys(data[field]).length > 0) {
            filledFields++;
        }
    });

    return Math.round((filledFields / fields.length) * 100);
}

export default async function handler(req, res) {
    // Professional headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Tracking-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            allowed_methods: ['POST']
        });
    }

    try {
        const visitorData = req.body;
        const trackingVersion = req.headers['x-tracking-version'] || '1.0';

        // Get actual IP (considering Vercel proxy)
        let ip = req.headers['x-real-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket?.remoteAddress ||
            'unknown';

        console.log(`📊 Professional tracking v${trackingVersion} from IP: ${ip}`);

        // Read existing professional data
        let allVisitors = [];
        try {
            const blobUrl = 'https://qq2nxd209l2mgsh8.public.blob.vercel-storage.com/visited.txt';
            const response = await fetch(blobUrl);
            if (response.ok) {
                const text = await response.text();
                if (text.trim()) {
                    allVisitors = JSON.parse(text);
                    console.log(`📄 Read ${allVisitors.length} existing visitors`);
                }
            }
        } catch (error) {
            console.log('📝 Starting fresh database');
        }

        // Professional duplicate check (IP + Fingerprint)
        let isDuplicate = false;
        const visitorFingerprint = visitorData.fingerprint || 'unknown';

        for (const visitor of allVisitors) {
            const sameIP = visitor.ip_address === ip;
            const sameFingerprint = visitor.fingerprint === visitorFingerprint;
            const sameCompany = visitor.company?.name === visitorData.company?.name;

            if (sameIP && (sameFingerprint || sameCompany)) {
                isDuplicate = true;
                break;
            }
        }

        console.log(`🔍 Duplicate check: ${isDuplicate ? 'Duplicate found' : 'New visitor'}`);

        if (isDuplicate) {
            return res.json({
                success: false,
                status: 'DUPLICATE',
                message: 'Professional visitor already tracked',
                count: allVisitors.length,
                visitor_type: 'Returning'
            });
        }

        // Create professional visitor record
        const professionalVisitor = {
            // IDENTIFICATION
            id: `BIZ-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            visitor_id: visitorData.visitor_id || 'unknown',
            session_id: visitorData.session_id || 'unknown',
            fingerprint: visitorFingerprint,
            timestamp: new Date().toISOString(),

            // COMPANY & ORGANIZATION
            ip_address: ip,
            company: {
                name: visitorData.company?.name || 'Unknown',
                isp: visitorData.company?.isp || 'Unknown',
                asn: visitorData.company?.asn || '',
                hosting_provider: visitorData.company?.hosting || false,
                proxy_used: visitorData.company?.proxy || false,
                vpn_detected: visitorData.company?.vpn || false
            },

            // BUSINESS INTELLIGENCE
            location: {
                city: visitorData.company?.city || 'Unknown',
                region: visitorData.company?.region || 'Unknown',
                country: visitorData.company?.country || 'Unknown',
                country_code: visitorData.company?.country_code || '',
                coordinates: {
                    lat: visitorData.company?.latitude || '',
                    lng: visitorData.company?.longitude || ''
                }
            },

            // TECHNICAL PROFILE
            device_profile: {
                user_agent: visitorData.user_agent || '',
                platform: visitorData.platform || '',
                vendor: visitorData.vendor || '',
                browser_engine: visitorData.tech_stack?.browser_engine || '',
                connection_type: visitorData.connection || 'unknown',
                network_speed: visitorData.performance?.connection_speed || 'unknown'
            },

            // MARKETING & ACQUISITION
            acquisition: {
                referral_source: visitorData.business?.referral_source || 'Direct',
                campaign: visitorData.business?.campaign_data || {},
                landing_page: visitorData.business?.landing_page || '',
                entry_time: visitorData.business?.entry_time || '',
                day_of_week: visitorData.business?.day_of_week || '',
                hour_of_day: visitorData.business?.hour_of_day || 0,
                business_hours: visitorData.business?.is_business_hours || false
            },

            // SECURITY ASSESSMENT
            security_assessment: {
                cookies_enabled: visitorData.security?.cookies_enabled || false,
                secure_connection: visitorData.security?.secure_connection || false,
                privacy_mode: visitorData.security?.privacy_mode || false,
                vpn_used: visitorData.security?.vpn_detected || false,
                do_not_track: visitorData.security?.do_not_track || 'unspecified'
            },

            // TECHNOLOGY STACK
            technology: {
                webgl_support: visitorData.tech_stack?.webgl_support || false,
                websocket_support: visitorData.tech_stack?.websocket_support || false,
                service_worker_support: visitorData.tech_stack?.service_worker_support || false,
                push_support: visitorData.tech_stack?.push_notification_support || false,
                screen_resolution: visitorData.performance?.screen_resolution || '',
                color_depth: visitorData.performance?.color_depth || '',
                timezone: visitorData.performance?.timezone || '',
                language: visitorData.performance?.language || '',
                pixel_ratio: visitorData.performance?.pixel_ratio || 1
            },

            // VISITOR STATUS
            status: {
                visitor_type: visitorData.visitor_id ? 'Returning' : 'New',
                tracking_version: trackingVersion,
                data_completeness: calculateDataCompleteness(visitorData)
            }
        };

        // Add to database
        allVisitors.push(professionalVisitor);
        console.log(`✅ Added new visitor. Total: ${allVisitors.length}`);

        // Save with professional formatting
        const jsonData = JSON.stringify(allVisitors, null, 2);

        await put('visited.txt', jsonData, {
            access: 'public',
            contentType: 'application/json',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            allowOverwrite: true
        });

        // Professional response
        res.json({
            success: true,
            status: 'RECORDED',
            message: 'Professional visitor data recorded',
            count: allVisitors.length,
            visitor: {
                id: professionalVisitor.id,
                company: professionalVisitor.company.name,
                location: `${professionalVisitor.location.city}, ${professionalVisitor.location.country}`,
                type: professionalVisitor.status.visitor_type,
                timestamp: professionalVisitor.timestamp
            },
            analytics: {
                total_visitors: allVisitors.length,
                new_visitors: allVisitors.filter(v => v.status.visitor_type === 'New').length,
                returning_visitors: allVisitors.filter(v => v.status.visitor_type === 'Returning').length,
                unique_companies: [...new Set(allVisitors.map(v => v.company.name))].length
            }
        });

    } catch (error) {
        console.error('Professional tracking error:', error);
        res.status(500).json({
            error: 'Professional tracking failed',
            error_code: 'TRACKING_ERROR',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
}