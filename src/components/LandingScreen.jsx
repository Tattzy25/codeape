import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Zap, Dice1, Star, Phone, Users, Cigarette, Heart, Shield } from 'lucide-react';
import PropTypes from 'prop-types';
import NeumorphicButton from './NeumorphicButton';



const GENDER_OPTIONS = [
  { value: 'male', label: 'Ape Ape' },
  { value: 'female', label: 'Kukla' },
  { value: 'neutral', label: 'Galuboy' },
];

const LandingScreen = ({ onStartChat, onStartPhoneCall, onStartSmokeAndRoast }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('neutral');
  const [showForm, setShowForm] = useState(false);
  const inputRef = useRef(null);

  const handleStartChat = () => {
    // Skip the form and go directly to chat with default values
    onStartChat('User', 'neutral');
  };

  const getWelcomeMessage = () => {
    switch (gender) {
      case 'female':
        return "Shat lav eli, who let this beauty in? I'm Kyartu Vzgo — I flirt, I flex, and I got flowers in the car. You hungry? Emotionally or actually?";
      case 'male':
        return "Ara gyot elnem, you need help from Kyartu? Say less. I don't fix lives. I just roast 'em till you feel better.";
      default:
        return "Welcome to Glendale therapy, where your problems get laughed at — professionally. I'm Kyartu. I got life advice and leftover khash. Pick one.";
    }
  };

  useEffect(() => {
    if (showForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showForm]);

  return (
    <div className="min-h-screen bg-neuro-base flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Kyartu's Profile Section */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="neuro-card p-8 mb-8"
        >
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden neuro-card">
            <img
              src="https://i.imgur.com/DwB35OG.png"
              alt="Kyartu Vzgo"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-4xl font-bold text-gradient mb-4">
            Kyartu Vzgo
          </h1>

          <div className="flex items-center justify-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-neuro-600 font-medium">
              Glendale's Loudest • Armenia's Proudest • Your Ego's Worst Enemy
            </span>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>



          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-neuro-500 mb-6 italic"
          >
            "He's not a therapist. He just talks like your uncle."
          </motion.p>

          {!showForm ? (
            <div className="space-y-6">
              {/* ArmoGPT - Main Button */}
              <div className="mb-8">
                <NeumorphicButton onClick={handleStartChat} className="h-16 text-lg font-bold">
                  <div className="flex items-center gap-3 justify-center">
                    <MessageCircle className="w-7 h-7" />
                    Armo-GPT
                  </div>
                </NeumorphicButton>
              </div>
              
              {/* Responsive Button Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <NeumorphicButton 
                  className="h-20 rounded-2xl" 
                  onClick={onStartPhoneCall}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Phone className="w-6 h-6" />
                    <span className="text-xs font-medium">Call Kyartu Ara</span>
                  </div>
                </NeumorphicButton>
                
                <NeumorphicButton 
                  className="h-20 rounded-2xl" 
                  // onClick={onStartSmokeAndRoast} // Removed handler from here
                >
                  <div className="flex flex-col items-center gap-2">
                    <Dice1 className="w-6 h-6" />
                    <span className="text-xs font-medium">Hit the Slots Ara</span>
                  </div>
                </NeumorphicButton>
                
                <NeumorphicButton className="h-20 rounded-2xl">
                  <div className="flex flex-col items-center gap-2">
                    <Star className="w-6 h-6" />
                    <span className="text-xs font-medium">Make Me Famous Ara</span>
                  </div>
                </NeumorphicButton>
                
                <NeumorphicButton className="h-20 rounded-2xl">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-6 h-6" />
                    <span className="text-xs font-medium">You're Hired Ara</span>
                  </div>
                </NeumorphicButton>
                
                <NeumorphicButton 
                  className="h-20 rounded-2xl"
                  onClick={onStartSmokeAndRoast} // Connected handler here
                >
                  <div className="flex flex-col items-center gap-2">
                    <Cigarette className="w-6 h-6" />
                    <span className="text-xs font-medium">Smoke & Roast Ara</span>
                  </div>
                </NeumorphicButton>
                
                <NeumorphicButton className="h-20 rounded-2xl">
                  <div className="flex flex-col items-center gap-2">
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-xs font-medium">Marriage Advice Ara</span>
                  </div>
                </NeumorphicButton>
                
                <NeumorphicButton className="h-20 rounded-2xl">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="w-6 h-6" />
                    <span className="text-xs font-medium">Give Me Alibi Ara</span>
                  </div>
                </NeumorphicButton>
                
                <NeumorphicButton className="h-20 rounded-2xl">
                  <div className="flex flex-col items-center gap-2">
                    <Heart className="w-6 h-6" />
                    <span className="text-xs font-medium">Find Me Forever Man/Wife</span>
                  </div>
                </NeumorphicButton>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="What's your name, bro jan?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="neuro-input-field text-center text-lg"
                  ref={inputRef}
                />

                <div className="flex justify-center gap-4">
                  {GENDER_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={gender === option.value}
                        onChange={(e) => setGender(e.target.value)}
                        className="sr-only"
                      />
                      <div
                        className={`neuro-button px-4 py-2 transition-all ${
                          gender === option.value
                            ? 'shadow-neuro-pressed text-primary-from'
                            : ''
                        }`}
                      >
                        {option.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <NeumorphicButton
                onClick={handleStartChat}
                disabled={!name.trim()}
                style={{
                  opacity: !name.trim() ? 0.5 : 1,
                  cursor: !name.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                <div className="flex items-center gap-3 justify-center">
                  <MessageCircle className="w-6 h-6" />
                  Let's Go, {name || 'Stranger'}
                </div>
              </NeumorphicButton>
            </motion.div>
          )}


        </motion.div>

        {/* Preview Message */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="neuro-card p-6 bg-gradient-to-r from-purple-50 to-blue-50"
          >
            <p className="text-neuro-700 italic">{getWelcomeMessage()}</p>
          </motion.div>
        )}


      </motion.div>
    </div>
  );
};

LandingScreen.propTypes = {
  onStartChat: PropTypes.func.isRequired,
  onStartPhoneCall: PropTypes.func.isRequired,
  onStartSmokeAndRoast: PropTypes.func.isRequired, // Add prop type
};

export default LandingScreen;