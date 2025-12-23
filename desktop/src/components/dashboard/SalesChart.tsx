import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { InventoryItem } from '@/types/inventory';

interface SalesChartProps {
  items: InventoryItem[];
  timeRange: '7days' | '30days' | 'all';
}

export const SalesChart: React.FC<SalesChartProps> = ({ items, timeRange }) => {
  const soldItems = items.filter(item => item.status === 'sold');

  const getData = () => {
    const now = new Date();
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 365;
    const data: Array<{ date: string; sold: number; value: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayItems = soldItems.filter(item => {
        const itemDate = new Date(item.updatedAt);
        return (
          itemDate.getDate() === date.getDate() &&
          itemDate.getMonth() === date.getMonth() &&
          itemDate.getFullYear() === date.getFullYear()
        );
      });

      data.push({
        date: dateStr,
        sold: dayItems.length,
        value: dayItems.reduce((sum, item) => sum + item.price, 0),
      });
    }

    return data;
  };

  const data = getData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sold"
              stroke="#3b82f6"
              name="Items Sold"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              name="Revenue ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};






