import { get, put } from '@vercel/blob';

export default async function handler(req, res) {
    // Allow CORS
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST allowed' });
    }

    try {
        // 1. Get data from frontend
        const { vid, device, browser, screen, language, timezone, page, referrer } = req.body;

        // 2. Get IP address
        let ip = 'unknown';
        if (req.headers['x-forwarded-for']) {
            ip = req.headers['x-forwarded-for'].split(',')[0].trim();
        } else if (req.headers['x-real-ip']) {
            ip = req.headers['x-real-ip'];
        }

        console.log('🌐 IP:', ip, '📱 Device:', device);

        // 3. Read existing data from file
        let oldData = [];
        try {
            const blob = await get('visited.txt');
            const text = await blob.text();
            if (text && text.trim()) {
                oldData = JSON.parse(text);
                console.log('📖 Found', oldData.length, 'existing visitors');
            }
        } catch (err) {
            console.log('📄 No existing file, starting fresh');
        }

        // 4. Check if same IP + Device already exists
        let isDuplicate = false;
        for (let i = 0; i < oldData.length; i++) {
            if (oldData[i].ip === ip && oldData[i].device === device) {
                isDuplicate = true;
                break;
            }
        }

        console.log('🔍 Is duplicate?', isDuplicate);

        // 5. If duplicate, DON'T SAVE
        if (isDuplicate) {
            return res.json({
                success: false,
                message: 'Already exists',
                count: oldData.length,
                duplicate: true
            });
        }

        // 6. Create new visitor data
        const newVisitor = {
            id: oldData.length + 1,
            vid: vid || `vid_${Date.now()}`,
            ip: ip,
            device: device || 'Unknown',
            browser: browser || 'Unknown',
            screen: screen || 'Unknown',
            language: language || 'Unknown',
            timezone: timezone || 'Unknown',
            page: page || '/',
            referrer: referrer || 'direct',
            time: new Date().toISOString()
        };

        console.log('🆕 New visitor:', newVisitor);

        // 7. Append to old data
        oldData.push(newVisitor);

        // 8. Save back to same file
        const jsonData = JSON.stringify(oldData, null, 2);
        await put('visited.txt', jsonData, {
            access: 'public',
            contentType: 'application/json',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            allowOverwrite: true
        });

        console.log('✅ Saved! Total visitors:', oldData.length);

        // 9. Send response
        res.json({
            success: true,
            saved: true,
            count: oldData.length,
            visitor: newVisitor,
            duplicate: false
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
}