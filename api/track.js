import { put, get } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { email = "", city = "", country = "", ip_local = "" } = req.body || {};

        const time = new Date().toISOString();
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';

        // CSV row
        const row = `"${ip}","${city}","${country}","${email}","${time}","${ip_local}"\n`;

        // Read existing CSV
        let existing = '';
        try {
            const blob = await get('visits.csv');
            existing = await blob.text();
        } catch {
            // file not found = first visitor
        }

        // Add header if first time
        if (!existing) {
            existing = `"ip","city","country","email","time","ip_local"\n`;
        }

        // Append new row
        const updated = existing + row;

        // Save back to Vercel Blob
        await put('visits.csv', updated, {
            access: 'public',
            contentType: 'text/csv',
            allowOverwrite: true
        });

        // Count users (exclude header)
        const count = updated.trim().split('\n').slice(1).length;

        res.status(200).json({ count });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
