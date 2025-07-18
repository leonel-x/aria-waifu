import { 
  chatMessages, 
  userSettings, 
  creativeSessions, 
  webAnalysis,
  type ChatMessage, 
  type InsertChatMessage,
  type UserSettings, 
  type InsertUserSettings,
  type CreativeSession, 
  type InsertCreativeSession,
  type WebAnalysis, 
  type InsertWebAnalysis
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Chat Messages
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatHistory(): Promise<void>;

  // User Settings
  getUserSettings(): Promise<UserSettings | undefined>;
  updateUserSettings(settings: InsertUserSettings): Promise<UserSettings>;

  // Creative Sessions
  getCreativeSessions(type?: string): Promise<CreativeSession[]>;
  createCreativeSession(session: InsertCreativeSession): Promise<CreativeSession>;

  // Web Analysis
  getWebAnalysis(url: string): Promise<WebAnalysis | undefined>;
  createWebAnalysis(analysis: InsertWebAnalysis): Promise<WebAnalysis>;
  getRecentWebAnalysis(): Promise<WebAnalysis[]>;
}

export class DatabaseStorage implements IStorage {
  async getChatMessages(): Promise<ChatMessage[]> {
    const messages = await db.select().from(chatMessages).orderBy(chatMessages.timestamp);
    return messages;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        content: insertMessage.content,
        role: insertMessage.role || "user",
        personality: insertMessage.personality || null,
        metadata: insertMessage.metadata || null
      })
      .returning();
    return message;
  }

  async clearChatHistory(): Promise<void> {
    await db.delete(chatMessages);
  }

  async getUserSettings(): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).limit(1);
    if (!settings) {
      // Create default settings if none exist
      const [defaultSettings] = await db
        .insert(userSettings)
        .values({
          theme: "aura",
          personality: "flirty",
          voiceEnabled: true,
          ambientMusicEnabled: false,
          soundEffectsEnabled: true
        })
        .returning();
      return defaultSettings;
    }
    return settings;
  }

  async updateUserSettings(settingsUpdate: InsertUserSettings): Promise<UserSettings> {
    const existingSettings = await this.getUserSettings();
    if (!existingSettings) {
      // Create new settings if none exist
      const [newSettings] = await db
        .insert(userSettings)
        .values(settingsUpdate)
        .returning();
      return newSettings;
    }
    
    const [updatedSettings] = await db
      .update(userSettings)
      .set({
        ...settingsUpdate,
        updatedAt: new Date()
      })
      .where(eq(userSettings.id, existingSettings.id))
      .returning();
    return updatedSettings;
  }

  async getCreativeSessions(type?: string): Promise<CreativeSession[]> {
    if (type) {
      const sessions = await db
        .select()
        .from(creativeSessions)
        .where(eq(creativeSessions.type, type))
        .orderBy(desc(creativeSessions.timestamp));
      return sessions;
    } else {
      const sessions = await db
        .select()
        .from(creativeSessions)
        .orderBy(desc(creativeSessions.timestamp));
      return sessions;
    }
  }

  async createCreativeSession(insertSession: InsertCreativeSession): Promise<CreativeSession> {
    const [session] = await db
      .insert(creativeSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getWebAnalysis(url: string): Promise<WebAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(webAnalysis)
      .where(eq(webAnalysis.url, url))
      .limit(1);
    return analysis || undefined;
  }

  async createWebAnalysis(insertAnalysis: InsertWebAnalysis): Promise<WebAnalysis> {
    const [analysis] = await db
      .insert(webAnalysis)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getRecentWebAnalysis(): Promise<WebAnalysis[]> {
    const analyses = await db
      .select()
      .from(webAnalysis)
      .orderBy(desc(webAnalysis.timestamp))
      .limit(10);
    return analyses;
  }
}

export const storage = new DatabaseStorage();
