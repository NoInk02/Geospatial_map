// import React, { useState, useRef } from "react";
// import RecordRTC from "recordrtc";

// const AudioRecorder = ({ onTranscription }) => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const recorderRef = useRef(null);
//   const silenceTimer = useRef(null);

//   // 🎙 Start Recording
//   const startRecording = async () => {
//     setIsRecording(true);
//     setIsProcessing(false);

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new RecordRTC(stream, {
//         type: "audio",
//         mimeType: "audio/webm",
//         recorderType: RecordRTC.StereoAudioRecorder,
//         numberOfAudioChannels: 1,
//         timeSlice: 500, // Check silence every 500ms
//         ondataavailable: () => checkSilence(recorder),
//       });

//       recorder.startRecording();
//       console.log("Started recording");
//       recorderRef.current = recorder;

//       // Stop after 15s max if silence is not detected
//       setTimeout(() => stopRecording(), 15000);
//     } catch (err) {
//       console.error("Error starting recording:", err);
//       setIsRecording(false);
//     }
//   };

//   // 🔎 Check Silence
//   const checkSilence = (recorder) => {
//     const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//     const analyser = audioContext.createAnalyser();
//     const source = audioContext.createMediaStreamSource(recorder.stream);
//     source.connect(analyser);

//     const dataArray = new Uint8Array(analyser.frequencyBinCount);
//     analyser.getByteFrequencyData(dataArray);

//     const avgVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

//     if (avgVolume < 5) {
//       if (!silenceTimer.current) {
//         silenceTimer.current = setTimeout(() => stopRecording(), 5000);
//       }
//     } else {
//       clearTimeout(silenceTimer.current);
//       silenceTimer.current = null;
//     }
//   };

//   // 🛑 Stop Recording & Send Audio
//   const stopRecording = () => {
//     if (!recorderRef.current) return;

//     recorderRef.current.stopRecording(async () => {
//       setIsRecording(false);
//       setIsProcessing(true);

//       const audioBlob = recorderRef.current.getBlob();
//       const formData = new FormData();
//       formData.append("file", audioBlob, "audio.webm");

//       try {
//         const response = await fetch("http://localhost:8000/transcribe/", {
//           method: "POST",
//           body: formData,
//         });

//         const data = await response.json();
//         console.log("Transcription Result:", data);

//         // Pass transcribed text to parent (SearchBar)
//         onTranscription(data.transcription);
//       } catch (err) {
//         console.error("Error sending audio:", err);
//       }

//       setIsProcessing(false);
//     });
//   };

//   return (
//     <button
//       type="button"
//       onClick={startRecording}
//       disabled={isRecording || isProcessing}
//       className={`text-gray-500 hover:text-gray-700 px-3 ${isRecording ? "animate-pulse" : ""}`}
//     >
//       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
//         <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
//         <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
//       </svg>
//     </button>
//   );
// };

// export default AudioRecorder;

import React, { useState, useRef } from "react";
import RecordRTC from "recordrtc";

const AudioRecorder = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recorderRef = useRef(null);
  const silenceTimeout = useRef(null);
  const streamRef = useRef(null);
  let audioContext, analyser, dataArray, source;

  // 🎙 Toggle Recording (Start/Stop)
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // 🎤 Start Recording
  const startRecording = async () => {
    setIsRecording(true);
    setIsProcessing(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup silence detection
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm",
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1,
      });

      recorder.startRecording();
      recorderRef.current = recorder;
      console.log("🎤 Recording started...");

      // Stop after 15s max
      setTimeout(() => stopRecording(), 15000);

      // Start checking for silence
      checkSilence();
    } catch (err) {
      console.error("❌ Error starting recording:", err);
      setIsRecording(false);
    }
  };

  // 🔎 Check Silence
  const checkSilence = () => {
    if (!isRecording) return;

    analyser.getByteFrequencyData(dataArray);
    const avgVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

    if (avgVolume < 5) {
      if (!silenceTimeout.current) {
        console.log("🤫 Silence detected... stopping in 5s");
        silenceTimeout.current = setTimeout(() => stopRecording(), 5000);
      }
    } else {
      clearTimeout(silenceTimeout.current);
      silenceTimeout.current = null;
    }

    setTimeout(checkSilence, 500);
  };

  // 🛑 Stop Recording
  const stopRecording = () => {
    if (!recorderRef.current || !isRecording) return;

    setIsRecording(false);
    console.log("🛑 Stopping recording...");

    recorderRef.current.stopRecording(async () => {
      setIsProcessing(true);

      const audioBlob = recorderRef.current.getBlob();
      console.log("🎧 Recorded Audio:", audioBlob);

      // Stop media stream
      streamRef.current.getTracks().forEach((track) => track.stop());

      sendToBackend(audioBlob);
    });
  };

  // 🔗 Send Audio to Backend
  const sendToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");

    try {
      const response = await fetch("http://127.0.0.1:8000/transcribe/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("✅ Transcription Result:", data);

      onTranscription(data.transcription);
    } catch (err) {
      console.error("❌ Error sending audio:", err);
      alert("Could not send audio. Check if the backend is running.");
    }

    setIsProcessing(false);
  };

  return (
    <button
      type="button"
      onClick={toggleRecording}
      disabled={isProcessing}
      className={`text-gray-500 hover:text-gray-700 px-3 ${isRecording ? "animate-pulse" : ""}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
      </svg>
    </button>
  );
};

export default AudioRecorder;





