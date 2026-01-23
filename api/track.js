import { put, get } from "@vercel/blob";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const {
            vid,
            city,
            country,
            ip_local,
            device,
            browser,
            screen,
            language,
            timezone,
            page,
            referrer
        } = req.body || {};

        const time = new Date().toISOString();
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket?.remoteAddress ||
            "unknown";

        // ---- 1️⃣ Read existing file ----
        let existingText = '';
        try {
            const blob = await get('visits.txt', { token: process.env.BLOB_READ_WRITE_TOKEN });
            existingText = await blob.text();
        } catch {
            existingText = ''; // first visitor
        }

        // ---- 2️⃣ Convert existing data to JSON array ----
        let records = [];
        if (existingText) {
            records = existingText
                .split('-------------------------')
                .map(block => block.trim())
                .filter(Boolean)
                .map(block => {
                    const obj = {};
                    block.split('\n').forEach(line => {
                        const [key, ...rest] = line.split(':');
                        if (key && rest) obj[key.trim()] = rest.join(':').trim();
                    });
                    return obj;
                });
        }

        // ---- 3️⃣ Duplicate check ----
        const isDuplicate = records.some(r => r.IP === ip && r.Device === device);
        if (isDuplicate) {
            return res.status(200).json({
                success: false,
                message: "Duplicate IP + Device – data not saved",
                count: records.length
            });
        }

        // ---- 4️⃣ Append new visitor ----
        const id = records.length + 1;
        const newRecord = {
            ID: String(id),
            VisitorID: vid,
            IP: ip,
            City: city,
            Country: country,
            "IP Local": ip_local,
            Device: device,
            Browser: browser,
            Screen: screen,
            Language: language,
            Timezone: timezone,
            Page: page,
            Referrer: referrer,
            Time: time
        };
        records.push(newRecord);

        // ---- 5️⃣ Convert JSON array back to text ----
        const updatedText = records
            .map(r =>
                Object.entries(r)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join('\n') + '\n-------------------------\n'
            )
            .join('');

        // ---- 6️⃣ Save back to same file ----
        await put('visits.txt', updatedText, {
            access: "public",
            contentType: "text/plain",
            allowOverwrite: true,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        res.status(200).json({
            success: true,
            saved: true,
            id,
            count: records.length
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
