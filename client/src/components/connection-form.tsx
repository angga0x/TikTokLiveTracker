import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useSocket } from '@/hooks/use-socket';
import { Plug, Play, Loader2 } from 'lucide-react';

interface ConnectionFormProps {
  onConnectionChange: (status: 'connecting' | 'connected' | 'disconnected', username?: string) => void;
}

export default function ConnectionForm({ onConnectionChange }: ConnectionFormProps) {
  const [username, setUsername] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const { emit, on } = useSocket();

  const handleConnect = () => {
    if (!username.trim()) {
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('connecting');
    onConnectionChange('connecting', username);
    
    emit('connect-tiktok', { username: username.trim() });
  };

  // Listen for connection status updates
  on('connection-status', (data) => {
    setConnectionStatus(data.status);
    setIsConnecting(data.status === 'connecting');
    onConnectionChange(data.status, data.username);
  });

  on('error', (data) => {
    setIsConnecting(false);
    setConnectionStatus('disconnected');
    onConnectionChange('disconnected');
  });

  const getButtonContent = () => {
    if (isConnecting) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Connecting...
        </>
      );
    }
    
    if (connectionStatus === 'connected') {
      return (
        <>
          <Play className="w-4 h-4 mr-2" />
          Connected
        </>
      );
    }
    
    return (
      <>
        <Play className="w-4 h-4 mr-2" />
        Connect
      </>
    );
  };

  const getButtonClass = () => {
    if (connectionStatus === 'connected') {
      return 'bg-green-600 hover:bg-green-700';
    }
    return 'bg-gradient-to-r from-pink-600 via-red-500 to-pink-600 hover:from-red-600 hover:to-pink-600';
  };

  return (
    <div className="mb-8">
      <Card className="bg-glass border-gray-600/30 shadow-professional">
        <CardContent className="p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center text-white">
            <Plug className="text-tiktok-cyan mr-3 w-6 h-6" />
            Connect to TikTok Live Stream
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter TikTok username (e.g., your_username)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
                disabled={isConnecting || connectionStatus === 'connected'}
                className="h-12 bg-surface-elevated border-gray-600/30 text-white placeholder-slate-400 focus:border-tiktok-cyan focus:ring-tiktok-cyan/30 font-medium"
              />
            </div>
            <Button
              onClick={handleConnect}
              disabled={!username.trim() || isConnecting || connectionStatus === 'connected'}
              className={`h-12 px-8 font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-glow-red focus:outline-none focus:ring-2 focus:ring-pink-500/50 ${getButtonClass()}`}
            >
              {getButtonContent()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
