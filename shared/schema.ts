import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const liveStreams = pgTable("live_streams", {
  id: serial("id").primaryKey(),
  tiktokUsername: text("tiktok_username").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  viewerCount: integer("viewer_count").default(0),
  messageCount: integer("message_count").default(0),
  giftCount: integer("gift_count").default(0),
  coinCount: integer("coin_count").default(0),
  likeCount: integer("like_count").default(0),
  followCount: integer("follow_count").default(0),
  shareCount: integer("share_count").default(0),
  startedAt: timestamp("started_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").references(() => liveStreams.id),
  username: text("username").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const gifts = pgTable("gifts", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").references(() => liveStreams.id),
  username: text("username").notNull(),
  giftName: text("gift_name").notNull(),
  giftId: integer("gift_id").notNull(),
  count: integer("count").notNull().default(1),
  coins: integer("coins").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").references(() => liveStreams.id),
  username: text("username").notNull(),
  likeCount: integer("like_count").notNull().default(1),
  totalLikeCount: integer("total_like_count").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").references(() => liveStreams.id),
  username: text("username").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const shares = pgTable("shares", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").references(() => liveStreams.id),
  username: text("username").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  streamId: integer("stream_id").references(() => liveStreams.id),
  username: text("username").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLiveStreamSchema = createInsertSchema(liveStreams).pick({
  tiktokUsername: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  streamId: true,
  username: true,
  message: true,
}).extend({
  streamId: z.number().nullable().optional()
});

export const insertGiftSchema = createInsertSchema(gifts).pick({
  streamId: true,
  username: true,
  giftName: true,
  giftId: true,
  count: true,
  coins: true,
}).extend({
  streamId: z.number().nullable().optional(),
  count: z.number().optional(),
  coins: z.number().optional()
});

export const insertLikeSchema = createInsertSchema(likes).pick({
  streamId: true,
  username: true,
  likeCount: true,
  totalLikeCount: true,
}).extend({
  streamId: z.number().nullable().optional(),
  likeCount: z.number().optional(),
  totalLikeCount: z.number().optional()
});

export const insertFollowSchema = createInsertSchema(follows).pick({
  streamId: true,
  username: true,
}).extend({
  streamId: z.number().nullable().optional()
});

export const insertShareSchema = createInsertSchema(shares).pick({
  streamId: true,
  username: true,
}).extend({
  streamId: z.number().nullable().optional()
});

export const insertMemberSchema = createInsertSchema(members).pick({
  streamId: true,
  username: true,
}).extend({
  streamId: z.number().nullable().optional()
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;
export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertGift = z.infer<typeof insertGiftSchema>;
export type Gift = typeof gifts.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertShare = z.infer<typeof insertShareSchema>;
export type Share = typeof shares.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

// Socket event types
export interface SocketEvents {
  // Client to server
  'connect-tiktok': { username: string };
  'disconnect-tiktok': void;
  
  // Server to client
  'connection-status': { status: 'connecting' | 'connected' | 'disconnected'; username?: string; error?: string };
  'stream-stats': { viewerCount: number; messageCount: number; giftCount: number; coinCount: number; likeCount: number; followCount: number; shareCount: number };
  'new-chat': ChatMessage;
  'new-gift': Gift;
  'new-like': Like;
  'new-follow': Follow;
  'new-share': Share;
  'new-member': Member;
  'error': { message: string };
}
