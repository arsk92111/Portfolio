import { put, get } from '@vercel/blob';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    try {
        const time = new Date().toISOString();
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0] ||
            'unknown';
        const ua = req.headers['user-agent'] || 'unknown';

        const row = `"${time}","${ip}","${ua}"\n`;

        let existing = '';
        try {
            const blob = await get('visits.csv');
            existing = await blob.text();
        } catch { }

        const updated = existing + row;

        await put('visits.csv', updated, {
            access: 'public',
            contentType: 'text/csv',
            allowOverwrite: true
        });


        // Counter
        const count = await kv.incr('visitor_count');

        res.status(200).json({ count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

