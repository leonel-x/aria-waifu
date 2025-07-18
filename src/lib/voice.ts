export interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voiceName?: string;
}

export class VoiceManager {
  private synthesis: SpeechSynthesis;
  private recognition: SpeechRecognition | null = null;
  private settings: VoiceSettings;

  constructor(settings: VoiceSettings = { rate: 0.9, pitch: 1.2, volume: 0.8 }) {
    this.synthesis = window.speechSynthesis;
    this.settings = settings;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply voice settings
      utterance.rate = this.settings.rate;
      utterance.pitch = this.settings.pitch;
      utterance.volume = this.settings.volume;

      // Try to set a female voice for anime-style personality
      const voices = this.synthesis.getVoices();
      if (this.settings.voiceName) {
        const selectedVoice = voices.find(voice => voice.name === this.settings.voiceName);
        if (selectedVoice) utterance.voice = selectedVoice;
      } else {
        // Auto-select a female voice
        const femaleVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('alex') // Some systems use Alex as female
        );
        if (femaleVoice) utterance.voice = femaleVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  async listen(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error("Speech recognition not supported in this browser"));
        return;
      }

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      this.recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.start();
    });
  }

  updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  stop() {
    this.synthesis.cancel();
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}

// Global voice manager instance
export const voiceManager = new VoiceManager();

// Personality-based voice configurations
export const personalityVoices = {
  flirty: { rate: 0.8, pitch: 1.3, volume: 0.9 },
  protective: { rate: 0.9, pitch: 1.0, volume: 0.8 },
  cheerful: { rate: 1.1, pitch: 1.4, volume: 1.0 },
  serious: { rate: 0.8, pitch: 0.9, volume: 0.7 },
  dark: { rate: 0.7, pitch: 0.8, volume: 0.6 }
};
