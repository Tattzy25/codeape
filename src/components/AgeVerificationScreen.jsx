import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const AgeVerificationScreen = ({ onConfirm, onDeny }) => {
  return (
    <div className="min-h-screen bg-neuro-base flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="neuro-card p-8 mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-6 neuro-card rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-neuro-600" />
          </div>

          <h1 className="text-3xl font-bold text-gradient mb-4">
            Age Verification
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-neuro-700 mb-8 leading-relaxed"
          >
            You must be 18 years or older to access this service.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onConfirm}
              className="neuro-button-primary w-full text-lg py-4 px-6"
            >
              Yes, I am 18 and over
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDeny}
              className="neuro-button-secondary w-full text-lg py-4 px-6"
            >
              No, I'm not 18 and over
            </motion.button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-neuro-500 text-sm mt-6"
          >
            By continuing, you confirm that you meet the age requirement.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AgeVerificationScreen;