import { kv } from '@vercel/kv';
import { put } from '@vercel/blob';

export default async function handler(req, res) {
    try {
        const time = new Date().toISOString();
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
        const ua = req.headers['user-agent'] || 'unknown';

        const row = `"${time}","${ip}","${ua}"\n`;

        // ✅ Safe log (unique file)
        await put('visits/visit.csv', row, {
            access: 'public',
            contentType: 'text/csv',
            addRandomSuffix: true
        });

        // ✅ Atomic counter (NO race condition)
        const count = await kv.incr('visitor_count');

        res.status(200).json({ count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
