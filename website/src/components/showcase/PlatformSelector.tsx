import React from 'react';
import { Card, CardContent } from './Card';
import { clsx } from 'clsx';

type Platform = 'facebook' | 'ebay' | 'website';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onPlatformsChange: (platforms: Platform[]) => void;
}

const platformInfo: Record<Platform, { name: string; icon: string; description: string }> = {
  facebook: {
    name: 'Facebook Marketplace',
    icon: '📘',
    description: 'Reach local buyers',
  },
  ebay: {
    name: 'eBay',
    icon: '🛒',
    description: 'Ship nationwide',
  },
  website: {
    name: 'Your Website',
    icon: '🌐',
    description: 'Your store subdomain',
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
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{info.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{info.name}</div>
                    <div className="text-xs text-muted-foreground">{info.description}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePlatform(platform)}
                    className="h-4 w-4 rounded border-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};









