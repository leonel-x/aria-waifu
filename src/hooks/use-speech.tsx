import { useState, useRef, useCallback } from "react";
import { useSettings } from "./use-settings";

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { settings } = useSettings();

  const speak = useCallback((text: string) => {
    if (!settings?.voiceEnabled || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice for anime-style personality
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;

    // Try to find a mature female voice with priority order
    const voices = window.speechSynthesis.getVoices();
    
    // Priority order for mature female voices
    const preferredVoices = [
      'Microsoft Zira - English (United States)',
      'Microsoft Hazel - English (Great Britain)', 
      'Google UK English Female',
      'Google US English Female',
      'Samantha',
      'Karen',
      'Victoria',
      'Allison',
      'Ava',
      'Serena'
    ];
    
    let selectedVoice = null;
    
    // First try exact matches from preferred list
    for (const preferred of preferredVoices) {
      selectedVoice = voices.find(voice => voice.name === preferred);
      if (selectedVoice) break;
    }
    
    // Fallback to any female voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        (voice.name.toLowerCase().includes('zira')) ||
        (voice.name.toLowerCase().includes('hazel')) ||
        (voice.name.toLowerCase().includes('samantha')) ||
        (voice.name.toLowerCase().includes('karen')) ||
        (voice.name.toLowerCase().includes('victoria')) ||
        (voice.name.toLowerCase().includes('allison'))
      );
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`ARIA voice selected: ${selectedVoice.name}`);
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [settings?.voiceEnabled]);

  const startListening = useCallback((onResult: (transcript: string) => void) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition not supported");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    speak,
    startListening,
    stopListening
  };
}
