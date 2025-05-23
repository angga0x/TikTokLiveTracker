import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import type { ChatMessage, Gift } from '@shared/schema';

interface ActivityItem {
  id: string;
  type: 'chat' | 'gift' | 'join';
  username: string;
  timestamp: Date;
  content?: string;
  giftName?: string;
  giftCount?: number;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { on } = useSocket();

  // Listen for new activities
  useEffect(() => {
    const cleanupChat = on('new-chat', (message: ChatMessage) => {
      const activity: ActivityItem = {
        id: `chat-${message.id}`,
        type: 'chat',
        username: message.username,
        timestamp: message.timestamp || new Date(),
        content: message.message
      };
      
      setActivities(prev => [...prev.slice(-9), activity]); // Keep last 10 activities
    });

    const cleanupGift = on('new-gift', (gift: Gift) => {
      const activity: ActivityItem = {
        id: `gift-${gift.id}`,
        type: 'gift',
        username: gift.username,
        timestamp: gift.timestamp || new Date(),
        giftName: gift.giftName,
        giftCount: gift.count
      };
      
      setActivities(prev => [...prev.slice(-9), activity]); // Keep last 10 activities
    });

    return () => {
      cleanupChat();
      cleanupGift();
    };
  }, [on]);

  const formatTime = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'gift':
        return 'bg-yellow-400';
      case 'chat':
        return 'bg-blue-400';
      case 'join':
        return 'bg-green-400';
      default:
        return 'bg-gray-400';
    }
  };

  const renderActivityContent = (activity: ActivityItem): React.ReactNode => {
    switch (activity.type) {
      case 'gift':
        return (
          <span className="text-gray-300">
            <span className="text-white font-medium">{activity.username}</span>{' '}
            sent <span className="text-yellow-400">{activity.giftName}</span>{' '}
            × <span className="text-white">{activity.giftCount}</span>
          </span>
        );
      case 'chat':
        return (
          <span className="text-gray-300">
            <span className="text-white font-medium">{activity.username}</span>{' '}
            sent a message
          </span>
        );
      case 'join':
        return (
          <span className="text-gray-300">
            <span className="text-white font-medium">{activity.username}</span>{' '}
            joined the chat
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-8">
      <Card className="bg-glass border-gray-600/30 overflow-hidden shadow-professional">
        <CardHeader className="px-6 py-5 border-b border-gray-600/30 bg-surface-elevated/30">
          <h3 className="text-xl font-bold flex items-center text-white">
            <TrendingUp className="text-tiktok-cyan mr-3 w-6 h-6" />
            Recent Activity
          </h3>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4 max-h-40 overflow-y-auto custom-scrollbar">
            {activities.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Activity will appear here when connected</p>
              </div>
            ) : (
              activities.slice().reverse().map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 text-sm p-3 hover:bg-surface-elevated/20 rounded-lg transition-colors duration-200">
                  <div className={`w-3 h-3 ${getActivityColor(activity.type)} rounded-full flex-shrink-0 shadow-sm`}></div>
                  <div className="flex-1 min-w-0">
                    {renderActivityContent(activity)}
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0 font-medium">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
