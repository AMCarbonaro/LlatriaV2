import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, ShoppingCart, Globe } from 'lucide-react';

export const PlatformBadges: React.FC = () => {
  const platforms = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { name: 'eBay', icon: ShoppingCart, color: 'bg-orange-500' },
    { name: 'Website', icon: Globe, color: 'bg-green-600' },
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {platforms.map((platform, index) => {
        const Icon = platform.icon;
        return (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.1, y: -5 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-all"
          >
            <div className={`${platform.color} p-2 rounded-lg text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-medium">{platform.name}</span>
          </motion.div>
        );
      })}
    </div>
  );
};









