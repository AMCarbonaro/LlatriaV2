import React from 'react';
import { Trash2, CheckCircle2, X, MoreVertical } from 'lucide-react';
import { Button } from '../common/Button';
import { Card, CardContent } from '../common/Card';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkMarkSold: () => void;
  onClearSelection: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onBulkDelete,
  onBulkMarkSold,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 shadow-lg">
      <CardContent className="p-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkMarkSold}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Mark as Sold
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};



