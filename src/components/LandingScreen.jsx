import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles, Zap } from 'lucide-react';
import PropTypes from 'prop-types';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Bro' },
  { value: 'female', label: 'Queen' },
  { value: 'neutral', label: 'Human' },
];

const LandingScreen = ({ onStartChat }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('neutral');
  const [showForm, setShowForm] = useState(false);
  const inputRef = useRef(null);

  const handleStartChat = () => {
    if (!showForm) {
      setShowForm(true);
      return;
    }

    if (name.trim()) {
      onStartChat(name.trim(), gender);
    }
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
              src="/kyartu-profile.png"
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
            className="text-xl text-neuro-700 mb-8 leading-relaxed"
          >
            "Araaa… finally. You look stressed. Sit down. Let's ruin your self-esteem together."
          </motion.p>

          {!showForm ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartChat}
              className="neuro-button-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto"
            >
              <MessageCircle className="w-6 h-6" />
              Start Chatting with Kyartu
            </motion.button>
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

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartChat}
                disabled={!name.trim()}
                className="neuro-button-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-6 h-6" />
                Let's Go, {name || 'Stranger'}
              </motion.button>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-neuro-500 mt-6 italic"
          >
            "He's not a therapist. He just talks like your uncle."
          </motion.p>
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
};

export default LandingScreen;