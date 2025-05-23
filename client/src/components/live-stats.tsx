import { Card, CardContent } from '@/components/ui/card';
import { Eye, MessageCircle, Gift, Coins } from 'lucide-react';

interface LiveStatsProps {
  stats: {
    viewerCount: number;
    messageCount: number;
    giftCount: number;
    coinCount: number;
  };
}

export default function LiveStats({ stats }: LiveStatsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const statItems = [
    {
      label: 'Viewers',
      value: stats.viewerCount,
      icon: Eye,
      color: 'text-tiktok-cyan'
    },
    {
      label: 'Messages',
      value: stats.messageCount,
      icon: MessageCircle,
      color: 'text-green-400'
    },
    {
      label: 'Gifts',
      value: stats.giftCount,
      icon: Gift,
      color: 'text-yellow-400'
    },
    {
      label: 'Coins',
      value: stats.coinCount,
      icon: Coins,
      color: 'text-yellow-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <Card key={item.label} className="bg-chat-surface border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{item.label}</p>
                  <p className="text-xl font-bold text-white">
                    {formatNumber(item.value)}
                  </p>
                </div>
                <IconComponent className={`${item.color} text-xl w-6 h-6`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
