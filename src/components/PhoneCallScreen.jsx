import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Volume2, Mic, MicOff } from 'lucide-react';
import elevenlabsService from '../services/elevenlabsService';

const PhoneCallScreen = ({ onEndCall }) => {
  const [isRinging, setIsRinging] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [micPermission, setMicPermission] = useState(null); // null, 'granted', 'denied'
  const [showMicPrompt, setShowMicPrompt] = useState(false);
  
  const callTimerRef = useRef(null);
  const audioRef = useRef(null);
  const ringAudioRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const conversationContextRef = useRef([]);

  // Armenian greeting for call pickup
  const armenianGreeting = "Aallo... You reached Kyartu, jan. I'm out here making moves, what you need, bro?";

  // Dynamic conversation handler
  const generateDynamicResponse = (userInput) => {
    const input = userInput.toLowerCase();
    conversationContextRef.current.push({ type: 'user', text: userInput });
    
    let response = "";
    
    // Hair/appearance related
    if (input.includes('hair') || input.includes('look')) {
      response = "Ara, you worried about my hair? Bro, I spend more on my barber than you make in a week, jan!";
    }
    // Money/business related
    else if (input.includes('money') || input.includes('business') || input.includes('deal')) {
      const moneyResponses = [
        "Why you care how I make money, ara? You trying to copy my moves or something?",
        "Bro, I made more money today than you'll see all month. Mind your own business, jan!",
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
        "Listen jan, I'm busy making moves. Get to the point!",
        "Bro, you called me to waste my time? I charge by the minute, ara!",
        "What's your point, jan? I got business to handle!"
      ];
      response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
    
    conversationContextRef.current.push({ type: 'kyartu', text: response });
    return response;
  };

  // Request microphone permission
  const requestMicPermission = async () => {
    try {
      setShowMicPrompt(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately, we just wanted permission
      stream.getTracks().forEach(track => track.stop());
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

  // Handle call connection
  useEffect(() => {
    if (isRinging) {
      // Play ring sound
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
    }
  }, [isRinging]);

  // Call duration timer and speech recognition
  useEffect(() => {
    if (isConnected) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

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
  }, [isConnected, micMuted]);

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
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
    
    onEndCall();
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
          <div className="flex justify-center mb-12">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700">
              <img
                src="/logo.png"
                alt="Kyartu Vzgo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

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
              onClick={endCall}
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