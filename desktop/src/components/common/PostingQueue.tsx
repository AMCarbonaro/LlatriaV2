import React from 'react';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { clsx } from 'clsx';

interface PostingQueueProps {
  className?: string;
}

export const PostingQueue: React.FC<PostingQueueProps> = ({ className }) => {
  const { items } = useInventoryStore();
  
  // Count items by posting status
  const postingStats = React.useMemo(() => {
    let posting = 0;
    let pending = 0;
    let failed = 0;
    
    items.forEach(item => {
      if (item.status === 'sold') return;
      
      const statuses = item.postingStatus || {};
      if (statuses.facebook === 'posting' || statuses.ebay === 'posting' || statuses.website === 'posting') {
        posting++;
      }
      if (statuses.facebook === 'error' || statuses.ebay === 'error' || statuses.website === 'error') {
        failed++;
      }
      // Count unposted items with platforms selected
      if (item.status === 'unposted' && item.platforms.length > 0) {
        const hasIdlePlatform = item.platforms.some(p => statuses[p] === 'idle' || !statuses[p]);
        if (hasIdlePlatform) pending++;
      }
    });
    
    return { posting, pending, failed };
  }, [items]);
  
  const hasActivity = postingStats.posting > 0 || postingStats.pending > 0 || postingStats.failed > 0;
  
  if (!hasActivity) return null;
  
  return (
    <div className={clsx(
      "flex items-center gap-4 px-4 py-2 bg-card border-t border-border text-sm",
      className
    )}>
      {postingStats.posting > 0 && (
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{postingStats.posting} posting</span>
        </div>
      )}
      
      {postingStats.pending > 0 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{postingStats.pending} ready to post</span>
        </div>
      )}
      
      {postingStats.failed > 0 && (
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-4 w-4" />
          <span>{postingStats.failed} failed</span>
        </div>
      )}
    </div>
  );
};
