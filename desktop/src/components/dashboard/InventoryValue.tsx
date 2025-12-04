import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { InventoryItem } from '@/types/inventory';

interface InventoryValueProps {
  items: InventoryItem[];
}

export const InventoryValue: React.FC<InventoryValueProps> = ({ items }) => {
  const calculations = React.useMemo(() => {
    const activeItems = items.filter(item => item.status === 'active');
    
    const totalValue = activeItems.reduce((sum, item) => sum + item.price, 0);
    
    const valueByCategory = activeItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.price;
      return acc;
    }, {} as Record<string, number>);

    const valueByCondition = activeItems.reduce((acc, item) => {
      acc[item.condition] = (acc[item.condition] || 0) + item.price;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalValue,
      valueByCategory,
      valueByCondition,
    };
  }, [items]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Value</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Total Inventory Value</p>
          <p className="text-4xl font-bold">${calculations.totalValue.toLocaleString()}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Value by Category</h3>
          <div className="space-y-2">
            {Object.entries(calculations.valueByCategory).map(([category, value]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{category}</span>
                <span className="text-muted-foreground">${value.toLocaleString()}</span>
              </div>
            ))}
            {Object.keys(calculations.valueByCategory).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active items to calculate value
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Value by Condition</h3>
          <div className="space-y-2">
            {Object.entries(calculations.valueByCondition).map(([condition, value]) => (
              <div key={condition} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium capitalize">{condition.replace('_', ' ')}</span>
                <span className="text-muted-foreground">${value.toLocaleString()}</span>
              </div>
            ))}
            {Object.keys(calculations.valueByCondition).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active items to calculate value
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};



