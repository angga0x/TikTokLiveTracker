import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { SocketEvents } from "@shared/schema";

// TikTok Live Connector import
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

interface ExtendedWebSocket extends WebSocket {
  id: string;
  currentStream?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connections = new Map<string, ExtendedWebSocket>();
  let currentConnection: TikTokLiveConnection | null = null; // TikTok live connection
  let currentStreamId: number | null = null;

  wss.on('connection', (ws: ExtendedWebSocket) => {
    const id = Math.random().toString(36).substring(7);
    ws.id = id;
    connections.set(id, ws);
    
    console.log(`WebSocket client connected: ${id}`);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'connect-tiktok':
            await handleTikTokConnect(message.data.username, ws);
            break;
            
          case 'disconnect-tiktok':
            await handleTikTokDisconnect(ws);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        sendToClient(ws, 'error', { message: 'Invalid message format' });
      }
    });

    ws.on('close', () => {
      connections.delete(id);
      console.log(`WebSocket client disconnected: ${id}`);
    });
  });

  async function handleTikTokConnect(username: string, ws: ExtendedWebSocket) {
    try {
      // Disconnect existing connection if any
      if (currentConnection) {
        currentConnection.disconnect();
      }

      sendToClient(ws, 'connection-status', { status: 'connecting', username });

      // Create or get live stream record
      let stream = await storage.getLiveStreamByUsername(username);
      if (!stream) {
        stream = await storage.createLiveStream({ tiktokUsername: username });
      }
      
      currentStreamId = stream.id;
      ws.currentStream = stream.id;

      // Create TikTok live connection using the correct API
      currentConnection = new TikTokLiveConnection(username);

      // Event handlers
      currentConnection.connect().then(async (state: any) => {
        console.log(`Connected to TikTok Live: ${username} - RoomId: ${state.roomId}`);
        
        // Update stream status
        await storage.updateLiveStream(stream!.id, { 
          isActive: true, 
          viewerCount: state.viewerCount || 0 
        });

        sendToClient(ws, 'connection-status', { status: 'connected', username });
        sendToClient(ws, 'stream-stats', {
          viewerCount: state.viewerCount || 0,
          messageCount: stream!.messageCount || 0,
          giftCount: stream!.giftCount || 0,
          coinCount: stream!.coinCount || 0,
          likeCount: stream!.likeCount || 0,
          followCount: stream!.followCount || 0,
          shareCount: stream!.shareCount || 0
        });
      }).catch((err: any) => {
        console.error('Failed to connect to TikTok Live:', err);
        sendToClient(ws, 'error', { message: `Failed to connect: ${err.message}` });
        sendToClient(ws, 'connection-status', { status: 'disconnected', error: err.message });
      });

      // Listen for chat messages
      currentConnection.on(WebcastEvent.CHAT, async (data: any) => {
        const message = await storage.createChatMessage({
          streamId: stream!.id,
          username: data.user?.uniqueId || data.user?.nickname || 'Anonymous',
          message: data.comment || ''
        });

        // Update message count
        const updatedStream = await storage.updateLiveStream(stream!.id, {
          messageCount: (stream!.messageCount || 0) + 1
        });

        broadcast('new-chat', message);
        
        if (updatedStream) {
          broadcast('stream-stats', {
            viewerCount: updatedStream.viewerCount || 0,
            messageCount: updatedStream.messageCount || 0,
            giftCount: updatedStream.giftCount || 0,
            coinCount: updatedStream.coinCount || 0,
            likeCount: updatedStream.likeCount || 0,
            followCount: updatedStream.followCount || 0,
            shareCount: updatedStream.shareCount || 0
          });
        }
      });

      // Listen for gifts
      currentConnection.on(WebcastEvent.GIFT, async (data: any) => {
        const gift = await storage.createGift({
          streamId: stream!.id,
          username: data.user?.uniqueId || data.user?.nickname || 'Anonymous',
          giftName: data.gift?.name || 'Unknown Gift',
          giftId: data.giftId || 0,
          count: data.repeatCount || 1,
          coins: (data.diamondCount || 0) * (data.repeatCount || 1)
        });

        // Update gift and coin counts
        const updatedStream = await storage.updateLiveStream(stream!.id, {
          giftCount: (stream!.giftCount || 0) + 1,
          coinCount: (stream!.coinCount || 0) + gift.coins
        });

        broadcast('new-gift', gift);
        
        if (updatedStream) {
          broadcast('stream-stats', {
            viewerCount: updatedStream.viewerCount || 0,
            messageCount: updatedStream.messageCount || 0,
            giftCount: updatedStream.giftCount || 0,
            coinCount: updatedStream.coinCount || 0,
            likeCount: updatedStream.likeCount || 0,
            followCount: updatedStream.followCount || 0,
            shareCount: updatedStream.shareCount || 0
          });
        }
      });

      // Listen for room user updates (viewer count changes)
      currentConnection.on(WebcastEvent.ROOM_USER, async (data: any) => {
        if (data.viewerCount !== undefined) {
          const updatedStream = await storage.updateLiveStream(stream!.id, {
            viewerCount: data.viewerCount
          });

          if (updatedStream) {
            broadcast('stream-stats', {
              viewerCount: updatedStream.viewerCount || 0,
              messageCount: updatedStream.messageCount || 0,
              giftCount: updatedStream.giftCount || 0,
              coinCount: updatedStream.coinCount || 0,
              likeCount: updatedStream.likeCount || 0,
              followCount: updatedStream.followCount || 0,
              shareCount: updatedStream.shareCount || 0
            });
          }
        }
      });

      // Listen for likes
      currentConnection.on(WebcastEvent.LIKE, async (data: any) => {
        const like = await storage.createLike({
          streamId: stream!.id,
          username: data.user?.uniqueId || data.user?.nickname || 'Anonymous',
          likeCount: data.likeCount || 1,
          totalLikeCount: data.totalLikeCount || 0
        });

        // Update like count
        const updatedStream = await storage.updateLiveStream(stream!.id, {
          likeCount: (stream!.likeCount || 0) + like.likeCount
        });

        broadcast('new-like', like);
        
        if (updatedStream) {
          broadcast('stream-stats', {
            viewerCount: updatedStream.viewerCount || 0,
            messageCount: updatedStream.messageCount || 0,
            giftCount: updatedStream.giftCount || 0,
            coinCount: updatedStream.coinCount || 0,
            likeCount: updatedStream.likeCount || 0,
            followCount: updatedStream.followCount || 0,
            shareCount: updatedStream.shareCount || 0
          });
        }
      });

      // Listen for follows
      currentConnection.on(WebcastEvent.FOLLOW, async (data: any) => {
        const follow = await storage.createFollow({
          streamId: stream!.id,
          username: data.user?.uniqueId || data.user?.nickname || 'Anonymous'
        });

        // Update follow count
        const updatedStream = await storage.updateLiveStream(stream!.id, {
          followCount: (stream!.followCount || 0) + 1
        });

        broadcast('new-follow', follow);
        
        if (updatedStream) {
          broadcast('stream-stats', {
            viewerCount: updatedStream.viewerCount || 0,
            messageCount: updatedStream.messageCount || 0,
            giftCount: updatedStream.giftCount || 0,
            coinCount: updatedStream.coinCount || 0,
            likeCount: updatedStream.likeCount || 0,
            followCount: updatedStream.followCount || 0,
            shareCount: updatedStream.shareCount || 0
          });
        }
      });

      // Listen for shares
      currentConnection.on(WebcastEvent.SHARE, async (data: any) => {
        const share = await storage.createShare({
          streamId: stream!.id,
          username: data.user?.uniqueId || data.user?.nickname || 'Anonymous'
        });

        // Update share count
        const updatedStream = await storage.updateLiveStream(stream!.id, {
          shareCount: (stream!.shareCount || 0) + 1
        });

        broadcast('new-share', share);
        
        if (updatedStream) {
          broadcast('stream-stats', {
            viewerCount: updatedStream.viewerCount || 0,
            messageCount: updatedStream.messageCount || 0,
            giftCount: updatedStream.giftCount || 0,
            coinCount: updatedStream.coinCount || 0,
            likeCount: updatedStream.likeCount || 0,
            followCount: updatedStream.followCount || 0,
            shareCount: updatedStream.shareCount || 0
          });
        }
      });

      // Listen for new members joining
      currentConnection.on(WebcastEvent.MEMBER, async (data: any) => {
        const member = await storage.createMember({
          streamId: stream!.id,
          username: data.user?.uniqueId || data.user?.nickname || 'Anonymous'
        });

        broadcast('new-member', member);
      });

      // Listen for disconnect
      currentConnection.on('disconnect', async () => {
        console.log(`Disconnected from TikTok Live: ${username}`);
        
        // Update stream status
        await storage.updateLiveStream(stream!.id, { isActive: false });
        
        broadcast('connection-status', { status: 'disconnected' });
      });

    } catch (error: any) {
      console.error('TikTok connect error:', error);
      sendToClient(ws, 'error', { message: `Failed to connect: ${error.message}` });
      sendToClient(ws, 'connection-status', { status: 'disconnected', error: error.message });
    }
  }

  async function handleTikTokDisconnect(ws: ExtendedWebSocket) {
    if (currentConnection) {
      try {
        currentConnection.disconnect();
        currentConnection = null;
        
        if (currentStreamId) {
          await storage.updateLiveStream(currentStreamId, { isActive: false });
        }
        
        broadcast('connection-status', { status: 'disconnected' });
      } catch (error: any) {
        console.error('TikTok disconnect error:', error);
        sendToClient(ws, 'error', { message: `Disconnect error: ${error.message}` });
      }
    }
  }

  function sendToClient<K extends keyof SocketEvents>(ws: ExtendedWebSocket, type: K, data: SocketEvents[K]) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, data }));
    }
  }

  function broadcast<K extends keyof SocketEvents>(type: K, data: SocketEvents[K]) {
    const message = JSON.stringify({ type, data });
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // REST API endpoints
  app.get('/api/streams/:username/messages', async (req, res) => {
    try {
      const { username } = req.params;
      const stream = await storage.getLiveStreamByUsername(username);
      
      if (!stream) {
        return res.json([]);
      }
      
      const messages = await storage.getChatMessages(stream.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.get('/api/streams/:username/gifts', async (req, res) => {
    try {
      const { username } = req.params;
      const stream = await storage.getLiveStreamByUsername(username);
      
      if (!stream) {
        return res.json([]);
      }
      
      const gifts = await storage.getGifts(stream.id);
      res.json(gifts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch gifts' });
    }
  });

  app.get('/api/streams/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const stream = await storage.getLiveStreamByUsername(username);
      
      if (!stream) {
        return res.status(404).json({ error: 'Stream not found' });
      }
      
      res.json(stream);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stream' });
    }
  });

  return httpServer;
}
