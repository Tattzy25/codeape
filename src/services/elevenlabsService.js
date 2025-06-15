class ElevenLabsService {
  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.defaultVoiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam voice
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