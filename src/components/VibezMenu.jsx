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

const VibezMenu = ({ onSelectFeature }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (feature) => {
    onSelectFeature(feature);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-3 text-left bg-neuro-base neuro-button rounded-lg text-neuro-700 font-semibold">
        VIBEZ
      </button>
      {isOpen && (
        <ul className="absolute w-full mt-2 bg-neuro-base neuro-card rounded-lg shadow-lg z-10">
          {features.map((feature, index) => (
            <li key={index} onClick={() => handleSelect(feature)} className="p-3 hover:bg-neuro-100 cursor-pointer text-neuro-600">
              {feature}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VibezMenu;