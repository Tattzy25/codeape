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
  
  const callTimerRef = useRef(null);
  const audioRef = useRef(null);
  const ringAudioRef = useRef(null);
  const recordingTimeoutRef = useRef(null);

  // Kyartu's hustling responses with Armenian accent
  const kyartuResponses = [
    "Aallo... ha ara! What's good, jan? I'm out here making moves, you know what I'm saying?",
    "Ara, I'm at the bank right now, depositing checks. What you need, bro?",
    "Bro, I just closed three deals today. I'm on fire, jan! Business is booming!",
    "Listen ara, I'm busy counting money, but I got time for you. What's up?",
    "I'm at the Mercedes dealership right now, jan. Thinking about getting another one.",
    "Ara, you caught me at the cigar lounge. Just finished a business meeting with some big shots.",
    "I'm networking with some millionaires right now, bro. But talk to me, what's going on?",
    "Just got off the phone with my accountant, ara. Tax season, you know how it is.",
    "I'm at the gym, but I can multitask, jan. What's on your mind?",
    "Bro, I'm literally making money while we're talking. That's how I roll, ara!",
    "Yo ara, I'm at the casino right now. Just won big on the slots, jan!",
    "Listen bro, I'm closing deals left and right. The hustle never stops, you feel me?"
  ];

  // Armenian greeting for call pickup
  const armenianGreeting = "Aallo  You reached Kyartu, jan. I'm out here making moves, what you need, bro?";

  const getRandomResponse = () => {
    return kyartuResponses[Math.floor(Math.random() * kyartuResponses.length)];
  };

  // Start continuous speech recognition using ElevenLabs
  const startSpeechRecognition = async () => {
    if (micMuted || isRecording || isSpeaking) return;
    
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
          if (isConnected && !micMuted) {
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

      // Start speech recognition after a brief delay
      if (!micMuted) {
        setTimeout(startSpeechRecognition, 1000);
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
      // Generate Kyartu's response
      const response = getRandomResponse();
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
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
        `
      }}
    >
      <div className="w-full max-w-sm mx-auto">
        {/* iPhone-style call screen */}
        <div className="bg-gray-900 rounded-[3rem] p-6 shadow-2xl border-4 border-gray-800">
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
                src="/call kyartu.png"
                alt="Kyartu Vzgo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Speaking indicator */}
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