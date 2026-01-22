import { put, get } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { uniqueId = "", email = "", city = "", country = "", ip_local = "" } = req.body || {};
        const time = new Date().toISOString();
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';

        const row = `"${uniqueId}","${ip}","${city}","${country}","${email}","${time}","${ip_local}"\n`;

        // Read existing CSV
        let existing = '';
        try {
            const blob = await get('visits.csv', { token: process.env.BLOB_READ_WRITE_TOKEN });
            existing = await blob.text();
        } catch {
            console.log("No existing CSV, creating new one");
        }

        if (!existing) {
            existing = `"Unique ID","ip","city","country","email","time","ip_local"\n`;
        }

        const updated = existing + row;

        await put('visits.csv', updated, {
            access: 'public',
            contentType: 'text/csv',
            allowOverwrite: true,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        const count = updated.trim().split('\n').slice(1).length;
        res.status(200).json({ count });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
