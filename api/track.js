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

        // ---- Read existing visits file ----
        let existing = '';
        try {
            const blob = await get('visits.txt', { token: process.env.BLOB_READ_WRITE_TOKEN });
            existing = await blob.text();
        } catch {
            existing = ''; // first visitor
        }

        // ---- Check duplicate (IP + Device) ----
        if (existing.includes(`IP: ${ip}`) && existing.includes(`Device: ${device}`)) {
            return res.status(200).json({
                success: false,
                message: "Duplicate IP + Device – data not saved",
                count: existing.trim().split('\n').filter(line => line.startsWith('ID:')).length
            });
        }

        // ---- Generate new ID ----
        const count = existing.trim().split('\n').filter(line => line.startsWith('ID:')).length;
        const id = count + 1;

        // ---- Append new visitor ----
        const row = `
ID: ${id}
VisitorID: ${vid}
IP: ${ip}
City: ${city}
Country: ${country}
IP Local: ${ip_local}
Device: ${device}
Browser: ${browser}
Screen: ${screen}
Language: ${language}
Timezone: ${timezone}
Page: ${page}
Referrer: ${referrer}
Time: ${time}
-------------------------
`;

        const updated = existing + row;

        // ---- Save back ----
        await put('visits.txt', updated, {
            access: "public",
            contentType: "text/plain",
            allowOverwrite: true,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        res.status(200).json({
            success: true,
            saved: true,
            id,
            count: id
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
