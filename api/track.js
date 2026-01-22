import { put, get } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { email = "", city = "", country = "", ip_local = "" } = req.body;

        const time = new Date().toISOString();
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0] ||
            'unknown';

        const row = `"${ip}","${city}, ${country}","${email}","${time}","${ip_local}"\n`;

        let existing = '';
        try {
            const blob = await get('visits.csv');
            existing = await blob.text();
        } catch { }

        if (!existing) {
            existing = `"ip","city, country","email","time","ip_local"\n`;
        }

        const updated = existing + row;

        await put('visits.csv', updated, {
            access: 'public',
            contentType: 'text/csv',
            allowOverwrite: true
        });

        const count = updated.trim().split('\n').slice(1).length;

        res.status(200).json({ count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
