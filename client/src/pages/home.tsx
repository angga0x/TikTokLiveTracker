import { useState } from 'react';
import ConnectionForm from '@/components/connection-form';
import LiveStats from '@/components/live-stats';
import LiveChat from '@/components/live-chat';
import LiveGifts from '@/components/live-gifts';
import ActivityFeed from '@/components/activity-feed';
import { Badge } from '@/components/ui/badge';
import { Video } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [connectedUsername, setConnectedUsername] = useState<string>('');
  const [stats, setStats] = useState({
    viewerCount: 0,
    messageCount: 0,
    giftCount: 0,
    coinCount: 0
  });

  const { on } = useSocket();

  const handleConnectionChange = (status: 'connecting' | 'connected' | 'disconnected', username?: string) => {
    setConnectionStatus(status);
    if (username) {
      setConnectedUsername(username);
    }
  };

  // Listen for stats updates
  on('stream-stats', (data) => {
    setStats(data);
  });

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-green-900/50 border-green-700 text-green-300">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow mr-2"></div>
            Connected
          </Badge>
        );
      case 'connecting':
        return (
          <Badge className="bg-yellow-900/50 border-yellow-700 text-yellow-300">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse-slow mr-2"></div>
            Connecting
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-700 text-gray-300">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tiktok-dark via-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-tiktok-red to-tiktok-cyan rounded-lg flex items-center justify-center">
                <Video className="text-white text-lg w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TikTok Live Monitor</h1>
                <p className="text-sm text-gray-400">Real-time chat & gifts tracker</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {getConnectionStatusBadge()}
              {connectedUsername && connectionStatus === 'connected' && (
                <span className="text-sm text-gray-300">
                  @{connectedUsername}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Connection Form */}
        <ConnectionForm onConnectionChange={handleConnectionChange} />

        {/* Live Stats */}
        <LiveStats stats={stats} />

        {/* Chat and Gifts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveChat />
          <LiveGifts />
        </div>

        {/* Activity Feed */}
        <ActivityFeed />
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-800 bg-black/30">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm">
            Built with Node.js, React, Socket.IO & TikTok Live Connector
          </p>
          <p className="text-xs mt-1">
            Real-time monitoring for TikTok Live streams
          </p>
        </div>
      </footer>
    </div>
  );
}
