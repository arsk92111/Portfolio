// Use ES modules or CommonJS consistently
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

        // Get IP address (Vercel specific)
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.headers['x-real-ip'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            "unknown";

        console.log(`🔍 Tracking request from IP: ${ip}, Device: ${device}`);

        // 🔹 1️⃣ Read existing visited.txt file
        let visitors = [];
        try {
            const { url, downloadUrl } = await get('visited.txt');
            console.log(`📄 File URL: ${url}`);

            const response = await fetch(downloadUrl);
            if (response.ok) {
                const text = await response.text();
                if (text && text.trim() !== '') {
                    visitors = JSON.parse(text);
                    console.log(`📊 Found ${visitors.length} existing visitors`);
                } else {
                    visitors = [];
                    console.log('📄 File is empty, starting fresh');
                }
            } else {
                console.log('📄 File does not exist, starting fresh');
                visitors = [];
            }
        } catch (err) {
            console.log('📄 Error reading file, starting fresh:', err.message);
            visitors = [];
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
            vid: vid || `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ip,
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
            time,
            timestamp: Date.now()
        };

        console.log("🆕 New visitor to add:", newVisitor);

        // 🔹 5️⃣ Append new visitor
        visitors.push(newVisitor);
        console.log(`✅ Total visitors now: ${visitors.length}`);

        // 🔹 6️⃣ Save back to visited.txt WITH allowOverwrite: true
        try {
            const jsonString = JSON.stringify(visitors, null, 2);
            console.log(`💾 Saving ${visitors.length} visitors to visited.txt`);

            const blob = await put('visited.txt', jsonString, {
                access: 'public',
                contentType: 'application/json',
                token: process.env.BLOB_READ_WRITE_TOKEN,
                allowOverwrite: true  // ✅ THIS IS CRITICAL
            });

            console.log('✅ File saved successfully:', blob.url);

        } catch (error) {
            console.error('❌ Error saving file:', error);
            return res.status(500).json({
                error: "Failed to save data",
                details: error.message
            });
        }

        return res.status(200).json({
            success: true,
            saved: true,
            count: visitors.length,
            visitor: newVisitor,
            duplicate: false,
            message: `Visitor #${newId} added. Total: ${visitors.length}`
        });

    } catch (e) {
        console.error('🚨 Server error:', e);
        return res.status(500).json({
            error: "Internal server error",
            message: e.message
        });
    }
}