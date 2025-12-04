import { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';

/**
 * Hook to get the store identifier from subdomain, URL path, or query parameter
 */
export const useStoreId = (): string | null => {
  const params = useParams();
  const location = useLocation();

  return useMemo(() => {
    // 1. Check URL path parameter (e.g., /:storeId/store)
    if (params.storeId) {
      return params.storeId;
    }

    // 2. Check query parameter (e.g., ?storeId=xxx)
    const queryParams = new URLSearchParams(location.search);
    const storeIdFromQuery = queryParams.get('storeId');
    if (storeIdFromQuery) {
      return storeIdFromQuery;
    }

    // 3. Check subdomain (e.g., mystore.llatria.com)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Check if it's a subdomain (not localhost or main domain)
      const parts = hostname.split('.');
      if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
        return parts[0]; // Return subdomain
      }
    }

    return null;
  }, [params.storeId, location.search]);
};



