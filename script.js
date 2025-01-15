// تعريف المتغيرات
let wordsLevel1 = [
    "قَمَرٌ", "بَابٌ", "شَمْسٌ", "عَيْنٌ", "فَمٌ", "يَدٌ", "رِجْلٌ", "رَأْسٌ", "شَجَرٌ", "بَحْرٌ",
    "جَبَلٌ", "وَرْدٌ", "نَهْرٌ", "بَيْتٌ", "حِصَانٌ", "قِطٌّ", "زَهْرٌ", "كُرَةٌ", "أُذُنٌ", "شَعْرٌ",
    "أَسَدٌ", "فِيلٌ", "ذِئْبٌ", "غَزَالٌ", "دُبٌّ", "قِرْدٌ", "بَطَّةٌ", "فَأْرٌ", "مِصْبَاحٌ", "سَمَكٌ"
];

let wordsLevel2 = [
    "سَمَكَةٌ", "جَبَلٌ", "وَرْدَةٌ", "نَهْرٌ", "بَيْتٌ", "حِصَانٌ", "قِطٌّ", "زَهْرٌ", "كُرَةٌ", "أُذُنٌ",
    "شَعْرٌ", "أَسَدٌ", "فِيلٌ", "ذِئْبٌ", "غَزَالٌ", "دُبٌّ", "قِرْدٌ", "بَطَّةٌ", "فَأْرٌ", "مِصْبَاحٌ",
    "سَفِينَةٌ", "مَدْرَسَةٌ", "مَطْبَخٌ", "مَسْجِدٌ", "مُسْتَشْفَى", "مَطَارٌ", "مَحَطَّةٌ", "مَتْحَفٌ", "مَلْعَبٌ", "مَكْتَبَةٌ"
];

let sentencesLevel3 = [
    "الْقَمَرُ سَاطِعٌ", "الْوَلَدُ يَلْعَبُ", "الْبَحْرُ هَادِئٌ", "الشَّمْسُ مُشْرِقَةٌ", "الْكِتَابُ جَدِيدٌ",
    "الْجَبَلُ عَالٍ", "الْوَرْدَةُ جَمِيلَةٌ", "الْعُصْفُورُ يُغَرِّدُ", "الْحِصَانُ سَرِيعٌ", "الْكَلْبُ وَفِيٌّ",
    "الْفِيلُ ضَخْمٌ", "الْأَسَدُ قَوِيٌّ", "الْغَزَالُ رَشِيقٌ", "الْبَطَّةُ تَسْبَحُ", "الْفَرَاشَةُ مُلَوَّنَةٌ",
    "الْعَنْكَبُوتُ يَنْسُجُ", "النَّحْلَةُ تَجْمَعُ الْعَسَلَ", "السُّلَحْفَاةُ بَطِيئَةٌ", "الذِّئْبُ مُخَادِعٌ", "الدُّبُّ قَوِيٌّ",
    "الْقِرْدُ مَرِحٌ", "الْحَمَامَةُ بَيضَاءُ", "الْفَأْرُ صَغِيرٌ", "الْعَيْنُ بَصِيرَةٌ", "الْأُذُنُ سَمِيعَةٌ",
    "الْفَمُ يَتَكَلَّمُ", "الْيَدُ تَعْمَلُ", "الرِّجْلُ تَمْشِي", "الرَّأْسُ يَفْكُرُ", "الشَّعْرُ نَاعِمٌ"
];

let correctWord = ""; // الكلمة الصحيحة للتحدي الحالي
let mediaRecorder;
let audioChunks = [];
let recognition;
let isRecording = false; // متغير لتتبع حالة التسجيل
let stream; // متغير لتخزين تدفق الميكروفون
let audioContext; // متغير لتخزين AudioContext

// دالة لإزالة الحركات والتنوين من النص
function removeTashkeel(text) {
    return text.replace(/[\u064B-\u065F\u0610-\u061A]/g, ''); // إزالة الحركات والتنوين
}

// دالة لمقارنة النطق المسجل بالكلمة الصحيحة مع مراعاة نسبة 80%
function isPronunciationCorrect(spokenText, correctText) {
    // إزالة التشكيل والتنوين من النص المسجل والنص الصحيح
    const cleanedSpokenText = removeTashkeel(spokenText).trim();
    const cleanedCorrectText = removeTashkeel(correctText).trim();

    let correctChars = 0;
    const minLength = Math.min(cleanedSpokenText.length, cleanedCorrectText.length);

    for (let i = 0; i < minLength; i++) {
        if (cleanedSpokenText[i] === cleanedCorrectText[i]) {
            correctChars++;
        }
    }

    const accuracy = (correctChars / cleanedCorrectText.length) * 100;
    return accuracy >= 80; // يعتبر النطق صحيحًا إذا كانت الدقة 80% أو أكثر
}

// دالة لتحويل النص إلى كلام (Text-to-Speech) مع التشكيل
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA"; // تعيين اللغة إلى العربية السعودية
    utterance.rate = 1; // سرعة النطق (1 = سرعة عادية)
    utterance.pitch = 1; // درجة الصوت (1 = درجة عادية)
    speechSynthesis.speak(utterance); // بدء النطق
}

// دالة لإعادة نطق الكلمة مع التشكيل
function replayWord() {
    if (correctWord) {
        speakText(correctWord); // نطق الكلمة الصحيحة مع التشكيل
    } else {
        console.log("لا توجد كلمة صحيحة معروضة حاليًا.");
    }
}

