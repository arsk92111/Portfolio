import { put, get } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // ---- DATA FROM REQUEST ----
        const { email = "" } = req.body || {};

        const time = new Date().toISOString();
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.socket?.remoteAddress ||
            'unknown';

        // ---- GEO LOOKUP ----
        let city = '';
        let country = '';

        try {
            const geoRes = await fetch('https://ipapi.co/json/');
            const geo = await geoRes.json();
            ip_local = geo.ip || '';
            city = geo.city || '';
            country = geo.country_name || '';
        } catch {
            city = '';
            country = '';
        }

        // ---- CSV ROW ----
        const row = `"${ip}","${city}, ${country}","${email}","${time}", "${ip_local}"\n`;

        // ---- READ EXISTING CSV ----
        let existing = '';
        try {
            const blob = await get('visits.csv');
            existing = await blob.text();
        } catch { }

        // ---- ADD HEADER IF FIRST TIME ----
        if (!existing) {
            existing = `"ip","city, country","email","time", "ip_local"\n`;
        }

        // ---- APPEND ----
        const updated = existing + row;

        await put('visits.csv', updated, {
            access: 'public',
            contentType: 'text/csv',
            allowOverwrite: true
        });

        // ---- COUNT ROWS (exclude header) ----
        const count = updated
            .trim()
            .split('\n')
            .slice(1).length;

        res.status(200).json({ count, updated });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
