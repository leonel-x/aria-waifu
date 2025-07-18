import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Globe, Search, Clock, BookOpen, CheckCircle, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface WebAnalyzerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AnalysisResult {
  id: number;
  url: string;
  title: string;
  summary: string;
  keyPoints: string[];
  wordCount?: number;
  readingTime?: number;
  timestamp: string;
}

export function WebAnalyzerModal({ open, onOpenChange }: WebAnalyzerModalProps) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const { data: recentAnalyses } = useQuery({
    queryKey: ["/api/web/recent"],
    enabled: open && !result
  });

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      return await apiRequest("POST", "/api/web/analyze", { url });
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Analysis Complete! ♡",
        description: "ARIA has analyzed the website and extracted key information!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze website. Please check the URL and try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    if (!url.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a website URL to analyze! ♡",
        variant: "destructive"
      });
      return;
    }

    // Add protocol if missing
    let processedUrl = url.trim();
    if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
      processedUrl = "https://" + processedUrl;
    }

    analyzeMutation.mutate(processedUrl);
  };

  const handleClose = () => {
    setResult(null);
    setUrl("");
    onOpenChange(false);
  };

  const handleAnalyzeRecent = (recentUrl: string) => {
    setUrl(recentUrl);
    analyzeMutation.mutate(recentUrl);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-strong border-white/30 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center">
            <Globe className="w-5 h-5 mr-2 text-[var(--aria-cyan)]" />
            Website Analyzer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!result ? (
            <>
              {/* URL Input */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">
                  Enter Website URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com or just example.com"
                    className="glass border-white/30 text-white placeholder-gray-400 flex-1"
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <Button
                    className="bg-gradient-to-r from-[var(--aria-cyan)] to-[var(--aria-purple)] text-white hover:scale-105 transition-all duration-300"
                    onClick={handleSubmit}
                    disabled={analyzeMutation.isPending || !url.trim()}
                  >
                    {analyzeMutation.isPending ? (
                      <Search className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Recent Analyses */}
              {recentAnalyses && recentAnalyses.length > 0 && (
                <>
                  <Separator className="border-white/20" />
                  <div>
                    <Label className="text-white text-sm font-medium mb-3 block">
                      Recent Analyses
                    </Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {recentAnalyses.map((analysis: AnalysisResult) => (
                        <div key={analysis.id} className="glass rounded-lg p-3 hover:bg-white/20 transition-all cursor-pointer" onClick={() => handleAnalyzeRecent(analysis.url)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{analysis.title}</h4>
                              <p className="text-sm text-gray-300 truncate">{analysis.url}</p>
                              <p className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(analysis.timestamp), { addSuffix: true })}
                              </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            /* Results Display */
            <div className="space-y-4">
              {/* Header */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white flex-1">{result.title}</h3>
                  <CheckCircle className="w-5 h-5 text-green-400 ml-2 flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-300 break-all">{result.url}</p>
                
                {/* Metrics */}
                {(result.wordCount || result.readingTime) && (
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-300">
                    {result.wordCount && (
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {result.wordCount.toLocaleString()} words
                      </div>
                    )}
                    {result.readingTime && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {result.readingTime} min read
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="glass rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
                <p className="text-white leading-relaxed">{result.summary}</p>
              </div>

              {/* Key Points */}
              {result.keyPoints && result.keyPoints.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Key Points</h3>
                  <ul className="space-y-2">
                    {result.keyPoints.map((point, index) => (
                      <li key={index} className="text-white flex items-start">
                        <span className="text-[var(--aria-cyan)] mr-2 mt-1">•</span>
                        <span>{point}</span>
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
                  Analyze Another URL
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
