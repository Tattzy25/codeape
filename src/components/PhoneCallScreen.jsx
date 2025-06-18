import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Volume2, Mic, MicOff } from 'lucide-react';
import elevenlabsService from '../services/elevenlabsService';

const RING_DURATION =8000; //8 seconds
const AUDIO_LEVEL_THRESHOLD_YELLING =0.7;
const AUDIO_LEVEL_THRESHOLD_QUIET =0.1;

const PhoneCallScreen = ({ onEndCall }) => {
 const [isRinging, setIsRinging] = useState(false);
 const [isConnected, setIsConnected] = useState(false);
 const [isListening, setIsListening] = useState(false);
 const [isSpeaking, setIsSpeaking] = useState(false);
 const [callDuration, setCallDuration] = useState(0);
 const [micMuted, setMicMuted] = useState(false);
 const [speakerOn, setSpeakerOn] = useState(true);
 const [isRecording, setIsRecording] = useState(false);
 const [micPermission, setMicPermission] = useState(null);
 const [showMicPrompt, setShowMicPrompt] = useState(false);
 const [audioLevel, setAudioLevel] = useState(0);
 const [userMood, setUserMood] = useState('neutral');
 const [isYelling, setIsYelling] = useState(false);
 const cooldownPeriodRef = useRef(false);
 const conversationContextRef = useRef([]);
 const audioContextRef = useRef(null);
 const analyserRef = useRef(null);
 const microphoneRef = useRef(null);
 const animationFrameRef = useRef(null);
 const callTimerRef = useRef(null);
 const audioRef = useRef(null);
 const ringAudioRef = useRef(null);
 const recordingTimeoutRef = useRef(null);

 const armenianGreeting = "Aallo... lsumem ova ?, what you need, bro?";

  // Dynamic conversation handler with mood and audio analysis
  const generateDynamicResponse = (userInput) => {
    const input = userInput.toLowerCase();
    conversationContextRef.current.push({ 
      type: 'user', 
      text: userInput, 
      mood: userMood, 
      audioLevel: audioLevel, 
      isYelling: isYelling,
      timestamp: Date.now()
    });
    
    let response = "";
    
    // React to user's emotional state first
    if (isYelling) {
      const yellingResponses = [
        "Whoa whoa whoa, ara! Why you yelling at me, bro? Calm down",
        "Ey, no need to raise your voice, ara! I can hear you just fine",
        "Bro,Take a deep breath. What's really bothering you?"
      ];
      response = yellingResponses[Math.floor(Math.random() * yellingResponses.length)];
    }
    else if (userMood === 'sad' && audioLevel < 0.3) {
      const sadResponses = [
        "Ara, you sound down. What's going on? Talk to me.",
        "Hey, I can tell something's bothering you. You okay, ara?",
        "Bro, your voice sounds heavy. What's weighing on your mind?"
      ];
      response = sadResponses[Math.floor(Math.random() * sadResponses.length)];
    }
    else if (userMood === 'excited') {
      const excitedResponses = [
        "Ara, I love the energy, bro are your jerking off? You sound pumped up!",
        "Jan Axper! You got that fire in you.",
        "Bro, your excitement is contagious! What's got you so hyped, aper?"
      ];
      response = excitedResponses[Math.floor(Math.random() * excitedResponses.length)];
    }
    else if (audioLevel < 0.1) {
      response = "Ara, speak up bro! I can barely hear you, jan. Don't be shy!";
    }
    
    // Money/business related
    else if (input.includes('money') || input.includes('business') || input.includes('deal')) {
      const moneyResponses = [
        "Why you care how I make money, ara?",
        "Bro, I made more money today than you'll see all month. Mind your own business",
        "Listen ara, my business is my business. You focus on your own hustle, bro!"
      ];
      response = moneyResponses[Math.floor(Math.random() * moneyResponses.length)];
    }
    // Greeting responses
    else if (input.includes('hey') || input.includes('hi') || input.includes('hello') || input.includes('what\'s up')) {
      const greetingResponses = [
        "Ara, what's good bro? I'm out here grinding, making moves!",
        "Hey jan, I'm busy counting money but I got time for you. What you need?",
        "What's up ara? Just closed another deal, business is booming!"
      ];
      response = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    }
    // Roasting/challenging responses
    else if (input.includes('stupid') || input.includes('dumb') || input.includes('idiot')) {
      response = "Ara, who you calling stupid? I'm making millions while you're sitting there talking nonsense, jan!";
    }
    // Car related
    else if (input.includes('car') || input.includes('mercedes') || input.includes('bmw')) {
      response = "Bro, I got three Mercedes in my garage. What you driving, a Honda? Ara, step your game up!";
    }
    // Generic challenging responses
    else {
      const genericResponses = [
        "Ara, what you trying to say bro? Speak up, I don't have all day!",
        "Lsi ay txa, I'm busy making money moves. Get to the point!",
        "Bro, you called me to waste my time? I charge by the minute, ara!",
        "What's your point? I got business to handle!"
      ];
      response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
    
    conversationContextRef.current.push({ type: 'kyartu', text: response });
    return response;
  };

  // Real microphone permission and audio analysis setup
  const requestMicPermission = async () => {
    try {
      setShowMicPrompt(true);
      
      // Request real microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Set up audio analysis
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);
      
      // Start audio level monitoring
      startAudioAnalysis();
      
      setMicPermission('granted');
      setShowMicPrompt(false);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicPermission('denied');
      setShowMicPrompt(false);
      return false;
    }
  };

  // Audio analysis for mood and volume detection
  const startAudioAnalysis = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const analyzeAudio = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedLevel = average / 255;
      
      setAudioLevel(normalizedLevel);
      
      // Detect if user is yelling (high volume)
      const isCurrentlyYelling = normalizedLevel > 0.7;
      setIsYelling(isCurrentlyYelling);
      
      // Analyze frequency patterns for mood detection
      const lowFreq = dataArray.slice(0, 10).reduce((sum, val) => sum + val, 0) / 10;
      const midFreq = dataArray.slice(10, 50).reduce((sum, val) => sum + val, 0) / 40;
      const highFreq = dataArray.slice(50, 100).reduce((sum, val) => sum + val, 0) / 50;
      
      // Simple mood detection based on frequency distribution
      let detectedMood = 'neutral';
      if (isCurrentlyYelling) {
        detectedMood = 'angry';
      } else if (normalizedLevel < 0.1) {
        detectedMood = 'quiet';
      } else if (highFreq > midFreq && midFreq > lowFreq) {
        detectedMood = 'excited';
      } else if (lowFreq > midFreq) {
        detectedMood = 'sad';
      }
      
      setUserMood(detectedMood);
      
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };
    
    analyzeAudio();
  };

  // Stop audio analysis
  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  // Start continuous speech recognition using ElevenLabs
  const startSpeechRecognition = async () => {
    if (micMuted || isRecording || isSpeaking) return;
    
    // Check microphone permission first
    if (micPermission !== 'granted') {
      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        console.log('Microphone permission denied');
        return;
      }
    }
    
    try {
      setIsRecording(true);
      setIsListening(true);
      await elevenlabsService.startRecording();
      
      // Record for 3 seconds, then process
      recordingTimeoutRef.current = setTimeout(async () => {
        try {
          const audioBlob = await elevenlabsService.stopRecording();
          const transcript = await elevenlabsService.speechToText(audioBlob);
          
          if (transcript.trim()) {
            await handleUserSpeech(transcript);
          }
        } catch (error) {
          console.error('Speech recognition error:', error);
        } finally {
          setIsRecording(false);
          setIsListening(false);
          
          // Restart recognition if call is still active
          if (isConnected && !micMuted && micPermission === 'granted') {
            setTimeout(startSpeechRecognition, 500);
          }
        }
      }, 3000);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsRecording(false);
      setIsListening(false);
    }
  };

  // Initialize ring sound
  useEffect(() => {
    ringAudioRef.current = new Audio('/11L-PHONE_RINGING_CALLIN-1750185890141.mp3');
    ringAudioRef.current.loop = false; // Don't loop, let it play twice naturally
    ringAudioRef.current.volume = 0.7;
    
    return () => {
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
        ringAudioRef.current = null;
      }
    };
  }, []);

  // Initialize call on component mount
  useEffect(() => {
    // Component mounted, call initialization will be handled by the isRinging useEffect
    return () => {
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
        ringAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle call connection
  useEffect(() => {
    // Request microphone permission first, then start ringing
    const initializeCall = async () => {
      const hasPermission = await requestMicPermission();
      
      if (hasPermission) {
        // Start ringing sound after permission is granted
        if (ringAudioRef.current) {
          ringAudioRef.current.play().catch(console.error);
        }

        // Ring for 8 seconds (2 rings), then Kyartu answers
        const ringTimer = setTimeout(() => {
          // Stop ring sound
          if (ringAudioRef.current) {
            ringAudioRef.current.pause();
            ringAudioRef.current.currentTime = 0;
          }
          
          setIsRinging(false);
          setIsConnected(true);
          
          // Start with Kyartu's Armenian greeting
          setTimeout(() => {
            speakKyartu(armenianGreeting);
          }, 500);
        }, 8000); // 8 seconds as requested

        return () => {
          clearTimeout(ringTimer);
          if (ringAudioRef.current) {
            ringAudioRef.current.pause();
          }
        };
      } else {
        // If permission denied, end call
         setTimeout(() => {
           handleEndCall();
         }, 1000);
      }
    };

    if (isRinging) {
      initializeCall();
    }
  }, [isRinging]);

  // Call duration timer and speech recognition
  useEffect(() => {
    if (isConnected) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Check if conversation duration approaches 90 seconds
      if (callDuration >= 90) {
        // AI hang-up logic
        endCall();
      }

      // Request microphone permission and start speech recognition
      if (!micMuted) {
        setTimeout(async () => {
          if (micPermission !== 'granted') {
            await requestMicPermission();
          }
          if (micPermission === 'granted') {
            startSpeechRecognition();
          }
        }, 1000);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, [isConnected, callDuration, micMuted]);

  const handleUserSpeech = async (transcript) => {
    if (transcript.trim() && !isSpeaking) {
      // Generate dynamic response based on user input
      const response = generateDynamicResponse(transcript);
      await speakKyartu(response);
    }
  };

  const speakKyartu = async (text) => {
    try {
      setIsSpeaking(true);
      await elevenlabsService.textToSpeech(text);
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const toggleMic = async () => {
    setMicMuted(!micMuted);
    
    if (!micMuted) {
      // Muting - stop current recording
      if (isRecording) {
        try {
          await elevenlabsService.stopRecording();
        } catch (error) {
          console.error('Error stopping recording:', error);
        }
        setIsRecording(false);
        setIsListening(false);
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    } else {
      // Unmuting - restart speech recognition
      setTimeout(startSpeechRecognition, 500);
    }
  };

  const toggleSpeaker = () => {
    setSpeakerOn(!speakerOn);
  };

  const endCall = async () => {
    // End call logic
    setIsConnected(false);
    setCallDuration(0);
    
    // Stop ring sound if still playing
    if (ringAudioRef.current) {
      ringAudioRef.current.pause();
    }
    
    // Stop recording if active
    if (isRecording) {
      try {
        await elevenlabsService.stopRecording();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    }
    
    // Stop audio analysis
    stopAudioAnalysis();
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
    
    // Cooldown period
    cooldownPeriodRef.current = true;
    setTimeout(() => {
      cooldownPeriodRef.current = false;
    }, 60000); // 60 seconds
    
    onEndCall();
  };

  const handleEndCall = () => {
    endCall();
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
        `
      }}
    >
      {/* Microphone Permission Prompt */}
      {showMicPrompt && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Microphone Access Required</h3>
            <p className="text-gray-600 mb-4">We need access to your microphone to enable voice conversation with Kyartu.</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowMicPrompt(false)}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={requestMicPermission}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-sm mx-auto md:max-w-md lg:max-w-lg">
        {/* iPhone-style call screen */}
        <div className="bg-gray-900 rounded-[3rem] p-6 shadow-2xl border-4 border-gray-800 mx-auto" style={{ maxWidth: '400px' }}>
          {/* Status bar */}
          <div className="flex justify-between items-center text-white text-sm mb-8">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 bg-white rounded-sm"></div>
              <div className="w-6 h-3 border border-white rounded-sm">
                <div className="w-4 h-1 bg-white rounded-sm m-0.5"></div>
              </div>
            </div>
          </div>

          {/* Call status */}
          <div className="text-center mb-8">
            <AnimatePresence mode="wait">
              {isRinging ? (
                <motion.div
                  key="ringing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-gray-400 text-sm mb-2">Calling...</p>
                  <h2 className="text-white text-2xl font-light mb-1">Kyartu Vzgo</h2>
                  <p className="text-gray-400 text-sm">mobile</p>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-gray-400 text-sm mt-4"
                  >
                    Ringing...
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-white text-2xl font-light mb-1">Kyartu Vzgo</h2>
                  <p className="text-green-400 text-sm mb-2">Connected</p>
                  <p className="text-gray-400 text-lg">{formatCallDuration(callDuration)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Kyartu's avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src="/call kyartu.png"
                alt="Kyartu Vzgo"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
              />
              {/* Audio level indicator ring */}
              {isConnected && (
                <motion.div
                  animate={{ scale: [1, 1 + audioLevel * 0.3, 1] }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 rounded-full border-4 ${
                    isYelling ? 'border-red-500' : 
                    userMood === 'excited' ? 'border-yellow-500' :
                    userMood === 'sad' ? 'border-blue-500' :
                    'border-green-500'
                  } opacity-70`}
                  style={{ transform: `scale(${1 + audioLevel * 0.2})` }}
                />
              )}
            </div>
          </div>
          
          {/* Audio Analysis Indicators */}
          {isConnected && (
            <div className="flex justify-center mb-4">
              <div className="bg-black/30 rounded-lg px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-4 text-xs">
                  {/* Audio Level Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Vol:</span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          isYelling ? 'bg-red-500' : 
                          audioLevel > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${audioLevel * 100}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                  
                  {/* Mood Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Mood:</span>
                    <span className={`text-xs font-medium ${
                      userMood === 'angry' || isYelling ? 'text-red-400' :
                      userMood === 'excited' ? 'text-yellow-400' :
                      userMood === 'sad' ? 'text-blue-400' :
                      userMood === 'quiet' ? 'text-gray-400' :
                      'text-green-400'
                    }`}>
                      {isYelling ? 'YELLING' : userMood.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Speaking/Listening indicators */}
          {isSpeaking && (
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-full"
              >
                <Volume2 className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Kyartu is speaking...</span>
              </motion.div>
            </div>
          )}
          
          {isListening && !isSpeaking && (
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-full"
              >
                <Mic className="w-4 h-4 text-white" />
                <span className="text-white text-sm">Listening...</span>
              </motion.div>
            </div>
          )}

          {/* Call controls */}
          <div className="flex justify-center items-center gap-8 mb-8">
            {/* Mute button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMic}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                micMuted ? 'bg-red-600' : 'bg-gray-700'
              }`}
            >
              {micMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </motion.button>

            {/* Speaker button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleSpeaker}
              className={`w-14 h-14 rounded-full flex items-center justify-center relative ${
                speakerOn ? 'bg-blue-600 shadow-lg shadow-blue-600/50' : 'bg-gray-700'
              }`}
            >
              <Volume2 className="w-6 h-6 text-white" />
              {speakerOn && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"
                />
              )}
            </motion.button>
          </div>

          {/* End call button */}
          <div className="flex justify-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleEndCall}
              className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PhoneCallScreen;