import { get, put } from '@vercel/blob';

export default async function handler(req, res) { 
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

    try {  
        // const {
        //     vid, ip_local, city, country, device, page, page_title,
        //     referrer, language, screen, prefers_dark, visit_type,
        //     network_type, downlink, timezone, browser
        // } = req.body;

        const {
            ip_local, city, country, device, language, visit_type, timezone, browser
        } = req.body;

        let ip = 'unknown';
        if (req.headers['x-forwarded-for']) ip = req.headers['x-forwarded-for'].split(',')[0].trim();

        let allVisitors = [];

        try { 
            const blobUrl = 'https://qq2nxd209l2mgsh8.public.blob.vercel-storage.com/visited.txt';
            const response = await fetch(blobUrl);
            if (response.ok) {
                const text = await response.text(); 
                if (text && text.trim() !== '') allVisitors = JSON.parse(text);
            }
        } catch (err) {
            console.log('❌ Error reading file:', err.message);
        }

        let alreadyExists = false;
        for (let i = 0; i < allVisitors.length; i++) {
            if (allVisitors[i].ip === ip && allVisitors[i].device === device) {
                alreadyExists = true;
                break;
            }
        }

        if (alreadyExists) {
            return res.json({
                success: false,
                message: 'IP + Device already exists',
                count: allVisitors.length,
                duplicate: true
            });
        }

        const newVisitor = {
            id: allVisitors.length + 1,
            // vid: vid || `visitor_${Date.now()}`,
            ip: ip,
            ip_local: ip_local || '',
            address: (city + ", " + country) || '',
            device: device || 'Unknown',  
            language: language || 'Unknown', 
            visit_type: visit_type || 'new', 
            timezone: timezone + " - " + new Date().toISOString() || 'Unknown', 
            browser: browser || 'Unknown'
        };

        allVisitors.push(newVisitor);
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
