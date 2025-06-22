import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users, Phone, TrendingUp, Shield, Cigarette, Heart, Lock, MessageCircle } from 'lucide-react';

const ArmoLobby = ({ onSelectFeature }) => {
  const features = [
    {
      name: 'Call Kyartu Ara',
      icon: Phone,
      description: 'Chat with Armo',
      gradient: 'from-green-500 to-emerald-600',
      available: true
    },
    {
      name: 'Make Me Famous Ara',
      icon: Star,
      description: 'Boost your social media presence',
      gradient: 'from-yellow-500 to-orange-600',
      available: true
    },
    {
      name: 'You\'re Hired Ara',
      icon: TrendingUp,
      description: 'Land your dream job',
      gradient: 'from-blue-500 to-indigo-600',
      available: true
    },
    {
      name: 'Smoke & Roast Ara',
      icon: Cigarette,
      description: 'Get roasted by Kyartu',
      gradient: 'from-red-500 to-pink-600',
      available: true
    },
    {
      name: 'Therapy Session',
      icon: Heart,
      description: 'Talk through your problems',
      gradient: 'from-purple-500 to-violet-600',
      available: true
    },
    {
      name: 'Give Me Alibi Ara',
      icon: Shield,
      description: 'Get the perfect excuse',
      gradient: 'from-gray-500 to-slate-600',
      available: true
    },
    {
      name: 'Find Me Forever Man/Wife',
      icon: Users,
      description: 'Find your perfect match',
      gradient: 'from-pink-500 to-rose-600',
      available: true
    }
  ];

  const comingSoonFeatures = [
    {
      name: 'Coming Soon 1',
      icon: 'https://i.imgur.com/qRnOL0p.png',
      description: 'New feature in development',
      gradient: 'from-cyan-500 to-teal-600'
    },
    {
      name: 'Coming Soon 2',
      icon: 'https://i.imgur.com/aTLrV3G.png',
      description: 'Exciting update coming',
      gradient: 'from-amber-500 to-yellow-600'
    },
    {
      name: 'Coming Soon 3',
      icon: 'https://i.imgur.com/X2EDY5B.png',
      description: 'Revolutionary feature ahead',
      gradient: 'from-lime-500 to-green-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neuro-50 to-neuro-100 mobile-safe-area">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6"
      >
        {/* Header - Mobile Optimized */}
        <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-2 sm:mb-3 md:mb-4 leading-tight font-mono">
            zeroFucksgiven()
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neuro-600 max-w-2xl mx-auto px-2 leading-relaxed">
<<<<<<< HEAD
            Choose your adventure and let Kyartu guide you through the ultimate Armenian experience
=======
            Choose your adventure and let Armo guide you through the ultimate Armenian experience
>>>>>>> 06965cc519e106bad8bced9be4cad528270eaee4
          </p>
        </motion.div>

        {/* Main Features Grid - Mobile First */}
        <motion.div variants={itemVariants} className="mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neuro-800 mb-4 sm:mb-6 md:mb-8 text-center">
            Available Features
          </h2>
          
          {/* Mobile: 2 columns, Tablet: 3 columns, Desktop: 4 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectFeature(feature.name)}
                  className="neuro-card p-3 sm:p-4 md:p-6 cursor-pointer group transition-all duration-300 hover:shadow-neuro-xl active:shadow-neuro-pressed touch-manipulation"
                >
                  {/* Icon Container - Responsive */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto`}>
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  
                  {/* Feature Name - Responsive */}
                  <h3 className="text-xs sm:text-sm md:text-lg font-bold text-neuro-800 mb-1 sm:mb-2 group-hover:text-gradient transition-colors duration-300 text-center leading-tight">
                    {feature.name}
                  </h3>
                  
                  {/* Description - Hidden on mobile, shown on larger screens */}
                  <p className="hidden sm:block text-xs md:text-sm text-neuro-600 leading-relaxed text-center">
                    {feature.description}
                  </p>
                  
                  {/* Status Indicator */}
                  <div className="mt-2 sm:mt-3 md:mt-4 flex items-center justify-center">
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="hidden sm:inline">Available</span>
                      <span className="sm:hidden">✓</span>
                    </span>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Coming Soon Section - Mobile Optimized */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neuro-800 mb-4 sm:mb-6 md:mb-8 text-center">
            Coming Soon
          </h2>
          
          {/* Mobile: 1 column, Tablet+: 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {comingSoonFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                onClick={() => onSelectFeature(feature.name)}
                className="neuro-card p-4 sm:p-5 md:p-6 opacity-75 relative overflow-hidden touch-manipulation cursor-pointer"
              >
                {/* Coming Soon Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
                
                {/* Feature Icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 sm:mb-4 relative mx-auto sm:mx-0`}>
                  {feature.icon.startsWith('http') ? (
                    <img 
                      src={feature.icon} 
                      alt="Coming Soon Feature" 
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 object-contain filter brightness-0 invert"
                      loading="lazy"
                    />
                  ) : (
                    <Lock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  )}
                </div>
                
                {/* Feature Info */}
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-neuro-600 mb-2 text-center sm:text-left">
                  {feature.name}
                </h3>
                <p className="text-xs sm:text-sm text-neuro-500 leading-relaxed mb-3 sm:mb-4 text-center sm:text-left">
                  {feature.description}
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-neuro-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer - Mobile Optimized */}
        <motion.div variants={itemVariants} className="text-center mt-8 sm:mt-12 md:mt-16 py-4 sm:py-6 md:py-8">
          <p className="text-neuro-500 text-xs sm:text-sm leading-relaxed px-4">
            More features coming soon. Stay tuned for the ultimate Armo experience!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ArmoLobby;