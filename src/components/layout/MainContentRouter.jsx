import React from 'react'
import ArmoLobby from '../ArmoLobby'
import FeatureContainer from '../features/FeatureContainer'
import ChatContainer from '../chat/ChatContainer'

const MainContentRouter = ({
  showArmoLobby,
  selectedFeature,
  featureComponents,
  onSelectFeature,
  onReturnToLobby,
  // Chat props
  messages,
  isTyping,
  streamingMessage,
  onReaction,
  onSaveMoment,
  onPlayVoice,
  savedMoments,
  messagesEndRef
}) => {
  return (
    <main className="pt-16 sm:pt-18 md:pt-20 lg:pt-16 pb-24 sm:pb-28 md:pb-32 lg:pl-80 min-h-screen mobile-safe-area">
      {showArmoLobby ? (
        <ArmoLobby onSelectFeature={onSelectFeature} />
      ) : selectedFeature ? (
        <FeatureContainer 
          selectedFeature={selectedFeature}
          featureComponents={featureComponents}
          onReturnToLobby={onReturnToLobby}
        />
      ) : (
        <ChatContainer
          messages={messages}
          isTyping={isTyping}
          streamingMessage={streamingMessage}
          onReaction={onReaction}
          onSaveMoment={onSaveMoment}
          onPlayVoice={onPlayVoice}
          savedMoments={savedMoments}
          messagesEndRef={messagesEndRef}
        />
      )}
    </main>
  )
}

export default MainContentRouter