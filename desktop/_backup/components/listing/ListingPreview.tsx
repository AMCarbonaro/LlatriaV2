import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { ListingFormData } from '@/types/listing';
import { Platform } from '@/types/inventory';

interface ListingPreviewProps {
  listing: ListingFormData;
}

const platformInfo: Record<Platform, { name: string; icon: string; color: string }> = {
  facebook: { name: 'Facebook Marketplace', icon: '📘', color: 'bg-blue-500' },
  ebay: { name: 'eBay', icon: '🛒', color: 'bg-blue-600' },
  website: { name: 'Your Website', icon: '🌐', color: 'bg-gray-600' },
};

export const ListingPreview: React.FC<ListingPreviewProps> = ({ listing }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Preview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {listing.platforms.map((platform) => {
          const info = platformInfo[platform];
          return (
            <Card key={platform}>
              <CardHeader className={`${info.color} text-white`}>
                <CardTitle className="text-white flex items-center gap-2">
                  <span>{info.icon}</span>
                  {info.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {listing.images[0] && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-lg mb-1">{listing.title}</h4>
                    <p className="text-2xl font-bold text-primary mb-2">
                      ${listing.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {listing.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-muted rounded">
                        {listing.condition.replace('_', ' ')}
                      </span>
                      <span className="text-muted-foreground">{listing.category}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {listing.platforms.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Select at least one platform to see preview
        </div>
      )}
    </div>
  );
};


