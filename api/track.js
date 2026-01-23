import { get, put } from '@vercel/blob';

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

        // ✅ **PROPER IP EXTRACTION FOR VERCEL**
        // Vercel mein IP multiple headers mein milta hai
        let ip = "unknown";

        // Try different headers for IP
        const headers = req.headers;

        if (headers['x-real-ip']) {
            ip = headers['x-real-ip'];
        } else if (headers['x-forwarded-for']) {
            // X-Forwarded-For mein multiple IPs ho sakte hain
            const forwardedIps = headers['x-forwarded-for'].split(',');
            ip = forwardedIps[0].trim();
        } else if (headers['cf-connecting-ip']) {
            ip = headers['cf-connecting-ip'];
        } else if (req.socket && req.socket.remoteAddress) {
            ip = req.socket.remoteAddress;
        } else if (req.connection && req.connection.remoteAddress) {
            ip = req.connection.remoteAddress;
        }

        // IPv6 ko IPv4 mein convert karein agar possible ho
        if (ip === '::1' || ip === '::ffff:127.0.0.1') {
            ip = '127.0.0.1';
        }

        // Remove IPv6 prefix if present
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }

        console.log(`🔍 Tracking request from IP: ${ip}, Device: ${device}`);
        console.log(`🔍 Headers:`, JSON.stringify(headers, null, 2));

        // 🔹 1️⃣ Read existing visited.txt file
        let visitors = [];
        let fileExists = true;

        try {
            const blob = await get('visited.txt');
            const text = await blob.text();

            if (text && text.trim() !== '') {
                visitors = JSON.parse(text);
                console.log(`📊 Found ${visitors.length} existing visitors`);
            } else {
                visitors = [];
                console.log('📄 File is empty, starting fresh');
            }
        } catch (err) {
            if (err.message.includes('No blob found') || err.message.includes('No such blob')) {
                console.log('📄 File does not exist, starting fresh');
                visitors = [];
                fileExists = false;
            } else {
                console.error('❌ Error reading file:', err);
                visitors = [];
            }
        }

        // 🔹 2️⃣ Check duplicate: only skip if BOTH IP + Device match EXACTLY
        const isDuplicate = visitors.some(
            (v) => v.ip === ip && v.device === device
        );

        console.log(`🔍 Checking duplicate: IP=${ip}, Device=${device}`);
        console.log(`🔍 Visitors to check against:`, visitors.map(v => ({ ip: v.ip, device: v.device })));
        console.log(`🔍 Duplicate Found? ${isDuplicate}`);

        if (isDuplicate) {
            return res.status(200).json({
                success: false,
                message: "Duplicate visitor (IP + Device), not saved",
                count: visitors.length,
                duplicate: true,
                ip: ip,
                device: device
            });
        }

        // 🔹 3️⃣ Generate new ID
        const newId = visitors.length > 0 ?
            Math.max(...visitors.map(v => v.id || 0)) + 1 : 1;

        // 🔹 4️⃣ New visitor object
        const newVisitor = {
            id: newId,
            vid: vid || `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ip: ip,
            city: city || "Unknown",
            country: country || "Unknown",
            ip_local: ip_local || ip,
            device: device || "Unknown",
            browser: (browser || "Unknown").substring(0, 200),
            screen: screen || "Unknown",
            language: language || "Unknown",
            timezone: timezone || "Unknown",
            page: page || "/",
            referrer: referrer || "direct",
            time: time,
            timestamp: Date.now()
        };

        console.log("🆕 New visitor to add:", newVisitor);

        // 🔹 5️⃣ Append new visitor
        visitors.push(newVisitor);
        console.log(`✅ Total visitors now: ${visitors.length}`);

        // 🔹 6️⃣ Save back to visited.txt
        try {
            const jsonString = JSON.stringify(visitors, null, 2);
            console.log(`💾 Saving ${visitors.length} visitors to visited.txt`);

            const blob = await put('visited.txt', jsonString, {
                access: 'public',
                contentType: 'application/json',
                token: process.env.BLOB_READ_WRITE_TOKEN,
                allowOverwrite: true
            });

            console.log('✅ File saved successfully');
            console.log('✅ New visitor added:', newVisitor);

        } catch (error) {
            console.error('❌ Error saving file:', error);
            return res.status(500).json({
                error: "Failed to save data",
                details: error.message,
                ip: ip,
                device: device
            });
        }

        return res.status(200).json({
            success: true,
            saved: true,
            count: visitors.length,
            visitor: newVisitor,
            duplicate: false,
            message: `Visitor #${newId} added. Total: ${visitors.length}`,
            ip: ip,
            device: device
        });

    } catch (e) {
        console.error('🚨 Server error:', e);
        return res.status(500).json({
            error: "Internal server error",
            message: e.message,
            stack: e.stack
        });
    }
}