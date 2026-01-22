import { put, get } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const time = new Date().toISOString();
        const ip =
            req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
        const ua = req.headers['user-agent'] || 'unknown';

        const row = `"${ip}","${time}","${ua}"\n`;

        // ---- READ EXISTING CSV ----
        let existing;
        try {
            const blob = await get('visits.csv');
            existing = await blob.text();
        } catch {
            // file not found = first visitor
        }

        // ---- APPEND NEW ROW ----
        const updated = existing + row;

        await put('visits.csv', updated, {
            access: 'public',
            contentType: 'text/csv',
            allowOverwrite: true
        });

        // ---- COUNT ROWS ----
        const count = updated
            .trim()
            .split('\n')
            .filter(Boolean).length;

        res.status(200).json({ count, updated });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
