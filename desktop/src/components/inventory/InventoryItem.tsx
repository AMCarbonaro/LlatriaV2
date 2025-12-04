import React, { memo } from 'react';
import { Edit, Trash2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { InventoryItem as InventoryItemType, Platform } from '@/types/inventory';
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { clsx } from 'clsx';

interface InventoryItemProps {
  item: InventoryItemType;
  onEdit: (item: InventoryItemType) => void;
  onDelete: (id: string) => void;
  onMarkSold: (id: string) => void;
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

const platformIcons: Record<Platform, string> = {
  facebook: '📘',
  ebay: '🛒',
  website: '🌐',
};

export const InventoryItem: React.FC<InventoryItemProps> = memo(({
  item,
  onEdit,
  onDelete,
  onMarkSold,
  viewMode,
  isSelected = false,
  onSelect,
}) => {
  const isSold = item.status === 'sold';

  // Determine overall posting status
  const getOverallPostingStatus = (): 'idle' | 'posting' | 'posted' | null => {
    if (!item.postingStatus || item.platforms.length === 0) return null;
    
    const statuses = item.platforms
      .map(platform => item.postingStatus?.[platform])
      .filter(Boolean) as ('posting' | 'posted' | 'idle' | 'error')[];
    
    if (statuses.length === 0) return null;
    
    // If any platform is posting, show "posting"
    if (statuses.some(s => s === 'posting')) return 'posting';
    
    // If all platforms are posted, show "posted"
    if (statuses.every(s => s === 'posted')) return 'posted';
    
    return null;
  };

  const overallStatus = getOverallPostingStatus();

  if (viewMode === 'list') {
    return (
      <Card className={clsx('hover:shadow-md transition-shadow', isSelected && 'ring-2 ring-primary')}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(item.id, e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
            )}
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0 relative">
              {item.images[0] ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
              {!isSold && overallStatus && (
                <div className="absolute bottom-1 right-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    overallStatus === 'posted' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-yellow-500 text-white flex items-center gap-1'
                  }`}>
                    {overallStatus === 'posted' ? 'POSTED' : (
                      <>
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        POSTING
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      item.condition === 'new' || item.condition === 'like_new'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : item.condition === 'used'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    )}>
                      {item.condition.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    // Only show icons for platforms that have been posted
                    const postedPlatforms = item.platforms.filter(platform => 
                      item.postingStatus?.[platform] === 'posted'
                    );
                    
                    return postedPlatforms.length > 0 ? (
                      <div className="flex gap-1">
                        {postedPlatforms.map((platform) => (
                          <span key={platform} className="text-lg" title={platform}>
                            {platformIcons[platform]}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      disabled={isSold}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!isSold && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkSold(item.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={clsx('hover:shadow-md transition-shadow overflow-hidden', isSelected && 'ring-2 ring-primary')}>
      {onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(item.id, e.target.checked)}
            className="w-4 h-4 rounded border-border bg-background"
          />
        </div>
      )}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {item.images[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        {isSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded font-semibold">
              SOLD
            </span>
          </div>
        )}
        {!isSold && overallStatus && (
          <div className="absolute bottom-2 right-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              overallStatus === 'posted' 
                ? 'bg-green-600 text-white' 
                : 'bg-yellow-500 text-white flex items-center gap-1'
            }`}>
              {overallStatus === 'posted' ? 'POSTED' : (
                <>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  POSTING
                </>
              )}
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {item.platforms
            .filter(platform => item.postingStatus?.[platform] === 'posted')
            .map((platform) => (
              <span
                key={platform}
                className="bg-black/70 text-white px-2 py-1 rounded text-xs"
                title={platform}
              >
                {platformIcons[platform]}
              </span>
            ))}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate mb-1">{item.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold">${item.price.toFixed(2)}</span>
          <span className={clsx(
            'px-2 py-1 rounded-full text-xs font-medium',
            item.condition === 'new' || item.condition === 'like_new'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : item.condition === 'used'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
          )}>
            {item.condition.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(item)}
            disabled={isSold}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          {!isSold && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkSold(item.id)}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});


