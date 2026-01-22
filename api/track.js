import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { email = "", city = "", country = "", ip_local = "" } = req.body;

        const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
        const time = new Date().toISOString();

        // ---- ATOMIC COUNTER ----
        let count;
        try {
            count = await kv.incr("visitors_count");
        } catch (e) {
            return res.status(500).json({ error: "KV not configured" });
        }

        // ---- CSV LOG (optional) ----
        const row = `"${ip}","${city}","${country}","${email}","${time}","${ip_local}"\n`;

        let existing = '';
        try {
            const blob = await get('visits.csv');
            existing = await blob.text();
        } catch { }

        if (!existing) {
            existing = `"ip","city","country","email","time","ip_local"\n`;
        }

        await put('visits.csv', existing + row, {
            access: 'public',
            contentType: 'text/csv',
            allowOverwrite: true
        });

        res.status(200).json({ count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
