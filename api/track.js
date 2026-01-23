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

        // 1️⃣ Read existing data
        let existingData = [];
        try {
            const blob = await get("visits.txt", { token: process.env.BLOB_READ_WRITE_TOKEN });
            const text = await blob.text();
            existingData = JSON.parse(text);
            if (!Array.isArray(existingData)) existingData = [];
        } catch (err) {
            existingData = [];
        }

        // 2️⃣ Duplicate check (IP + Device)
        const duplicate = existingData.find(
            entry => entry.ip === ip && entry.device === device
        );

        if (duplicate) {
            return res.status(200).json({
                success: false,
                message: "Duplicate IP + Device – not saved",
                count: existingData.length
            });
        }

        // 3️⃣ Append new record
        const newRecord = {
            id: existingData.length + 1,
            vid,
            ip,
            city,
            country,
            ip_local,
            device,
            browser,
            screen,
            language,
            timezone,
            page,
            referrer,
            time
        };

        existingData.push(newRecord);

        // 4️⃣ Save back to same file
        await put("visits.txt", JSON.stringify(existingData, null, 2), {
            access: "public",
            contentType: "application/json",
            allowOverwrite: true,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        res.status(200).json({
            success: true,
            saved: true,
            count: existingData.length
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
