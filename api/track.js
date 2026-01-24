import { get, put } from '@vercel/blob';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = req.body;
        console.log('📦 Received data:', JSON.stringify(data, null, 2));

        // **FIXED: Get IP correctly**
        let ip = 'unknown';

        // Try different headers in order
        if (req.headers['x-forwarded-for']) {
            ip = req.headers['x-forwarded-for'].split(',')[0].trim();
            console.log('🌐 Got IP from x-forwarded-for:', ip);
        } else if (req.headers['x-real-ip']) {
            ip = req.headers['x-real-ip'];
            console.log('🌐 Got IP from x-real-ip:', ip);
        } else if (req.connection?.remoteAddress) {
            ip = req.connection.remoteAddress;
            console.log('🌐 Got IP from connection:', ip);
        } else if (req.socket?.remoteAddress) {
            ip = req.socket.remoteAddress;
            console.log('🌐 Got IP from socket:', ip);
        }

        // Clean IP (remove IPv6 prefix)
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }

        // Handle localhost
        if (ip === '::1') {
            ip = '127.0.0.1';
        }

        const device = data.device || 'Unknown';
        console.log(`🔍 Visitor: IP=${ip}, Device=${device}`);

        // **Step 1: Read existing data**
        let visitors = [];

        try {
            console.log('📖 Trying to read visited.txt...');
            const blob = await get('visited.txt');
            const text = await blob.text();

            console.log('📄 File content (first 500 chars):', text.substring(0, 500));

            if (text && text.trim() !== '') {
                visitors = JSON.parse(text);
                console.log(`✅ Read ${visitors.length} existing visitors`);
            } else {
                console.log('📝 File is empty');
                visitors = [];
            }
        } catch (error) {
            console.log('📝 No file exists or error reading:', error.message);
            visitors = [];
        }

        // **Step 2: Check for duplicate**
        const isDuplicate = visitors.some(v => {
            const sameIP = v.ip === ip;
            const sameDevice = v.device === device;
            console.log(`   Comparing: ${v.ip}==${ip} (${sameIP}), ${v.device}==${device} (${sameDevice})`);
            return sameIP && sameDevice;
        });

        console.log(`🔍 Duplicate check result: ${isDuplicate}`);

        if (isDuplicate) {
            console.log('⏭️ Skipping duplicate (IP+Device exists)');
            return res.status(200).json({
                success: false,
                message: 'Duplicate visitor',
                count: visitors.length,
                duplicate: true
            });
        }

        // **Step 3: Create new visitor**
        const newId = visitors.length > 0 ? Math.max(...visitors.map(v => v.id)) + 1 : 1;

        const newVisitor = {
            id: newId,
            vid: data.vid || `vid_${Date.now()}`,
            ip: ip,
            city: data.city || 'Unknown',
            country: data.country || 'Unknown',
            ip_local: data.ip_local || ip,
            device: device,
            browser: data.browser || 'Unknown',
            screen: data.screen || 'Unknown',
            language: data.language || 'Unknown',
            timezone: data.timezone || 'Unknown',
            page: data.page || '/',
            referrer: data.referrer || 'direct',
            time: new Date().toISOString(),
            timestamp: Date.now()
        };

        console.log('🆕 New visitor:', newVisitor);

        // **Step 4: Append to array**
        visitors.push(newVisitor);
        console.log(`✅ Total visitors: ${visitors.length}`);

        // **Step 5: Save to file**
        try {
            const jsonData = JSON.stringify(visitors, null, 2);
            console.log(`💾 Saving ${visitors.length} visitors to visited.txt...`);

            const result = await put('visited.txt', jsonData, {
                access: 'public',
                contentType: 'application/json',
                token: process.env.BLOB_READ_WRITE_TOKEN,
                allowOverwrite: true
            });

            console.log('✅ File saved successfully! URL:', result.url);

        } catch (error) {
            console.error('❌ Error saving file:', error);
            return res.status(500).json({
                error: 'Failed to save data',
                details: error.message
            });
        }

        // **Step 6: Return success**
        return res.status(200).json({
            success: true,
            saved: true,
            count: visitors.length,
            visitor: newVisitor,
            duplicate: false,
            message: `Added visitor #${newId}. Total: ${visitors.length}`
        });

    } catch (error) {
        console.error('🚨 Server error:', error);
        return res.status(500).json({
            error: 'Server error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}