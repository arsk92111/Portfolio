import { get, put } from '@vercel/blob';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Get data from request
        const {
            vid,
            device,
            browser,
            screen,
            language,
            timezone,
            page,
            referrer,
            city = "Unknown",
            country = "Unknown",
            ip_local = "Unknown"
        } = req.body || {};

        const time = new Date().toISOString();

        // ✅ **EXACT IP EXTRACTION METHOD FOR VERCEL**
        // This is the MOST IMPORTANT PART
        let ip = "unknown";

        // Method 1: Check x-real-ip (most reliable)
        if (req.headers['x-real-ip']) {
            ip = req.headers['x-real-ip'];
        }
        // Method 2: Check x-forwarded-for
        else if (req.headers['x-forwarded-for']) {
            const forwarded = req.headers['x-forwarded-for'].split(',');
            ip = forwarded[0].trim();
        }
        // Method 3: Check cf-connecting-ip (Cloudflare)
        else if (req.headers['cf-connecting-ip']) {
            ip = req.headers['cf-connecting-ip'];
        }
        // Method 4: Socket remote address
        else if (req.socket?.remoteAddress) {
            ip = req.socket.remoteAddress;
        }

        // Clean IP (remove IPv6 prefix)
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }
        // Handle localhost
        if (ip === '::1') {
            ip = '127.0.0.1';
        }

        console.log("✅ IP Extracted:", ip);
        console.log("✅ Device:", device);

        // 🔹 **READ EXISTING DATA**
        let visitors = [];

        try {
            // First check if file exists
            const blob = await get('visited.txt');
            const text = await blob.text();

            if (text && text.trim() !== '') {
                visitors = JSON.parse(text);
                console.log(`📄 Read ${visitors.length} existing visitors`);
            }
        } catch (err) {
            console.log("📄 Creating new file (first visitor)");
            visitors = [];
        }

        // 🔹 **DUPLICATE CHECK: IP + DEVICE MUST BE SAME**
        const isDuplicate = visitors.some(v =>
            v.ip === ip && v.device === device
        );

        console.log("🔍 Duplicate Check Result:", {
            ip: ip,
            device: device,
            isDuplicate: isDuplicate,
            existingMatches: visitors.filter(v => v.ip === ip && v.device === device).length
        });

        if (isDuplicate) {
            console.log("⏭️ Skipping duplicate (IP+Device already exists)");
            return res.status(200).json({
                success: false,
                message: "Duplicate: Same IP and Device",
                count: visitors.length,
                duplicate: true
            });
        }

        // 🔹 **CREATE NEW VISITOR**
        const newId = visitors.length > 0 ?
            Math.max(...visitors.map(v => v.id)) + 1 : 1;

        const newVisitor = {
            id: newId,
            vid: vid || `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ip: ip,
            city: city,
            country: country,
            ip_local: ip_local,
            device: device,
            browser: browser || navigator.userAgent,
            screen: screen || "Unknown",
            language: language || "Unknown",
            timezone: timezone || "Unknown",
            page: page || "/",
            referrer: referrer || "direct",
            time: time,
            timestamp: Date.now()
        };

        console.log("🆕 New Visitor Data:", newVisitor);

        // 🔹 **APPEND TO EXISTING ARRAY**
        visitors.push(newVisitor);
        console.log(`✅ Total visitors after append: ${visitors.length}`);

        // 🔹 **SAVE BACK TO FILE**
        try {
            await put('visited.txt', JSON.stringify(visitors, null, 2), {
                access: 'public',
                contentType: 'application/json',
                token: process.env.BLOB_READ_WRITE_TOKEN,
                allowOverwrite: true
            });
            console.log("💾 File saved successfully!");
        } catch (error) {
            console.error("❌ Save error:", error);
            return res.status(500).json({
                error: "Failed to save",
                details: error.message
            });
        }

        return res.status(200).json({
            success: true,
            saved: true,
            count: visitors.length,
            visitor: newVisitor,
            duplicate: false,
            message: `Added visitor #${newId}. Total: ${visitors.length}`
        });

    } catch (error) {
        console.error("🚨 Server Error:", error);
        return res.status(500).json({
            error: "Server error",
            message: error.message
        });
    }
}