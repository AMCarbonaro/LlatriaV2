import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './Card';
import { clsx } from 'clsx';

export const InventoryItemShowcase: React.FC = () => {
  const mockItem = {
    id: '1',
    title: 'Vintage Rolex Watch',
    description: 'Classic timepiece in excellent condition, perfect for collectors.',
    price: 2499.99,
    condition: 'like_new',
    category: 'Jewelry',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
    platforms: ['facebook', 'ebay', 'website'],
    status: 'available' as const,
  };

  const platformIcons: Record<string, string> = {
    facebook: '📘',
    ebay: '🛒',
    website: '🌐',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm mx-auto"
    >
      <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={mockItem.images[0]}
            alt={mockItem.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-600 text-white flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              POSTED
            </span>
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            {mockItem.platforms.map((platform) => (
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
          <h3 className="font-semibold text-lg truncate mb-1">{mockItem.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {mockItem.description}
          </p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold">${mockItem.price.toFixed(2)}</span>
            <span
              className={clsx(
                'px-2 py-1 rounded-full text-xs font-medium',
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              )}
            >
              {mockItem.condition.replace('_', ' ')}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};