// دالة لإظهار زر إعادة النطق
function showReplayButton() {
    const replayButton = document.getElementById("replay-button");
    replayButton.classList.remove("hidden"); // إظهار الزر
}

// عند تحميل الصفحة
window.onload = function () {
    console.log("تم تحميل الصفحة بنجاح!");
    const selectedLevel = localStorage.getItem("selectedLevel");
    if (selectedLevel) {
        startChallenge(selectedLevel);
    } else {
        window.location.href = "index.html"; // إذا لم يتم اختيار مستوى، العودة للصفحة الرئيسية
    }
};

// بدء التحدي
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

    correctWord = challengeText; // حفظ الكلمة الصحيحة
    document.getElementById("challenge-title").innerText = `المستوى ${level}`;
    document.getElementById("challenge-text").innerText = challengeText;

    // لا يتم نطق الكلمة هنا، بل بعد أن ينطق الطالب الكلمة السابقة
}

// تبديل بين بدء وإيقاف التسجيل
async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecordingAndAnalysis();
    }
    isRecording = !isRecording; // تبديل حالة التسجيل
    updateButtonText(); // تحديث نص الزر
}

// تحديث نص الزر بناءً على حالة التسجيل
function updateButtonText() {
    const recordButton = document.getElementById("record-button");
    const stopRecordButton = document.getElementById("stop-record-button");
    const replayButton = document.getElementById("replay-button");

    if (isRecording) {
        recordButton.classList.add("hidden"); // إخفاء زر "سجّل صوتك"
        stopRecordButton.classList.remove("hidden"); // إظهار زر "إيقاف التسجيل"
        replayButton.classList.add("hidden"); // إخفاء زر "إعادة نطق الكلمة"
    } else {
        recordButton.classList.remove("hidden"); // إظهار زر "سجّل صوتك"
        stopRecordButton.classList.add("hidden"); // إخفاء زر "إيقاف التسجيل"
        replayButton.classList.remove("hidden"); // إظهار زر "إعادة نطق الكلمة"
    }
}

// بدء التسجيل والتحليل
async function startRecordingAndAnalysis() {
    console.log("بدء التسجيل...");
    try {
        // إعادة تهيئة المتغيرات عند كل تسجيل جديد
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // إيقاف تدفق الميكروفون الحالي
        }
        audioChunks = []; // إعادة تهيئة المصفوفة لتخزين القطع الصوتية

        // إخفاء زر إعادة النطق عند بدء التسجيل
        const replayButton = document.getElementById("replay-button");
        replayButton.classList.add("hidden");

        // طلب إذن الميكروفون
        console.log("جاري طلب إذن استخدام الميكروفون...");
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("تم منح الإذن بنجاح!");

        // إنشاء كائن AudioContext لتحليل الصوت
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // إنشاء كائن MediaRecorder لتسجيل الصوت
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

        // بدء التسجيل
        mediaRecorder.start();

        // إنشاء كائن SpeechRecognition للتعرف على الكلام
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "ar-SA"; // تعيين اللغة إلى العربية
        recognition.interimResults = false; // نتائج نهائية فقط
        recognition.maxAlternatives = 3; // نتيجة واحدة فقط
        recognition.continuous = false; // التعرف على كلمة واحدة فقط
        recognition.interimResults = false; // نتائج نهائية فقط

        // عند الحصول على نتيجة التعرف على الكلام
        recognition.onresult = (event) => {
            const spokenText = event.results[0][0].transcript; // النص الذي نطقه الطالب
            console.log("النطق المسجل:", spokenText);

            // مقارنة النطق المسجل بالكلمة الصحيحة مع مراعاة نسبة 80%
            if (isPronunciationCorrect(spokenText, correctWord)) {
                document.getElementById("feedback").innerText = "القراءة صحيحة 🎉";

                // إضافة تأخير قبل إيقاف التسجيل لإعطاء الوقت الكافي لإنهاء الكلمة
                setTimeout(() => {
                    stopRecording(); // إيقاف التسجيل بعد التأخير
                }, 500); // تأخير 500 مللي ثانية (نصف ثانية)

                // نطق الكلمة الصحيحة بصوت عالٍ
                speakText(correctWord);

                // إظهار زر إعادة النطق بعد ظهور النتيجة
                showReplayButton();
            } else {
                document.getElementById("feedback").innerText = "القراءة خاطئة ❌";
            }
        };

        recognition.onerror = (event) => {
            console.error("خطأ في التعرف على الكلام:", event.error);
            document.getElementById("feedback").innerText = "حدث خطأ أثناء التحليل!";
        };

        recognition.onend = () => {
            console.log("انتهى التعرف على الكلام.");
        };

        // بدء التعرف على الكلام
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

// إيقاف التسجيل يدويًا أو تلقائيًا
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        recognition.stop(); // إيقاف التعرف على الكلام
        isRecording = false; // تحديث حالة التسجيل
        updateButtonText(); // تحديث نص الزر

        // إظهار زر إعادة النطق عند إيقاف التسجيل
        showReplayButton();

        console.log("تم إيقاف التسجيل!");
    }
}

// دالة لتجديد الكلمة
function refreshPage() {
    window.location.reload(); // إعادة تحميل الصفحة لتجديد الكلمة
}