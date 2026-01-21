import { put, get } from '@vercel/blob';

export default async function handler(req, res) {
    try {
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.socket.remoteAddress ||
            'unknown';

        const userAgent = req.headers['user-agent'] || 'unknown';
        const time = new Date().toISOString();

        // Location (simple IP-based lookup)
        let location = 'unknown';
        try {
            const geo = await fetch(`https://ipapi.co/${ip}/json/`).then(r => r.json());
            location = `${geo.city || ''}, ${geo.country_name || ''}`;
        } catch { }

        const row = `"${time}","${ip}","${location}","${userAgent}"\n`;

        // Try to read existing CSV
        let existing = '';
        try {
            const blob = await get('data/visitors.csv');
            existing = await blob.text();
        } catch { }

        const updatedCSV = existing + row;

        // Save CSV
        await put('data/visitors.csv', updatedCSV, {
            access: 'private',
            contentType: 'text/csv'
        });

        const count = updatedCSV.trim().split('\n').length;

        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ error: 'Tracking failed' });
    }
}
