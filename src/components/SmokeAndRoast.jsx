import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeumorphicButton from './GoldenButton'; 
import { Send } from 'lucide-react'; 

const SmokeAndRoast = ({ onGoBackToChat, userName }) => {
 const [messages, setMessages] = useState([
 { id: 'initial', role: 'ai', content: `Armo is waiting for you to make the first move, ${userName || 'challenger'}...` }
 ]);
 const [inputMessage, setInputMessage] = useState('');
 const messagesEndRef = useRef(null);
 const [isVideoVisible, setIsVideoVisible] = useState(true);
 const [showChat, setShowChat] = useState(false);
 const videoRef = useRef(null);

 useEffect(() => {
 const videoTimer = setTimeout(() => {
 setIsVideoVisible(false);
 },8000); 

 if (videoRef.current) {
 videoRef.current.play().catch(error => {
 console.warn('Video autoplay failed:', error);
 });
 }

 return () => {
 clearTimeout(videoTimer);
 };
 }, []);

 const handleVideoEnd = () => {
 setIsVideoVisible(false); 
 };

 useEffect(() => {
 if (!isVideoVisible) {
 const chatTimer = setTimeout(() => {
 setShowChat(true);
 },500); 
 return () => clearTimeout(chatTimer);
 }
 }, [isVideoVisible]);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages]);

 const handleSendMessage = (e) => {
 e.preventDefault();
 if (!inputMessage.trim()) return;

 const newUserMessage = { id: Date.now().toString(), role: 'user', content: inputMessage };
 const aiResponse = { id: (Date.now() +1).toString(), role: 'ai', content: "That's all you got? Weak." }; 
    
 setMessages(prevMessages => [...prevMessages, newUserMessage, aiResponse]);
 setInputMessage('');
 };

 const handleGiveUp = () => {
 if (onGoBackToChat) {
 onGoBackToChat();
 }
 };

 return (
 <div className="fixed inset-0 bg-neuro-base flex flex-col items-center justify-center text-neuro-text overflow-hidden">
 <AnimatePresence onExitComplete={() => setShowChat(true)}>
 {isVideoVisible && (
 <motion.div
 key="video-background"
 initial={{ opacity:1 }}
 exit={{ opacity:0, transition: { duration:1, ease: "easeInOut" } }} 
 className="absolute inset-0 w-full h-full"
 onAnimationComplete={(definition) => {
 if (definition === 'exit') {
 if (!showChat) setShowChat(true);
 }
 }}
 >
 <video
 ref={videoRef}
 src="/Smoke & Roast.mp4"
 className="w-full h-full object-cover"
 autoPlay
 muted
 playsInline 
 onEnded={handleVideoEnd}
 />
 </motion.div>
 )}
 </AnimatePresence>

 <AnimatePresence>
 {showChat && (
 <motion.div
 key="chat-card"
 initial={{ opacity:0, y:50, scale:0.9 }}
 animate={{ opacity:1, y:0, scale:1, transition: { duration:0.7, ease: "easeOut" } }}
 exit={{ opacity:0, y:50, scale:0.9, transition: { duration:0.5, ease: "easeIn" } }}
 className="relative z-10 neuro-card p-0 rounded-xl w-full max-w-md h-[400px] flex flex-col"
 >
 <h2 className="text-lg font-semibold px-4 py-3 border-b border-neuro-border">Smoke & Roast</h2>
            
 <div className="flex-1 p-3 overflow-y-auto flex flex-col space-y-2 custom-scrollbar">
 {/* Chat messages will go here */}
 {messages.map((msg) => (
 <div 
 key={msg.id} 
 className={`max-w-[75%] px-4 py-2 rounded-xl text-sm shadow-md transition-all duration-200 ${
 msg.role === 'user' 
 ? 'bg-neuro-accent text-white self-end ml-auto text-right' 
 : 'bg-neuro-muted text-neuro-text self-start mr-auto text-left'
 }`}
>
 <p className={`text-sm break-words ${msg.role === 'user' ? 'text-neuro-text' : 'text-neuro-text'}`}>{msg.content}</p>
 </div>
 ))}
 <div ref={messagesEndRef} />
 </div>
            
 <div className="px-3 py-2 border-t border-neuro-border">
 <form onSubmit={handleSendMessage} className="flex items-center gap-2">
 <input
 type="text"
 value={inputMessage}
 onChange={(e) => setInputMessage(e.target.value)}
 className="flex-1 p-2 border rounded-lg text-sm"
 placeholder="Your move, champ..."
 />
 <NeumorphicButton 
 type="submit"
 className="h-8 w-8 flex-shrink-0 !p-0"
 disabled={!inputMessage.trim()}
 >
 <Send className="w-4 h-4 text-neuro-text" />
 </NeumorphicButton>
 </form>
 <NeumorphicButton 
 onClick={handleGiveUp}
 className="w-full h-8 text-sm font-semibold mt-2"
 >
 I give up
 </NeumorphicButton>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
};

export default SmokeAndRoast;