import React from 'react'
import PhoneCallScreen from '../PhoneCallScreen'
import LandingScreen from '../LandingScreen'

const AppScreenRouter = ({
  showPhoneCall,
  showLandingScreen,
  onEndCall,
  onStartChat,
  onStartPhoneCall,
  children
}) => {
  if (showPhoneCall) {
    return <PhoneCallScreen onEndCall={onEndCall} />
  }
  
  if (showLandingScreen) {
    return (
      <LandingScreen 
        onStartChat={onStartChat} 
        onStartPhoneCall={onStartPhoneCall} 
      />
    )
  }
  
  return <>{children}</>
}

export default AppScreenRouter