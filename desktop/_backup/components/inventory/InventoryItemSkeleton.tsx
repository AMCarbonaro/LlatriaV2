import React from 'react';
import { Skeleton } from '../common/Skeleton';
import { Card, CardContent } from '../common/Card';

export const InventoryItemSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="w-20 h-20 rounded-lg" variant="rectangular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" variant="text" />
            <Skeleton className="h-4 w-1/2" variant="text" />
            <Skeleton className="h-4 w-1/3" variant="text" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};






