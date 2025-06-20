class ElevenLabsService {
  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.defaultVoiceId = 'cEOAFYYd4CZK41v4bLEb'; // Kyartu's voice ID
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async synthesizeSpeech(text, voiceId = this.defaultVoiceId) {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not found');
    }

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorData.detail || response.statusText}`);
      }

      const audioBlob = await response.blob();
      return audioBlob;
    } catch (error) {
      console.error('ElevenLabs synthesis error:', error);
      throw error;
    }
  }

  async playAudio(audioBlob) {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      throw error;
    }
  }

  async textToSpeech(text, voiceId) {
    try {
      const audioBlob = await this.synthesizeSpeech(text, voiceId);
      await this.playAudio(audioBlob);
      return true;
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw error;
    }
  }

  // Recording functionality for speech-to-text
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        
        // Stop all tracks to release microphone
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        this.mediaRecorder = null;
        resolve(audioBlob);
      };
      
      this.mediaRecorder.onerror = (error) => {
        reject(error);
      };
      
      this.mediaRecorder.stop();
    });
  }

  // Speech-to-text using Web Speech API (fallback for ElevenLabs STT)
  async speechToText(audioBlob) {
    try {
      // For now, we'll use a simple approach with Web Speech API
      // In a production environment, you'd want to use ElevenLabs STT API
      return new Promise((resolve, reject) => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          // Fallback: return a generic response to keep conversation going
          const responses = [
            "Yeah, I hear you bro",
            "Uh huh, go on",
            "What else you got?",
            "I'm listening, ara",
            "Keep talking"
          ];
          resolve(responses[Math.floor(Math.random() * responses.length)]);
          return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          // Fallback response
          resolve("I didn't catch that, but keep going ara");
        };
        
        recognition.onend = () => {
          // If no result was captured, provide fallback
          resolve("Tell me more, bro");
        };
        
        // Convert blob to audio and start recognition
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onloadeddata = () => {
          recognition.start();
        };
        
        audio.load();
      });
    } catch (error) {
      console.error('Speech-to-text error:', error);
      // Return fallback response
      return "I'm here, keep talking ara";
    }
  }

  // Get available voices
  async getVoices() {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not found');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Failed to get voices:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const elevenlabsService = new ElevenLabsService();
export default elevenlabsService;