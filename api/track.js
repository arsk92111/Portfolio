import { get, put } from "@vercel/blob";

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

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
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.socket?.remoteAddress ||
            "unknown";

        console.log("🔍 Tracking request from IP:", ip, "Device:", device);

        // 🔹 1️⃣ Read existing visited.txt file (NOT visits.txt)
        let visitors = [];
        let existingData = null;

        try {
            const blob = await get("visited.txt", {
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });
            existingData = await blob.text();
            console.log("📄 File content:", existingData.substring(0, 200) + "...");

            // Parse JSON, handle empty or invalid JSON
            if (existingData && existingData.trim() !== "") {
                visitors = JSON.parse(existingData);
            } else {
                visitors = [];
            }

            console.log(`📊 Found ${visitors.length} existing visitors`);
        } catch (err) {
            if (err.message.includes("No such blob")) {
                console.log("📄 No existing file, creating new one");
                visitors = [];
            } else if (err instanceof SyntaxError) {
                console.log("⚠️ JSON parse error, starting fresh");
                visitors = [];
            } else {
                console.error("❌ Error reading file:", err);
                visitors = [];
            }
        }

        // 🔹 2️⃣ Check duplicate: only skip if BOTH IP + Device match
        const isDuplicate = visitors.some(
            (v) => v.ip === ip && v.device === device
        );

        console.log(`🔍 Duplicate check: IP=${ip}, Device=${device}, IsDuplicate=${isDuplicate}`);

        if (isDuplicate) {
            return res.status(200).json({
                success: false,
                message: "Duplicate visitor (IP + Device), not saved",
                count: visitors.length,
                duplicate: true
            });
        }

        // 🔹 3️⃣ Generate new ID
        const newId = visitors.length > 0 ?
            Math.max(...visitors.map(v => v.id || 0)) + 1 : 1;

        // 🔹 4️⃣ New visitor object
        const newVisitor = {
            id: newId,
            vid: vid || `visitor_${Date.now()}`,
            ip,
            city: city || "Unknown",
            country: country || "Unknown",
            ip_local: ip_local || ip,
            device: device || "Unknown",
            browser: (browser || "Unknown").substring(0, 200), // Limit length
            screen: screen || "Unknown",
            language: language || "Unknown",
            timezone: timezone || "Unknown",
            page: page || "/",
            referrer: referrer || "direct",
            time,
            timestamp: Date.now()
        };

        console.log("🆕 New visitor to add:", newVisitor);

        // 🔹 5️⃣ Append new visitor
        visitors.push(newVisitor);
        console.log(`✅ Total visitors now: ${visitors.length}`);

        // 🔹 6️⃣ Save back to SAME FILE (visited.txt)
        try {
            const jsonString = JSON.stringify(visitors, null, 2);
            console.log(`💾 Saving ${visitors.length} visitors to visited.txt`);

            await put("visited.txt", jsonString, {
                access: "public",
                contentType: "application/json",
                allowOverwrite: true,
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });

            console.log("✅ File saved successfully to visited.txt");

            // Verify by reading back
            const verifyBlob = await get("visited.txt", {
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });
            const verifyText = await verifyBlob.text();
            const verifyVisitors = JSON.parse(verifyText);
            console.log(`✅ Verified: ${verifyVisitors.length} visitors in file`);

        } catch (error) {
            console.error("❌ Error saving file:", error);
            return res.status(500).json({
                error: "Failed to save data",
                details: error.message
            });
        }

        res.status(200).json({
            success: true,
            saved: true,
            count: visitors.length,
            visitor: newVisitor,
            duplicate: false,
            message: `Appended visitor #${newId}. Total: ${visitors.length}`
        });

    } catch (e) {
        console.error("🚨 Server error:", e);
        res.status(500).json({
            error: "Internal server error",
            message: e.message,
            stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
        });
    }
}