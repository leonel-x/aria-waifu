import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  personality: text("personality").default("flirty"),
  metadata: jsonb("metadata")
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  theme: text("theme").default("aura").notNull(),
  personality: text("personality").default("flirty").notNull(),
  voiceEnabled: boolean("voice_enabled").default(true).notNull(),
  ambientMusicEnabled: boolean("ambient_music_enabled").default(false).notNull(),
  soundEffectsEnabled: boolean("sound_effects_enabled").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const creativeSessions = pgTable("creative_sessions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'writing' | 'whatif' | 'debug'
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata")
});

export const webAnalysis = pgTable("web_analysis", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  summary: text("summary").notNull(),
  keyPoints: jsonb("key_points"),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
  role: true
}).extend({
  role: z.string().optional(),
  personality: z.string().optional(),
  metadata: z.any().optional()
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  updatedAt: true
});

export const insertCreativeSessionSchema = createInsertSchema(creativeSessions).omit({
  id: true,
  timestamp: true
});

export const insertWebAnalysisSchema = createInsertSchema(webAnalysis).omit({
  id: true,
  timestamp: true
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type CreativeSession = typeof creativeSessions.$inferSelect;
export type InsertCreativeSession = z.infer<typeof insertCreativeSessionSchema>;
export type WebAnalysis = typeof webAnalysis.$inferSelect;
export type InsertWebAnalysis = z.infer<typeof insertWebAnalysisSchema>;
