import { get, put } from "@vercel/blob";

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
            referrer,
        } = req.body || {};

        const time = new Date().toISOString();
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket?.remoteAddress ||
            "unknown";

        // 1️⃣ Read existing visits file
        let visitors = [];
        try {
            const blob = await get("visits.txt", {
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });
            const text = await blob.text();
            visitors = JSON.parse(text);
        } catch (err) {
        // file doesn't exist or empty = first visitor
            visitors = [];
        }

        // 2️⃣ Check duplicate: IP + Device both same
        const isDuplicate = visitors.some(
            (v) => v.ip === ip && v.device === device
        );
        if (isDuplicate) {
            return res.status(200).json({
                success: false,
                message: "Duplicate visitor (IP + Device), not saved",
                count: visitors.length,
            });
        }

        // 3️⃣ New visitor object
        const newVisitor = {
            id: visitors.length + 1,
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
            time,
        };

        // 4️⃣ Append new visitor
        visitors.push(newVisitor);

        // 5️⃣ Save back to same file
        await put("visits.txt", JSON.stringify(visitors, null, 2), {
            access: "public",
            contentType: "application/json",
            allowOverwrite: true,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        res.status(200).json({
            success: true,
            saved: true,
            count: visitors.length,
            visitor: newVisitor,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
