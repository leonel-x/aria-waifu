import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PenTool, Sparkles } from "lucide-react";

interface CreativeWritingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const writingTypes = [
  { value: "plot", label: "Plot Development" },
  { value: "dialogue", label: "Dialogue Improvement" },
  { value: "character", label: "Character Development" },
  { value: "tone", label: "Tone & Style" },
  { value: "scene", label: "Scene Writing" },
  { value: "pacing", label: "Pacing & Structure" },
  { value: "worldbuilding", label: "World Building" }
];

export function CreativeWritingModal({ open, onOpenChange }: CreativeWritingModalProps) {
  const [type, setType] = useState("plot");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<{ advice: string; suggestions: string[] } | null>(null);
  const { toast } = useToast();

  const creativeMutation = useMutation({
    mutationFn: async ({ type, prompt }: { type: string; prompt: string }) => {
      return await apiRequest("POST", "/api/creative/writing", { type, prompt });
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Creative Advice Ready! ♡",
        description: "ARIA has analyzed your writing challenge and prepared some suggestions!"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate creative writing help. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your writing challenge first! ♡",
        variant: "destructive"
      });
      return;
    }

    creativeMutation.mutate({ type, prompt: prompt.trim() });
  };

  const handleClose = () => {
    setResult(null);
    setPrompt("");
    setType("plot");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-strong border-white/30 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center">
            <PenTool className="w-5 h-5 mr-2 text-[var(--aria-pink)]" />
            Creative Writing Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!result ? (
            <>
              {/* Writing Type Selection */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">
                  What kind of help do you need?
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="glass border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/30">
                    {writingTypes.map((wType) => (
                      <SelectItem key={wType.value} value={wType.value} className="text-white">
                        {wType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt Input */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">
                  Describe your current writing challenge
                </Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tell ARIA about your story, characters, or the specific scene you're working on..."
                  className="glass border-white/30 text-white placeholder-gray-400 min-h-32 resize-none"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button
                className="w-full bg-gradient-to-r from-[var(--aria-pink)] to-[var(--aria-purple)] text-white font-semibold hover:scale-105 transition-all duration-300"
                onClick={handleSubmit}
                disabled={creativeMutation.isPending || !prompt.trim()}
              >
                {creativeMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    ARIA is thinking...
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4 mr-2" />
                    Get ARIA's Creative Advice ♡
                  </>
                )}
              </Button>
            </>
          ) : (
            /* Results Display */
            <div className="space-y-4">
              <div className="glass rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-[var(--aria-pink)]" />
                  ARIA's Advice
                </h3>
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {result.advice}
                </p>
              </div>

              {result.suggestions && result.suggestions.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Specific Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-white flex items-start">
                        <span className="text-[var(--aria-cyan)] mr-2 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 glass text-white hover:bg-white/20"
                  onClick={() => setResult(null)}
                >
                  Ask Another Question
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
