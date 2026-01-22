import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { email = "", city = "", country = "", ip_local = "" } = req.body || {};
        const time = new Date().toISOString();

        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket?.remoteAddress ||
            "unknown";

        // 1️⃣ Count existing visit files
        const { blobs } = await list({
            prefix: "visits/visits_",
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        const nextId = blobs.length + 1;

        // 2️⃣ File name
        const filename = `visits/visits_${nextId}.txt`;

        // 3️⃣ File content
        const content = `
                        ID: ${nextId}
                        IP: ${ip}
                        City: ${city}
                        Country: ${country}
                        Email: ${email}
                        IP Local: ${ip_local}
                        Time: ${time}
                        -------------------------
                        `;

        // 4️⃣ Save file (NO overwrite)
        await put(filename, content, {
            access: "public",
            contentType: "text/plain",
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        // let count = 0;
        res.status(200).json({
            success: true,
            id: nextId,
            file: filename,
            count: nextId,
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
