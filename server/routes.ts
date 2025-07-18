import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChatMessageSchema, 
  insertUserSettingsSchema, 
  insertCreativeSessionSchema,
  insertWebAnalysisSchema,
  type ChatMessage
} from "@shared/schema";
import { 
  generateAriaResponse, 
  generateCreativeWritingHelp, 
  generateWhatIfResponse, 
  debugCode 
} from "./services/openai";
import { analyzeWebsite, isValidUrl } from "./services/webscraper";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat endpoints
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      
      // Store user message
      const userMessage = await storage.createChatMessage({
        ...messageData,
        role: "user"
      });

      // Get recent messages for context
      const recentMessages = await storage.getChatMessages();
      const context = recentMessages
        .slice(-5)
        .filter((msg: ChatMessage) => msg.role === "assistant")
        .map((msg: ChatMessage) => msg.content);

      // Get current settings for personality
      const settings = await storage.getUserSettings();
      const personality = settings?.personality as any || "flirty";

      // Generate ARIA response with fallback handling
      let ariaResponseContent;
      try {
        ariaResponseContent = await generateAriaResponse(
          messageData.content,
          personality,
          context
        );
      } catch (ariaError) {
        console.error("ARIA response error:", ariaError);
        ariaResponseContent = "I'm having some technical difficulties right now, but I'm still here with you! ♡ Please try again in a moment.";
      }

      // Store ARIA response
      const ariaMessage = await storage.createChatMessage({
        content: ariaResponseContent,
        role: "assistant",
        personality: personality,
        metadata: { responseTime: Date.now() }
      });

      res.json({ userMessage, ariaMessage });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.delete("/api/chat/clear", async (req, res) => {
    try {
      await storage.clearChatHistory();
      res.json({ message: "Chat history cleared successfully" });
    } catch (error) {
      console.error("Error clearing chat:", error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getUserSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settingsData = insertUserSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateUserSettings(settingsData);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Creative writing endpoints
  app.post("/api/creative/writing", async (req, res) => {
    try {
      const { type, prompt } = req.body;
      
      if (!type || !prompt) {
        return res.status(400).json({ message: "Type and prompt are required" });
      }

      const settings = await storage.getUserSettings();
      const personality = settings?.personality as any || "flirty";

      const result = await generateCreativeWritingHelp(type, prompt, personality);
      
      // Store the session
      await storage.createCreativeSession({
        type: "writing",
        prompt: `${type}: ${prompt}`,
        response: JSON.stringify(result),
        metadata: { type, personality }
      });

      res.json(result);
    } catch (error) {
      console.error("Error generating creative writing help:", error);
      res.status(500).json({ message: "Failed to generate creative writing help" });
    }
  });

  app.post("/api/creative/whatif", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const settings = await storage.getUserSettings();
      const personality = settings?.personality as any || "flirty";

      const result = await generateWhatIfResponse(prompt, personality);
      
      // Store the session
      await storage.createCreativeSession({
        type: "whatif",
        prompt,
        response: JSON.stringify(result),
        metadata: { personality }
      });

      res.json(result);
    } catch (error) {
      console.error("Error generating what-if response:", error);
      res.status(500).json({ message: "Failed to generate what-if response" });
    }
  });

  app.post("/api/creative/debug", async (req, res) => {
    try {
      const { code, errorLog } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }

      const settings = await storage.getUserSettings();
      const personality = settings?.personality as any || "flirty";

      const result = await debugCode(code, errorLog || "", personality);
      
      // Store the session
      await storage.createCreativeSession({
        type: "debug",
        prompt: `Code: ${code}\nError: ${errorLog}`,
        response: JSON.stringify(result),
        metadata: { personality }
      });

      res.json(result);
    } catch (error) {
      console.error("Error debugging code:", error);
      res.status(500).json({ message: "Failed to debug code" });
    }
  });

  // Web analysis endpoints
  app.post("/api/web/analyze", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      if (!isValidUrl(url)) {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      // Check if we already have analysis for this URL
      const existingAnalysis = await storage.getWebAnalysis(url);
      if (existingAnalysis) {
        return res.json(existingAnalysis);
      }

      // Analyze the website
      const analysis = await analyzeWebsite(url);
      
      // Store the analysis
      const storedAnalysis = await storage.createWebAnalysis({
        url,
        title: analysis.title,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints
      });

      res.json({
        ...storedAnalysis,
        wordCount: analysis.wordCount,
        readingTime: analysis.readingTime
      });
    } catch (error) {
      console.error("Error analyzing website:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze website" 
      });
    }
  });

  app.get("/api/web/recent", async (req, res) => {
    try {
      const recentAnalyses = await storage.getRecentWebAnalysis();
      res.json(recentAnalyses);
    } catch (error) {
      console.error("Error fetching recent analyses:", error);
      res.status(500).json({ message: "Failed to fetch recent analyses" });
    }
  });

  // Export data endpoint
  app.get("/api/export", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      const settings = await storage.getUserSettings();
      const creative = await storage.getCreativeSessions();
      const webAnalyses = await storage.getRecentWebAnalysis();

      const exportData = {
        exportDate: new Date().toISOString(),
        chatMessages: messages,
        settings,
        creativeSessions: creative,
        webAnalyses,
        version: "1.0"
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=aria-export-${Date.now()}.json`);
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
