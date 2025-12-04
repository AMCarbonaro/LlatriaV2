import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { InventoryItem } from '@/types/inventory';

interface PlatformChartProps {
  items: InventoryItem[];
}

export const PlatformChart: React.FC<PlatformChartProps> = ({ items }) => {
  const platformData = React.useMemo(() => {
    const platformCounts = {
      facebook: 0,
      ebay: 0,
      website: 0,
    };

    items.forEach(item => {
      item.platforms.forEach(platform => {
        if (platform in platformCounts) {
          platformCounts[platform as keyof typeof platformCounts]++;
        }
      });
    });

    return [
      { platform: 'Facebook', count: platformCounts.facebook },
      { platform: 'eBay', count: platformCounts.ebay },
      { platform: 'Website', count: platformCounts.website },
    ];
  }, [items]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Items by Platform</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={platformData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="platform" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Listings" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};



