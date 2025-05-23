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
          <Badge className="bg-emerald-500/20 border-emerald-400/30 text-emerald-300 font-medium px-3 py-1.5">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-slow mr-2"></div>
            Live Connected
          </Badge>
        );
      case 'connecting':
        return (
          <Badge className="bg-amber-500/20 border-amber-400/30 text-amber-300 font-medium px-3 py-1.5">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse-slow mr-2"></div>
            Connecting...
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-600/20 border-slate-500/30 text-slate-300 font-medium px-3 py-1.5">
            <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>
            Standby
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="bg-glass border-b border-gray-700/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-tiktok-red to-tiktok-cyan rounded-xl flex items-center justify-center shadow-glow-cyan">
                <Video className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">TikTok Live Monitor</h1>
                <p className="text-sm text-slate-400 font-medium">Professional real-time analytics dashboard</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-3">
              {getConnectionStatusBadge()}
              {connectedUsername && connectionStatus === 'connected' && (
                <div className="bg-surface-elevated px-3 py-1.5 rounded-lg border border-gray-600/30">
                  <span className="text-sm text-white font-medium">
                    @{connectedUsername}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Connection Form */}
        <ConnectionForm onConnectionChange={handleConnectionChange} />

        {/* Live Stats */}
        <LiveStats stats={stats} />

        {/* Chat and Gifts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LiveChat />
          <LiveGifts />
        </div>

        {/* Activity Feed */}
        <ActivityFeed />
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-700/30 bg-glass">
        <div className="container mx-auto px-6 text-center text-slate-400">
          <p className="text-sm font-medium">
            Built with Node.js, React, WebSocket & TikTok Live Connector
          </p>
          <p className="text-xs mt-2 opacity-80">
            Professional real-time monitoring for TikTok Live streams
          </p>
        </div>
      </footer>
    </div>
  );
}
