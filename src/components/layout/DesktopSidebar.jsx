import React from 'react'
import Sidebar from '../Sidebar'

const DesktopSidebar = ({
  respectMeter,
  kyartuMood,
  chatHistory,
  savedMoments,
  userName,
  onStartPhoneCall,
  onSelectFeature,
  currentPage,
  onReturnToLobby
}) => {
  return (
    <aside className="hidden lg:block fixed left-0 top-0 w-80 h-screen z-50">
      {/* Logo in sidebar */}
      <div className="absolute top-4 left-4 z-10">
        <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
          <img 
            src="https://i.imgur.com/lMiuQUh.png" 
            alt="Kyartu Vzgo Logo" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
      <Sidebar
        isOpen={true}
        respectMeter={respectMeter}
        kyartuMood={kyartuMood}
        chatHistory={chatHistory}
        savedMoments={savedMoments}
        userName={userName}
        onClose={() => {}}
        onStartPhoneCall={onStartPhoneCall}
        onSelectFeature={onSelectFeature}
        currentPage={currentPage}
        onReturnToLobby={onReturnToLobby}
      />
    </aside>
  )
}

export default DesktopSidebar