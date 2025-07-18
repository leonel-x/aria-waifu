import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceInputProps {
  isListening: boolean;
  onToggle: () => void;
}

export function VoiceInput({ isListening, onToggle }: VoiceInputProps) {
  return (
    <Button
      size="icon"
      className={`w-12 h-12 rounded-full transition-all duration-300 ${
        isListening 
          ? "voice-recording bg-gradient-to-br from-[var(--aria-pink)] to-[var(--aria-purple)]"
          : "bg-gradient-to-br from-[var(--aria-pink)] to-[var(--aria-purple)] hover:scale-105"
      }`}
      onClick={onToggle}
    >
      {isListening ? (
        <MicOff className="w-5 h-5 text-white" />
      ) : (
        <Mic className="w-5 h-5 text-white" />
      )}
    </Button>
  );
}
