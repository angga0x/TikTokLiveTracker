import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import type { Gift as GiftType } from '@shared/schema';

export default function LiveGifts() {
  const [gifts, setGifts] = useState<GiftType[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { on } = useSocket();

  // Listen for new gifts
  useEffect(() => {
    const cleanup = on('new-gift', (gift) => {
      setGifts(prev => [...prev.slice(-49), gift]); // Keep last 50 gifts
    });

    return cleanup;
  }, [on]);

  // Auto-scroll to bottom when new gifts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gifts]);

  const getGiftEmoji = (giftName: string): string => {
    const giftEmojis: Record<string, string> = {
      'Rose': '🌹',
      'Diamond': '💎',
      'Star': '⭐',
      'Heart': '❤️',
      'Like': '👍',
      'Crown': '👑',
      'Fire': '🔥',
      'Money': '💰',
      'Gift': '🎁',
      'Flower': '🌸',
      'Rocket': '🚀',
      'Rainbow': '🌈',
      'Balloon': '🎈',
      'Party': '🎉',
      'Trophy': '🏆'
    };

    return giftEmojis[giftName] || '🎁';
  };

  const getGiftTheme = (giftName: string): { bg: string; border: string; text: string; accent: string } => {
    const themes: Record<string, { bg: string; border: string; text: string; accent: string }> = {
      'Rose': {
        bg: 'from-pink-900/20 to-rose-900/20',
        border: 'border-pink-600/30',
        text: 'text-pink-400',
        accent: 'bg-pink-900/30 text-pink-300'
      },
      'Diamond': {
        bg: 'from-purple-900/20 to-indigo-900/20',
        border: 'border-purple-600/30',
        text: 'text-purple-400',
        accent: 'bg-purple-900/30 text-purple-300'
      },
      'Star': {
        bg: 'from-yellow-900/20 to-orange-900/20',
        border: 'border-yellow-600/30',
        text: 'text-yellow-400',
        accent: 'bg-yellow-900/30 text-yellow-300'
      },
      'Crown': {
        bg: 'from-amber-900/20 to-yellow-900/20',
        border: 'border-amber-600/30',
        text: 'text-amber-400',
        accent: 'bg-amber-900/30 text-amber-300'
      }
    };

    return themes[giftName] || {
      bg: 'from-blue-900/20 to-cyan-900/20',
      border: 'border-blue-600/30',
      text: 'text-blue-400',
      accent: 'bg-blue-900/30 text-blue-300'
    };
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
    <Card className="bg-glass border-gray-600/30 overflow-hidden shadow-professional">
      <CardHeader className="px-6 py-5 border-b border-gray-600/30 bg-surface-elevated/30">
        <h3 className="text-xl font-bold flex items-center text-white">
          <Gift className="text-yellow-400 mr-3 w-6 h-6" />
          Live Gifts
          <Badge className="ml-auto bg-yellow-400/20 border-yellow-400/30 text-yellow-300 font-medium">
            Real-time
          </Badge>
        </h3>
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          ref={scrollRef}
          className="h-96 overflow-y-auto p-6 space-y-4 custom-scrollbar scroll-smooth"
        >
          {gifts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No gifts yet</p>
                <p className="text-sm">Connect to a TikTok Live stream to see gifts</p>
              </div>
            </div>
          ) : (
            gifts.map((gift) => {
              const theme = getGiftTheme(gift.giftName);
              return (
                <div key={gift.id} className="animate-gift-pop">
                  <div className={`flex items-center space-x-4 p-5 bg-gradient-to-r ${theme.bg} border ${theme.border} rounded-xl shadow-lg`}>
                    <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                      {getGiftEmoji(gift.giftName)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate">
                          {gift.username}
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0 font-medium">
                          {formatTime(gift.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`font-bold ${theme.text}`}>
                          {gift.giftName}
                        </span>
                        <span className="text-slate-300 font-medium">×</span>
                        <span className="text-white font-bold text-lg">
                          {gift.count}
                        </span>
                        {gift.coins > 0 && (
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${theme.accent}`}>
                            {gift.coins} coins
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
