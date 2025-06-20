import { useState, useCallback } from 'react';
import tavilyService from '../services/tavilyService';
import redisService from '../services/redisService';

const useSearch = (settings, sessionId, setMessages, kyartuMood) => {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchCommand = useCallback(async (userMessage, newMessages) => {
    setIsSearching(true);
    const query = userMessage.content.replace(/\/search|\/web|\/tavily/i, '').trim();
    
    try {
      const searchResults = await tavilyService.search(query);

      const searchMessage = {
        id: redisService.generateMessageId(),
        role: 'assistant',
        content: `I have searched for "${query}" and found the following results:\n\n${searchResults}`,
        timestamp: new Date().toISOString(),
        mood: kyartuMood,
        isSearch: true,
      };

      const finalMessages = [...newMessages, searchMessage];
      setMessages(finalMessages);
      await redisService.storeChatHistory(sessionId, finalMessages);

    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = {
        id: redisService.generateMessageId(),
        role: 'assistant',
        content: `Sorry, I encountered an error while searching: ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true,
        mood: 'annoyed',
      };
      const errorMessages = [...newMessages, errorMessage];
      setMessages(errorMessages);
      await redisService.storeChatHistory(sessionId, errorMessages);
    } finally {
      setIsSearching(false);
    }
  }, [settings, sessionId, setMessages, kyartuMood]);

  return { isSearching, handleSearchCommand };
};

export default useSearch;