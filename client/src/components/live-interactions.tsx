import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, UserPlus, Share2, Users } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import type { Like, Follow, Share, Member } from '@shared/schema';

interface InteractionItem {
  id: string;
  type: 'like' | 'follow' | 'share' | 'join';
  username: string;
  timestamp: Date;
  count?: number;
}

export default function LiveInteractions() {
  const [interactions, setInteractions] = useState<InteractionItem[]>([]);
  const { on } = useSocket();

  // Listen for new interactions
  useEffect(() => {
    const cleanupLike = on('new-like', (like: Like) => {
      const interaction: InteractionItem = {
        id: `like-${like.id}`,
        type: 'like',
        username: like.username,
        timestamp: like.timestamp || new Date(),
        count: like.likeCount
      };
      
      setInteractions(prev => [...prev.slice(-19), interaction]); // Keep last 20 interactions
    });

    const cleanupFollow = on('new-follow', (follow: Follow) => {
      const interaction: InteractionItem = {
        id: `follow-${follow.id}`,
        type: 'follow',
        username: follow.username,
        timestamp: follow.timestamp || new Date()
      };
      
      setInteractions(prev => [...prev.slice(-19), interaction]);
    });

    const cleanupShare = on('new-share', (share: Share) => {
      const interaction: InteractionItem = {
        id: `share-${share.id}`,
        type: 'share',
        username: share.username,
        timestamp: share.timestamp || new Date()
      };
      
      setInteractions(prev => [...prev.slice(-19), interaction]);
    });

    const cleanupMember = on('new-member', (member: Member) => {
      const interaction: InteractionItem = {
        id: `member-${member.id}`,
        type: 'join',
        username: member.username,
        timestamp: member.timestamp || new Date()
      };
      
      setInteractions(prev => [...prev.slice(-19), interaction]);
    });

    return () => {
      cleanupLike();
      cleanupFollow();
      cleanupShare();
      cleanupMember();
    };
  }, [on]);

  const formatTime = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-purple-400" />;
      case 'share':
        return <Share2 className="w-4 h-4 text-blue-400" />;
      case 'join':
        return <Users className="w-4 h-4 text-green-400" />;
      default:
        return null;
    }
  };

  const getInteractionText = (interaction: InteractionItem): string => {
    switch (interaction.type) {
      case 'like':
        return `sent ${interaction.count} like${interaction.count! > 1 ? 's' : ''}`;
      case 'follow':
        return 'followed the stream';
      case 'share':
        return 'shared the stream';
      case 'join':
        return 'joined the stream';
      default:
        return '';
    }
  };

  const getInteractionColor = (type: string): string => {
    switch (type) {
      case 'like':
        return 'bg-red-400/20 border-red-400/30';
      case 'follow':
        return 'bg-purple-400/20 border-purple-400/30';
      case 'share':
        return 'bg-blue-400/20 border-blue-400/30';
      case 'join':
        return 'bg-green-400/20 border-green-400/30';
      default:
        return 'bg-gray-400/20 border-gray-400/30';
    }
  };

  return (
    <Card className="bg-glass border-gray-600/30 overflow-hidden shadow-professional">
      <CardHeader className="px-6 py-5 border-b border-gray-600/30 bg-surface-elevated/30">
        <h3 className="text-xl font-bold flex items-center text-white">
          <Heart className="text-tiktok-red mr-3 w-6 h-6" />
          Live Interactions
          <Badge className="ml-auto bg-tiktok-red/20 border-tiktok-red/30 text-tiktok-red font-medium">
            Real-time
          </Badge>
        </h3>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          {interactions.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No interactions yet</p>
              <p className="text-xs opacity-75">Likes, follows, shares and joins will appear here</p>
            </div>
          ) : (
            interactions.slice().reverse().map((interaction) => (
              <div 
                key={interaction.id} 
                className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 hover:bg-surface-elevated/20 ${getInteractionColor(interaction.type)}`}
              >
                <div className="flex-shrink-0">
                  {getInteractionIcon(interaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate">
                      {interaction.username}
                    </span>
                    <span className="text-xs text-slate-400 flex-shrink-0 font-medium">
                      {formatTime(interaction.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mt-1">
                    {getInteractionText(interaction)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}