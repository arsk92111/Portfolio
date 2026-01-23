import { put, list } from "@vercel/blob";

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

        // 🔍 list all visit files
        const { blobs } = await list({
            prefix: "visits/",
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        // 🔁 duplicate check (IP + Device)
        for (const blob of blobs) {
            const text = await fetch(blob.url).then(r => r.text());

            if (text.includes(`IP: ${ip}`) && text.includes(`Device: ${device}`)) {
                return res.status(200).json({
                    success: false,
                    message: "Duplicate IP & Device – not saved",
                    count: id,
                });
            }
        }

        // 🆕 new file
        const id = blobs.length + 1;
        const filename = `visits/visits_${id}.txt`;

        const content = `
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

        await put(filename, content, {
            access: "public",
            contentType: "text/plain",
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        res.status(200).json({
            success: true,
            saved: true,
            id,
            count: id,
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
