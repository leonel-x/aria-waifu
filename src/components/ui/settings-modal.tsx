import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Palette, Volume2, Database, X, Download, Trash2 } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const themes = [
  { id: "water", name: "Water", class: "bg-water" },
  { id: "mist", name: "Mist", class: "bg-mist" },
  { id: "fire", name: "Fire", class: "bg-fire" },
  { id: "aura", name: "Aura", class: "bg-aura" },
  { id: "void", name: "Void", class: "bg-void" },
  { id: "wind", name: "Wind", class: "bg-wind" },
  { id: "smoke", name: "Smoke", class: "bg-smoke" }
];

const personalities = [
  { id: "flirty", name: "Flirty & Playful", description: "♡" },
  { id: "protective", name: "Protective & Caring", description: "🛡️" },
  { id: "cheerful", name: "Cheerful & Energetic", description: "✨" },
  { id: "serious", name: "Serious & Professional", description: "💼" },
  { id: "dark", name: "Dark & Mysterious", description: "🌙" }
];

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const clearChatMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/chat/clear"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      toast({
        title: "Chat Cleared",
        description: "Your chat history has been cleared successfully! ♡"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear chat history. Please try again.",
        variant: "destructive"
      });
    }
  });

  const exportDataMutation = useMutation({
    mutationFn: () => apiRequest("GET", "/api/export"),
    onSuccess: (response) => {
      // Create download link
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `aria-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully! ♡"
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  });

  if (!settings) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-white/30 max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center">
            <X className="w-5 h-5 mr-2" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personality Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-[var(--aria-pink)]" />
              Personality
            </h3>
            <RadioGroup
              value={settings.personality}
              onValueChange={(value) => updateSettings({ ...settings, personality: value })}
              className="space-y-3"
            >
              {personalities.map((personality) => (
                <div key={personality.id} className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={personality.id} 
                    id={personality.id}
                    className="border-white/30 text-[var(--aria-purple)]"
                  />
                  <Label 
                    htmlFor={personality.id} 
                    className="text-white cursor-pointer flex-1"
                  >
                    {personality.name} {personality.description}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-[var(--aria-cyan)]" />
              Visual Theme
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <Button
                  key={theme.id}
                  variant={settings.theme === theme.id ? "default" : "ghost"}
                  className={`glass rounded-xl p-3 h-auto flex-col space-y-2 hover:bg-white/20 transition-all ${
                    settings.theme === theme.id ? "bg-white/20" : ""
                  }`}
                  onClick={() => updateSettings({ ...settings, theme: theme.id })}
                >
                  <div className={`w-full h-8 ${theme.class} rounded-lg`}></div>
                  <span className="text-sm text-white">
                    {theme.name} {settings.theme === theme.id ? "✓" : ""}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Audio Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Volume2 className="w-5 h-5 mr-2 text-[var(--aria-purple)]" />
              Audio
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-responses" className="text-white">
                  Voice Responses
                </Label>
                <Switch
                  id="voice-responses"
                  checked={settings.voiceEnabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ ...settings, voiceEnabled: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="ambient-music" className="text-white">
                  Ambient Music
                </Label>
                <Switch
                  id="ambient-music"
                  checked={settings.ambientMusicEnabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ ...settings, ambientMusicEnabled: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-effects" className="text-white">
                  Sound Effects
                </Label>
                <Switch
                  id="sound-effects"
                  checked={settings.soundEffectsEnabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ ...settings, soundEffectsEnabled: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Database className="w-5 h-5 mr-2 text-[var(--aria-cyan)]" />
              Data
            </h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full glass rounded-xl p-3 text-white hover:bg-white/20 justify-start"
                onClick={() => exportDataMutation.mutate()}
                disabled={exportDataMutation.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
              
              <Button
                variant="ghost"
                className="w-full glass rounded-xl p-3 text-white hover:bg-red-500/20 justify-start"
                onClick={() => clearChatMutation.mutate()}
                disabled={clearChatMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat History
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
