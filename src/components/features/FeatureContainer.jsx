import React from 'react'

const FeatureContainer = ({ selectedFeature, featureComponents, onReturnToLobby }) => {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      <button 
        onClick={onReturnToLobby}
        className="mb-3 sm:mb-4 neuro-button-secondary px-3 sm:px-4 py-2 text-sm touch-manipulation min-h-[44px] flex items-center gap-2"
      >
        ← Back to Armo Lobby
      </button>
      {React.createElement(featureComponents[selectedFeature])}
    </div>
  )
}

export default FeatureContainer