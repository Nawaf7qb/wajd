let wordsLevel1 = [
    "قَمَرٌ", "بَابٌ", "شَمْسٌ", "عَيْنٌ", "فَمٌ", "يَدٌ", "رِجْلٌ", "شَجَرٌ", "بَحْرٌ",
    "جَبَلٌ", "وَرْدٌ", "نَهْرٌ", "بَيْتٌ", "حِصَانٌ", "قِطٌّ", "زَهْرٌ", "كُرَةٌ", "شَعْرٌ",
    "فِيلٌ", "دُبٌّ", "قِرْدٌ", "بَطَّةٌ", "سَمَكٌ"
];

let wordsLevel2 = [
    "سَمَكَةٌ", "جَبَلٌ", "وَرْدَةٌ", "نَهْرٌ", "بَيْتٌ", "حِصَانٌ", "قِطٌّ", "زَهْرٌ", "كُرَةٌ", "أُذُنٌ",
    "شَعْرٌ", "فِيلٌ", "غَزَالٌ", "دُبٌّ", "قِرْدٌ", "بَطَّةٌ", "مِصْبَاحٌ",
    "سَفِينَةٌ", "مَدْرَسَةٌ", "مَطْبَخٌ", "مَسْجِدٌ", "مُسْتَشْفَى", "مَطَارٌ", "مَحَطَّةٌ", "مَتْحَفٌ", "مَلْعَبٌ", "مَكْتَبَةٌ"
];

let sentencesLevel3 = [
    "الْقَمَرُ سَاطِعٌ", "الْوَلَدُ يَلْعَبُ", "الشَّمْسُ مُشْرِقَةٌ", "الْكِتَابُ جَدِيدٌ",
    "الْجَبَلُ عَالٍ", "الْوَرْدَةُ جَمِيلَةٌ", "الْعُصْفُورُ يُغَرِّدُ", "الْحِصَانُ سَرِيعٌ", "الْكَلْبُ وَفِيٌّ",
    "الْفِيلُ ضَخْمٌ", "الْأَسَدُ قَوِيٌّ", "الْغَزَالُ رَشِيقٌ", "الْبَطَّةُ تَسْبَحُ", "الْفَرَاشَةُ مُلَوَّنَةٌ",
    "الْعَنْكَبُوتُ يَنْسُجُ", "النَّحْلَةُ تَجْمَعُ الْعَسَلَ", "الدُّبُّ قَوِيٌّ",
    "الْقِرْدُ مَرِحٌ", "الْعَيْنُ بَصِيرَةٌ", 
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