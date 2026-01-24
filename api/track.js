import { get, put } from '@vercel/blob';

export default async function handler(req, res) {
    // CORS headers
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
        }

        console.log('📡 New request - IP:', ip, 'Device:', device);

        // 3. Try to read existing data
        let allVisitors = [];

        try {
            // First try direct fetch from blob URL
            const blobUrl = 'https://qq2nxd209l2mgsh8.public.blob.vercel-storage.com/visited.txt';
            const response = await fetch(blobUrl);

            if (response.ok) {
                const text = await response.text();
                console.log('📄 Raw file content:', text);

                if (text && text.trim() !== '') {
                    allVisitors = JSON.parse(text);
                    console.log(`✅ Read ${allVisitors.length} existing visitors`);
                }
            } else {
                console.log('📝 File does not exist or empty');
            }
        } catch (err) {
            console.log('❌ Error reading file:', err.message);
        }

        // 4. Check if this IP+Device already exists
        let alreadyExists = false;

        for (let i = 0; i < allVisitors.length; i++) {
            if (allVisitors[i].ip === ip && allVisitors[i].device === device) {
                alreadyExists = true;
                break;
            }
        }

        console.log('🔍 Duplicate check:');
        console.log('- Current IP:', ip);
        console.log('- Current Device:', device);
        console.log('- Already exists?', alreadyExists);
        console.log('- Total existing visitors:', allVisitors.length);

        // 5. If already exists, don't save
        if (alreadyExists) {
            return res.json({
                success: false,
                message: 'IP+Device already exists',
                count: allVisitors.length,
                duplicate: true
            });
        }

        // 6. Create new visitor
        const newVisitor = {
            id: allVisitors.length + 1,
            vid: vid || `visitor_${Date.now()}`,
            ip: ip,
            device: device || 'Unknown',
            browser: browser || 'Unknown',
            screen: screen || 'Unknown',
            language: language || 'Unknown',
            timezone: timezone || 'Unknown',
            page: page || '/',
            referrer: referrer || 'direct',
            time: new Date().toISOString(),
            timestamp: Date.now()
        };

        console.log('🆕 Creating new visitor:', newVisitor);

        // 7. Add to array
        allVisitors.push(newVisitor);
        console.log(`✅ After adding: ${allVisitors.length} total visitors`);

        // 8. Save to file
        const jsonData = JSON.stringify(allVisitors, null, 2);

        await put('visited.txt', jsonData, {
            access: 'public',
            contentType: 'application/json',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            allowOverwrite: true
        });

        console.log('💾 File saved successfully!');

        // 9. Send response
        res.json({
            success: true,
            saved: true,
            count: allVisitors.length,
            visitor: newVisitor,
            duplicate: false
        });

    } catch (error) {
        console.error('🚨 Error:', error);
        res.status(500).json({ error: error.message });
    }
}