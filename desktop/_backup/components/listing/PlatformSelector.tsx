import React from 'react';
import { Platform } from '@/types/inventory';
import { Card, CardContent } from '../common/Card';
import { clsx } from 'clsx';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onPlatformsChange: (platforms: Platform[]) => void;
}

const platformInfo: Record<Platform, { name: string; icon: string; description: string; detail: string }> = {
  facebook: {
    name: 'Facebook Marketplace',
    icon: '📘',
    description: 'Local pickup only',
    detail: 'Best for local buyers who want to see items in person',
  },
  ebay: {
    name: 'eBay',
    icon: '🛒',
    description: 'Ship anywhere',
    detail: 'Reaches buyers nationwide with shipping options',
  },
  website: {
    name: 'Your Store',
    icon: '🌐',
    description: 'yourshop.llatria.com',
    detail: 'Links to FB & eBay listings for purchase',
  },
};

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformsChange,
}) => {
  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      onPlatformsChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      onPlatformsChange([...selectedPlatforms, platform]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium mb-3">Select Platforms</h3>
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(platformInfo) as Platform[]).map((platform) => {
          const info = platformInfo[platform];
          const isSelected = selectedPlatforms.includes(platform);
          
          return (
            <Card
              key={platform}
              className={clsx(
                'cursor-pointer transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-primary'
              )}
              onClick={() => togglePlatform(platform)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{info.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{info.name}</div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePlatform(platform)}
                        className="h-5 w-5 rounded border-input"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="text-sm text-primary font-medium">{info.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">{info.detail}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};


