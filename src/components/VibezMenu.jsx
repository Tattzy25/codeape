import React, { useState } from 'react';

const features = [
  'Call Kyartu Ara',
  'Make Me Famous Ara',
  'You\'re Hired Ara',
  'Smoke & Roast Ara',
  'Therapy Session',
  'Give Me Alibi Ara',
  'Find Me Forever Man/Wife',
  'Coming Soon',
  'Coming Soon',
  'Coming Soon',
];

const VibezMenu = ({ onSelectFeature, currentPage = 'Armo Lobby', onReturnToLobby }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (feature) => {
    if (feature === 'Armo Lobby') {
      onReturnToLobby && onReturnToLobby();
    } else {
      onSelectFeature(feature);
    }
    setIsOpen(false);
  };

  const displayText = currentPage === 'Armo Lobby' ? 'ARMO LOBBY' : currentPage.toUpperCase();

  return (
    <div className="relative w-full">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-3 text-left bg-gradient-to-br from-red-600 via-blue-600 to-orange-500 rounded-lg text-white font-semibold shadow-neuro-outset">
        {displayText}
      </button>
      {isOpen && (
        <ul className="absolute w-full mt-2 bg-neuro-base neuro-card rounded-lg shadow-lg z-10">
          {currentPage !== 'Armo Lobby' && (
            <li onClick={() => handleSelect('Armo Lobby')} className="p-3 hover:bg-neuro-100 cursor-pointer text-neuro-600 border-b border-neuro-200">
              Armo Lobby
            </li>
          )}
          {features.map((feature, index) => (
            <li 
              key={index} 
              onClick={() => handleSelect(feature)} 
              className={`p-3 hover:bg-neuro-100 cursor-pointer ${
                feature === currentPage ? 'text-blue-600 font-semibold bg-blue-50' : 'text-neuro-600'
              }`}
            >
              {feature}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VibezMenu;