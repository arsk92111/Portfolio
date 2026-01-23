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
            referrer
        } = req.body || {};

        const time = new Date().toISOString();
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket?.remoteAddress ||
            "unknown";

        // 1️⃣ Read existing file
        let visitors = [];
        try {
            const blob = await get("visited.txt", {
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });
            const text = await blob.text();
            visitors = JSON.parse(text || "[]");
        } catch {
            visitors = [];
        }

        // 2️⃣ Check duplicate (IP + Device)
        const isDuplicate = visitors.some(
            (v) => v.ip === ip && v.device === device
        );
        if (isDuplicate) {
            return res.status(200).json({
                success: false,
                message: "Duplicate IP & Device – not saved",
                count: visitors.length,
            });
        }

        // 3️⃣ Append new visitor
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
        visitors.push(newVisitor);

        // 4️⃣ Save back to visits.txt
        await put("visited.txt", JSON.stringify(visitors, null, 2), {
            access: "public",
            contentType: "application/json",
            allowOverwrite: true,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        // 5️⃣ Return visitor count
        res.status(200).json({
            success: true,
            count: visitors.length,
            newVisitor,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
