import { put, get } from '@vercel/blob';

export default async function handler(req, res) {
    try {
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.socket.remoteAddress ||
            'unknown';

        const userAgent = req.headers['user-agent'] || 'unknown';
        const time = new Date().toISOString();

        let location = 'unknown';
        try {
            const geo = await fetch('https://ipapi.co/json/');
            const data = await geo.json();
            location = `${data.city || ''}, ${data.country_name || ''}`;
        } catch { }

        const line = `"${time}","${ip}","${location}","${userAgent}"\n`;

        // Store each visit as a CSV line
        await put(`visits/${Date.now()}.csv`, line, {
            access: 'public',
            contentType: 'text/csv'
        });

        // Counter
        let count = 1;
        try {
            const counter = await get('counter.txt');
            count = parseInt(await counter.text()) + 1;
        } catch { }

        await put('counter.txt', String(count), {
            access: 'public',
            contentType: 'text/plain'
        });

        res.status(200).json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
