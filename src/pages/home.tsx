import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { ChatContainer } from "@/components/chat/chat-container";
import { SettingsModal } from "@/components/ui/settings-modal";
import { CreativeWritingModal } from "@/components/ui/creative-writing-modal";
import { WhatIfModal } from "@/components/ui/whatif-modal";
import { WebAnalyzerModal } from "@/components/ui/web-analyzer-modal";
import { AvatarViewer } from "@/components/ui/avatar-viewer";
import { useSettings } from "@/hooks/use-settings";
import { Heart, Volume2, Settings, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [showCreativeWriting, setShowCreativeWriting] = useState(false);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showWebAnalyzer, setShowWebAnalyzer] = useState(false);
  const [ariaMood, setAriaMood] = useState("Feeling flirty today ♡");
  
  const { settings, updateSettings } = useSettings();

  const { data: messagesData } = useQuery({
    queryKey: ["/api/chat/messages"],
    refetchInterval: 1000 // Refresh every second for real-time feel
  });

  // Update ARIA's mood based on recent interactions
  useEffect(() => {
    if (messagesData && messagesData.length > 0) {
      const lastMessage = messagesData[messagesData.length - 1];
      if (lastMessage.role === "assistant") {
        const moods = {
          flirty: "Feeling playful and flirty ♡",
          protective: "In protective mode, watching over you",
          cheerful: "So happy and energetic today!",
          serious: "In professional mode",
          dark: "Embracing the shadows..."
        };
        setAriaMood(moods[settings?.personality as keyof typeof moods] || moods.flirty);
      }
    }
  }, [messagesData, settings?.personality]);

  const toggleVoice = () => {
    if (settings) {
      updateSettings({
        ...settings,
        voiceEnabled: !settings.voiceEnabled
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground theme={settings?.theme || "aura"} />
      
      {/* 3D Avatar */}
      <AvatarViewer />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="glass border-b border-white/20 p-4 md:p-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--aria-purple)] to-[var(--aria-pink)] rounded-full flex items-center justify-center animate-glow">
                <Heart className="text-white text-lg" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">ARIA</h1>
                <p className="text-sm text-gray-300">{ariaMood}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="glass rounded-full w-12 h-12 hover:bg-white/20 transition-all duration-300"
                onClick={toggleVoice}
              >
                {settings?.voiceEnabled ? (
                  <Volume2 className="w-5 h-5 text-white" />
                ) : (
                  <VolumeX className="w-5 h-5 text-white" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="glass rounded-full w-12 h-12 hover:bg-white/20 transition-all duration-300"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <ChatContainer 
          onOpenCreativeWriting={() => setShowCreativeWriting(true)}
          onOpenWhatIf={() => setShowWhatIf(true)}
          onOpenWebAnalyzer={() => setShowWebAnalyzer(true)}
        />
      </div>

      {/* Modals */}
      <SettingsModal 
        open={showSettings} 
        onOpenChange={setShowSettings}
      />
      
      <CreativeWritingModal 
        open={showCreativeWriting} 
        onOpenChange={setShowCreativeWriting}
      />
      
      <WhatIfModal 
        open={showWhatIf} 
        onOpenChange={setShowWhatIf}
      />
      
      <WebAnalyzerModal 
        open={showWebAnalyzer} 
        onOpenChange={setShowWebAnalyzer}
      />

      {/* Status Indicator */}
      <div className="fixed bottom-4 left-4 glass rounded-full px-4 py-2 text-sm text-white z-20">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <span>Connected</span>
        </div>
      </div>
    </div>
  );
}
