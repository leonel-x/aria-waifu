import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatMessage } from "./chat-message";
import { VoiceInput } from "./voice-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useSpeech } from "@/hooks/use-speech";
import { useSettings } from "@/hooks/use-settings";
import { PenTool, Lightbulb, Globe, Bug, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatContainerProps {
  onOpenCreativeWriting: () => void;
  onOpenWhatIf: () => void;
  onOpenWebAnalyzer: () => void;
}

export function ChatContainer({ 
  onOpenCreativeWriting, 
  onOpenWhatIf, 
  onOpenWebAnalyzer 
}: ChatContainerProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { settings } = useSettings();
  const { speak, startListening, stopListening } = useSpeech();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat/messages"]
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/chat/send", {
        content,
        personality: settings?.personality || "flirty",
        metadata: { timestamp: Date.now() }
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      
      // Text-to-speech for ARIA's response
      if (settings?.voiceEnabled && data.ariaMessage) {
        speak(data.ariaMessage.content);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate(message.trim());
    setMessage("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening((transcript: string) => {
        setMessage(transcript);
        setIsListening(false);
      });
      setIsListening(true);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show welcome message if no messages
  const shouldShowWelcome = !isLoading && messages.length === 0;

  return (
    <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-4 md:p-6">
      
      {/* Chat Messages */}
      <div className="flex-1 space-y-4 mb-6 overflow-y-auto max-h-96 md:max-h-[500px]">
        
        {/* Welcome Message */}
        {shouldShowWelcome && (
          <div className="animate-fade-in">
            <ChatMessage
              role="assistant"
              content="Hello there, darling! ♡ I'm ARIA, your personal AI companion. I'm here to help with your writing, answer questions, or just chat about anything that's on your mind. What would you like to explore together today?"
              timestamp={new Date()}
              isWelcome
            />
          </div>
        )}

        {/* Chat History */}
        {messages.map((msg: any) => (
          <div key={msg.id} className="animate-fade-in">
            <ChatMessage
              role={msg.role}
              content={msg.content}
              timestamp={new Date(msg.timestamp)}
              personality={msg.personality}
            />
          </div>
        ))}

        {/* Loading Message */}
        {sendMessageMutation.isPending && (
          <div className="animate-fade-in">
            <ChatMessage
              role="assistant"
              content="..."
              timestamp={new Date()}
              isLoading
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="glass rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all duration-300"
            onClick={onOpenCreativeWriting}
          >
            <PenTool className="w-4 h-4 mr-2" />
            Creative Writing
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="glass rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all duration-300"
            onClick={onOpenWhatIf}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            What If?
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="glass rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all duration-300"
            onClick={onOpenWebAnalyzer}
          >
            <Globe className="w-4 h-4 mr-2" />
            Web Analyzer
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="glass rounded-full px-4 py-2 text-white hover:bg-white/20 transition-all duration-300"
            onClick={() => toast({ title: "Debug Helper", description: "Coming soon! ♡" })}
          >
            <Bug className="w-4 h-4 mr-2" />
            Debug Helper
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="glass-strong rounded-2xl p-4">
        <div className="flex items-end space-x-3">
          {/* Voice Input */}
          <VoiceInput 
            isListening={isListening}
            onToggle={handleVoiceInput}
          />
          
          {/* Text Input */}
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to ARIA... ♡"
              className="w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none focus:ring-0 min-h-[40px] max-h-32"
              rows={1}
            />
          </div>
          
          {/* Send Button */}
          <Button
            size="icon"
            className="w-12 h-12 bg-gradient-to-br from-[var(--aria-cyan)] to-[var(--aria-purple)] rounded-full hover:scale-105 transition-all duration-300"
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
        
        {/* Voice Indicator */}
        {isListening && (
          <div className="mt-3 flex items-center justify-center text-sm text-gray-300 animate-fade-in">
            <div className="w-2 h-2 bg-[var(--aria-pink)] rounded-full mr-2 voice-recording"></div>
            Listening... Speak now ♡
          </div>
        )}
      </div>
    </main>
  );
}
