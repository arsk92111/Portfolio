import { get, put } from '@vercel/blob';

export default async function handler(req, res) {
    // Allow CORS
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
        // Get data from frontend
        const data = req.body;
        console.log('📨 Received data:', data);

        // Get IP from Vercel headers (MOST IMPORTANT)
        let ip = req.headers['x-real-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.socket?.remoteAddress ||
            'unknown';

        console.log('🌐 IP Address:', ip);

        // Device info from frontend
        const device = data.device || 'Unknown';
        console.log('📱 Device:', device);

        // Read existing data
        let existingData = [];
        try {
            const blob = await get('visited.txt');
            const text = await blob.text();
            console.log('📖 File content length:', text.length);

            if (text.trim()) {
                existingData = JSON.parse(text);
                console.log(`📊 Found ${existingData.length} existing visitors`);
            }
        } catch (error) {
            console.log('📝 No existing file or error, starting fresh');
            existingData = [];
        }

        // Check for duplicate (IP + Device must BOTH match to skip)
        let isDuplicate = false;
        let duplicateIndex = -1;

        for (let i = 0; i < existingData.length; i++) {
            const visitor = existingData[i];
            if (visitor.ip === ip && visitor.device === device) {
                isDuplicate = true;
                duplicateIndex = i;
                break;
            }
        }

        console.log('🔍 Duplicate check:');
        console.log('- IP:', ip);
        console.log('- Device:', device);
        console.log('- Is duplicate?', isDuplicate);
        console.log('- Existing visitors with same IP+Device:',
            existingData.filter(v => v.ip === ip && v.device === device).length);

        // If duplicate (same IP + same device), DO NOT SAVE
        if (isDuplicate) {
            console.log('⏭️ Skipping - Same IP and Device already exists');
            return res.json({
                success: false,
                message: 'Visitor already exists (same IP + device)',
                count: existingData.length,
                duplicate: true
            });
        }

        // Create new visitor entry
        const newVisitor = {
            id: existingData.length + 1,
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
            time: new Date().toISOString()
        };

        console.log('🆕 New visitor to add:', newVisitor);

        // Append to existing array
        existingData.push(newVisitor);
        console.log(`✅ Total visitors after adding: ${existingData.length}`);

        // Save to file
        try {
            const jsonData = JSON.stringify(existingData, null, 2);
            console.log('💾 Saving data, size:', jsonData.length, 'bytes');

            await put('visited.txt', jsonData, {
                access: 'public',
                contentType: 'application/json',
                token: process.env.BLOB_READ_WRITE_TOKEN,
                allowOverwrite: true
            });

            console.log('💾 File saved successfully!');
        } catch (saveError) {
            console.error('❌ Error saving file:', saveError);
            return res.status(500).json({
                error: 'Failed to save data',
                details: saveError.message
            });
        }

        // Return success
        return res.json({
            success: true,
            saved: true,
            count: existingData.length,
            visitor: newVisitor,
            duplicate: false,
            message: `Added visitor #${newVisitor.id}. Total: ${existingData.length}`
        });

    } catch (error) {
        console.error('🚨 Server error:', error);
        return res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
}