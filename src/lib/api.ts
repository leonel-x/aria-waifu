import { apiRequest } from "./queryClient";

export interface ChatMessage {
  id: number;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  personality?: string;
  metadata?: any;
}

export interface Settings {
  id: number;
  theme: string;
  personality: string;
  voiceEnabled: boolean;
  ambientMusicEnabled: boolean;
  soundEffectsEnabled: boolean;
  updatedAt: string;
}

export const api = {
  // Chat API
  async sendMessage(content: string, personality?: string) {
    const response = await apiRequest("POST", "/api/chat/send", {
      content,
      personality,
      metadata: { timestamp: Date.now() }
    });
    return response.json();
  },

  async getChatMessages(): Promise<ChatMessage[]> {
    const response = await apiRequest("GET", "/api/chat/messages");
    return response.json();
  },

  async clearChatHistory() {
    const response = await apiRequest("DELETE", "/api/chat/clear");
    return response.json();
  },

  // Settings API
  async getSettings(): Promise<Settings> {
    const response = await apiRequest("GET", "/api/settings");
    return response.json();
  },

  async updateSettings(settings: Partial<Settings>) {
    const response = await apiRequest("PUT", "/api/settings", settings);
    return response.json();
  },

  // Creative API
  async getCreativeWritingHelp(type: string, prompt: string) {
    const response = await apiRequest("POST", "/api/creative/writing", {
      type,
      prompt
    });
    return response.json();
  },

  async generateWhatIf(prompt: string) {
    const response = await apiRequest("POST", "/api/creative/whatif", {
      prompt
    });
    return response.json();
  },

  async debugCode(code: string, errorLog?: string) {
    const response = await apiRequest("POST", "/api/creative/debug", {
      code,
      errorLog
    });
    return response.json();
  },

  // Web Analysis API
  async analyzeWebsite(url: string) {
    const response = await apiRequest("POST", "/api/web/analyze", { url });
    return response.json();
  },

  async getRecentWebAnalyses() {
    const response = await apiRequest("GET", "/api/web/recent");
    return response.json();
  },

  // Export API
  async exportData() {
    const response = await apiRequest("GET", "/api/export");
    return response.json();
  }
};
