import React from 'react'
import ArmoLobby from '../ArmoLobby'
import FeatureContainer from '../features/FeatureContainer'
import ChatContainer from '../chat/ChatContainer'

/**
 * MainDisplay Component
 * 
 * Responsible for switching between different views (ArmoLobby, Features, Chat)
 * without remounting the entire UI or affecting the InputBar
 */
const MainDisplay = ({
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
  messagesEndRef,
  sidebarCollapsed
}) => {
  return (
    <div className={`flex-1 overflow-y-auto pt-16 pb-24 min-h-screen ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-80'}`}>
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
    </div>
  )
}

export default MainDisplay