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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <Card key={item.label} className="bg-glass border-gray-600/30 shadow-professional hover:bg-surface-elevated/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-wide">{item.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {formatNumber(item.value)}
                  </p>
                </div>
                <div className="p-3 bg-surface-elevated/50 rounded-xl">
                  <IconComponent className={`${item.color} w-6 h-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
