import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import type { ChatMessage } from '@shared/schema';

export default function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { on } = useSocket();

  // Listen for new chat messages
  useEffect(() => {
    const cleanup = on('new-chat', (message) => {
      setMessages(prev => [...prev.slice(-49), message]); // Keep last 50 messages
    });

    return cleanup;
  }, [on]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getAvatarInitial = (username: string): string => {
    return username.charAt(0).toUpperCase();
  };

  const getAvatarColor = (username: string): string => {
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-red-500 to-orange-500',
      'from-yellow-500 to-orange-500',
      'from-indigo-500 to-purple-500',
      'from-pink-500 to-rose-500',
      'from-cyan-500 to-blue-500'
    ];
    
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatTime = (timestamp: Date | null): string => {
    if (!timestamp) return '';
    
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className="bg-chat-surface border-gray-700 overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
        <h3 className="text-lg font-semibold flex items-center text-white">
          <MessageCircle className="text-tiktok-cyan mr-2" />
          Live Chat
          <Badge variant="secondary" className="ml-auto bg-gray-700 text-gray-300">
            Real-time
          </Badge>
        </h3>
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          ref={scrollRef}
          className="h-96 overflow-y-auto p-4 space-y-3 custom-scrollbar scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Connect to a TikTok Live stream to see chat messages</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="animate-slide-in">
                <div className="flex items-start space-x-3 p-3 hover:bg-gray-800/50 rounded-lg transition-colors">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getAvatarColor(message.username)} rounded-full flex items-center justify-center text-sm font-semibold text-white`}>
                    {getAvatarInitial(message.username)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white truncate">
                        {message.username}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1 break-words">
                      {message.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
