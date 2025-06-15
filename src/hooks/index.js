import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { storage, debounce, throttle } from '../utils';

// Hook for managing localStorage with React state
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    return storage.get(key, initialValue);
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storage.set(key, valueToStore);
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// Hook for debounced values
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for throttled callbacks
export const useThrottle = (callback, delay) => {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  );

  return throttledCallback;
};

// Hook for previous value
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

// Hook for window size
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Hook for media queries
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
};

// Hook for online/offline status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Hook for copy to clipboard
export const useClipboard = (timeout = 2000) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), timeout);
      return true;
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      setIsCopied(false);
      return false;
    }
  }, [timeout]);

  return { isCopied, copyToClipboard };
};

// Hook for intersection observer
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return { isIntersecting, entry, elementRef };
};

// Hook for scroll position
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset,
      });
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};

// Hook for keyboard shortcuts
export const useKeyboardShortcut = (keys, callback, options = {}) => {
  const { target = document, event = 'keydown' } = options;

  useEffect(() => {
    const handleKeyPress = (e) => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      const keyPressed = keysArray.every(key => {
        switch (key) {
          case 'ctrl':
            return e.ctrlKey;
          case 'shift':
            return e.shiftKey;
          case 'alt':
            return e.altKey;
          case 'meta':
            return e.metaKey;
          default:
            return e.key.toLowerCase() === key.toLowerCase();
        }
      });

      if (keyPressed) {
        e.preventDefault();
        callback(e);
      }
    };

    target.addEventListener(event, handleKeyPress);
    return () => target.removeEventListener(event, handleKeyPress);
  }, [keys, callback, target, event]);
};

// Hook for async operations
export const useAsync = (asyncFunction, dependencies = []) => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await asyncFunction(...args);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, dependencies);

  return { ...state, execute };
};

// Hook for managing form state
export const useForm = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationSchema).forEach(field => {
      const validator = validationSchema[field];
      const value = values[field];
      
      if (typeof validator === 'function') {
        const error = validator(value, values);
        if (error) newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema]);

  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      if (e) e.preventDefault();
      
      setIsSubmitting(true);
      const isValid = validate();
      
      if (isValid) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }
      
      setIsSubmitting(false);
    };
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validate,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

// Hook for managing chat state
export const useChat = () => {
  const [messages, setMessages] = useLocalStorage('chat_history', []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addMessage = useCallback((message) => {
    const newMessage = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...message
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, [setMessages]);

  const updateMessage = useCallback((id, updates) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  }, [setMessages]);

  const deleteMessage = useCallback((id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, [setMessages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const getLastUserMessage = useCallback(() => {
    return messages.filter(msg => msg.role === 'user').pop();
  }, [messages]);

  const getLastAssistantMessage = useCallback(() => {
    return messages.filter(msg => msg.role === 'assistant').pop();
  }, [messages]);

  return {
    messages,
    isLoading,
    error,
    setIsLoading,
    setError,
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    getLastUserMessage,
    getLastAssistantMessage
  };
};

// Hook for managing app settings
export const useSettings = () => {
  const [settings, setSettings] = useLocalStorage('app_settings', {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 1024,
    topP: 1,
    stream: true,
    theme: 'light',
    language: 'en'
  });

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      maxTokens: 1024,
      topP: 1,
      stream: true,
      theme: 'light',
      language: 'en'
    });
  }, [setSettings]);

  return {
    settings,
    updateSetting,
    updateSettings,
    resetSettings
  };
};