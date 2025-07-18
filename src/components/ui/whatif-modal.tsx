import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Sparkles, Star, Wand2 } from "lucide-react";

interface WhatIfModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const samplePrompts = [
  "What if colors had feelings?",
  "What if dreams were currency?",
  "What if silence could speak?",
  "What if the moon loved me?",
  "What if gravity worked backwards?",
  "What if memories could be painted?"
];

export function WhatIfModal({ open, onOpenChange }: WhatIfModalProps) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<{ 
    possibilities: string[]; 
    inspiration: string; 
    mood: string 
  } | null>(null);
  const { toast } = useToast();

  const whatIfMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return await apiRequest("POST", "/api/creative/whatif", { prompt });
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Creative Possibilities Unlocked! ✨",
        description: "ARIA has imagined some beautiful possibilities for you!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate what-if response. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please give me a phrase or idea to explore! ♡",
        variant: "destructive"
      });
      return;
    }

    whatIfMutation.mutate(prompt.trim());
  };

  const handleUseSamplePrompt = (samplePrompt: string) => {
    setPrompt(samplePrompt);
  };

  const handleClose = () => {
    setResult(null);
    setPrompt("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-strong border-white/30 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
            What If Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!result ? (
            <>
              {/* Prompt Input */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">
                  Give me a phrase or idea...
                </Label>
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'What if the moon loved me?' or 'What if time could cry?'"
                  className="glass border-white/30 text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              {/* Sample Prompts */}
              <div>
                <Label className="text-sm text-gray-300 mb-2 block">Try these:</Label>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((samplePrompt, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="text-sm glass rounded-full px-3 py-1 text-white hover:bg-white/20 transition-all"
                      onClick={() => handleUseSamplePrompt(samplePrompt)}
                    >
                      {samplePrompt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                className="w-full bg-gradient-to-r from-[var(--aria-cyan)] to-[var(--aria-purple)] text-white font-semibold hover:scale-105 transition-all duration-300"
                onClick={handleSubmit}
                disabled={whatIfMutation.isPending || !prompt.trim()}
              >
                {whatIfMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    ARIA is imagining...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Creative Possibilities ✨
                  </>
                )}
              </Button>
            </>
          ) : (
            /* Results Display */
            <div className="space-y-4">
              {/* Mood Header */}
              <div className="text-center">
                <div className="inline-flex items-center glass rounded-full px-4 py-2 mb-4">
                  <Star className="w-4 h-4 mr-2 text-[var(--aria-cyan)]" />
                  <span className="text-white capitalize">{result.mood} vibes</span>
                </div>
              </div>

              {/* Possibilities */}
              <div className="glass rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-[var(--aria-pink)]" />
                  Creative Possibilities
                </h3>
                <div className="space-y-3">
                  {result.possibilities.map((possibility, index) => (
                    <div key={index} className="glass rounded-lg p-3">
                      <p className="text-white leading-relaxed">{possibility}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspiration */}
              <div className="glass rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                  Writing Inspiration
                </h3>
                <p className="text-white italic leading-relaxed">
                  "{result.inspiration}"
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 glass text-white hover:bg-white/20"
                  onClick={() => setResult(null)}
                >
                  Try Another Idea
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[var(--aria-cyan)] to-[var(--aria-purple)] text-white"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
