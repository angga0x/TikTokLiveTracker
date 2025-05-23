import { z } from "zod";

export interface LiveStream {
  id: number;
  tiktokUsername: string;
  isActive: boolean;
  viewerCount: number;
  messageCount: number;
  giftCount: number;
  coinCount: number;
  likeCount: number;
  followCount: number;
  shareCount: number;
  startedAt: Date;
}

export interface ChatMessage {
  id: number;
  streamId: number | null;
  username: string;
  message: string;
  timestamp: Date;
}

export interface Gift {
  id: number;
  streamId: number | null;
  username: string;
  giftName: string;
  giftId: number;
  count: number;
  coins: number;
  timestamp: Date;
}

export interface Like {
  id: number;
  streamId: number | null;
  username: string;
  likeCount: number;
  totalLikeCount: number;
  timestamp: Date;
}

export interface Follow {
  id: number;
  streamId: number | null;
  username: string;
  timestamp: Date;
}

export interface Share {
  id: number;
  streamId: number | null;
  username: string;
  timestamp: Date;
}

export interface Member {
  id: number;
  streamId: number | null;
  username: string;
  timestamp: Date;
}

// Zod schemas for validation
export const liveStreamSchema = z.object({
  tiktokUsername: z.string(),
});

export const chatMessageSchema = z.object({
  username: z.string(),
  message: z.string(),
});

export const giftSchema = z.object({
  username: z.string(),
  giftName: z.string(),
  giftId: z.number(),
  count: z.number().optional(),
  coins: z.number().optional(),
});

export const likeSchema = z.object({
  username: z.string(),
  likeCount: z.number().optional(),
  totalLikeCount: z.number().optional(),
});

export const followSchema = z.object({
  username: z.string(),
});

export const shareSchema = z.object({
  username: z.string(),
});

export const memberSchema = z.object({
  username: z.string(),
});

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
