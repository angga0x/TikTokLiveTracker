import { 
  users, 
  liveStreams,
  chatMessages,
  gifts,
  type User, 
  type InsertUser,
  type LiveStream,
  type InsertLiveStream,
  type ChatMessage,
  type InsertChatMessage,
  type Gift,
  type InsertGift
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createLiveStream(stream: InsertLiveStream): Promise<LiveStream>;
  getLiveStream(id: number): Promise<LiveStream | undefined>;
  getLiveStreamByUsername(username: string): Promise<LiveStream | undefined>;
  updateLiveStream(id: number, updates: Partial<LiveStream>): Promise<LiveStream | undefined>;
  
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(streamId: number, limit?: number): Promise<ChatMessage[]>;
  
  createGift(gift: InsertGift): Promise<Gift>;
  getGifts(streamId: number, limit?: number): Promise<Gift[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private liveStreams: Map<number, LiveStream>;
  private chatMessages: Map<number, ChatMessage>;
  private gifts: Map<number, Gift>;
  
  private currentUserId: number;
  private currentStreamId: number;
  private currentMessageId: number;
  private currentGiftId: number;

  constructor() {
    this.users = new Map();
    this.liveStreams = new Map();
    this.chatMessages = new Map();
    this.gifts = new Map();
    
    this.currentUserId = 1;
    this.currentStreamId = 1;
    this.currentMessageId = 1;
    this.currentGiftId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createLiveStream(insertStream: InsertLiveStream): Promise<LiveStream> {
    const id = this.currentStreamId++;
    const stream: LiveStream = { 
      ...insertStream, 
      id,
      isActive: false,
      viewerCount: 0,
      messageCount: 0,
      giftCount: 0,
      coinCount: 0,
      startedAt: new Date()
    };
    this.liveStreams.set(id, stream);
    return stream;
  }

  async getLiveStream(id: number): Promise<LiveStream | undefined> {
    return this.liveStreams.get(id);
  }

  async getLiveStreamByUsername(username: string): Promise<LiveStream | undefined> {
    return Array.from(this.liveStreams.values()).find(
      (stream) => stream.tiktokUsername === username,
    );
  }

  async updateLiveStream(id: number, updates: Partial<LiveStream>): Promise<LiveStream | undefined> {
    const stream = this.liveStreams.get(id);
    if (!stream) return undefined;
    
    const updatedStream = { ...stream, ...updates };
    this.liveStreams.set(id, updatedStream);
    return updatedStream;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = { 
      id,
      streamId: insertMessage.streamId || null,
      username: insertMessage.username,
      message: insertMessage.message,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(streamId: number, limit: number = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.streamId === streamId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0))
      .slice(-limit);
  }

  async createGift(insertGift: InsertGift): Promise<Gift> {
    const id = this.currentGiftId++;
    const gift: Gift = { 
      id,
      streamId: insertGift.streamId || null,
      username: insertGift.username,
      giftName: insertGift.giftName,
      giftId: insertGift.giftId,
      count: insertGift.count || 1,
      coins: insertGift.coins || 0,
      timestamp: new Date()
    };
    this.gifts.set(id, gift);
    return gift;
  }

  async getGifts(streamId: number, limit: number = 50): Promise<Gift[]> {
    return Array.from(this.gifts.values())
      .filter(gift => gift.streamId === streamId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0))
      .slice(-limit);
  }
}

export const storage = new MemStorage();
