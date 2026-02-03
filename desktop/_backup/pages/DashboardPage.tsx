import React, { useState } from 'react';
import { Package, DollarSign, CheckCircle2, TrendingUp, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useInventoryStore } from '@/store/inventoryStore';
import { InventoryValue } from '@/components/dashboard/InventoryValue';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { PlatformChart } from '@/components/dashboard/PlatformChart';

export const DashboardPage: React.FC = () => {
  const { items } = useInventoryStore();
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('30days');

  const stats = React.useMemo(() => {
    const totalItems = items.length;
    const activeItems = items.filter(item => item.status === 'active').length;
    const soldItems = items.filter(item => item.status === 'sold').length;
    const totalValue = items
      .filter(item => item.status === 'active')
      .reduce((sum, item) => sum + item.price, 0);
    
    const itemsByCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const itemsByStatus = {
      active: activeItems,
      sold: soldItems,
      draft: items.filter(item => item.status === 'unposted').length,
    };

    return {
      totalItems,
      activeItems,
      soldItems,
      totalValue,
      itemsByCategory,
      itemsByStatus,
    };
  }, [items]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-6 flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'inventory' }));
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your inventory</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === '7days' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7days')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30days' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30days')}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('all')}
          >
            All Time
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Items</p>
                    <p className="text-3xl font-bold">{stats.totalItems}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-3">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                    <p className="text-3xl font-bold">${stats.totalValue.toLocaleString()}</p>
                  </div>
                  <div className="rounded-full bg-green-500/10 p-3">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Items Sold</p>
                    <p className="text-3xl font-bold">{stats.soldItems}</p>
                  </div>
                  <div className="rounded-full bg-blue-500/10 p-3">
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Listings</p>
                    <p className="text-3xl font-bold">{stats.activeItems}</p>
                  </div>
                  <div className="rounded-full bg-purple-500/10 p-3">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart items={items} timeRange={timeRange} />
            <CategoryChart items={items} />
          </div>

          <PlatformChart items={items} />

          {/* Inventory Value Calculator */}
          <InventoryValue items={items} />

          {/* Items by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Items by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{stats.itemsByStatus.active}</p>
                  <p className="text-sm text-muted-foreground mt-1">Active</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{stats.itemsByStatus.sold}</p>
                  <p className="text-sm text-muted-foreground mt-1">Sold</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{stats.itemsByStatus.draft}</p>
                  <p className="text-sm text-muted-foreground mt-1">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Items by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.itemsByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">{count} items</span>
                  </div>
                ))}
                {Object.keys(stats.itemsByCategory).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items categorized yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

