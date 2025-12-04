import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to extract subdomain from request
 * Adds req.storeIdentifier if subdomain is detected
 */
export function extractSubdomain(req: Request, res: Response, next: NextFunction) {
  const hostname = req.get('host') || req.hostname || '';
  
  // Remove port if present (e.g., "mystore.llatria.com:5174" -> "mystore.llatria.com")
  const hostWithoutPort = hostname.split(':')[0];
  const parts = hostWithoutPort.split('.');
  
  // Check if it's a subdomain
  // Examples:
  // - "mystore.llatria.com" -> ["mystore", "llatria", "com"] (length 3, subdomain = "mystore")
  // - "llatria.com" -> ["llatria", "com"] (length 2, no subdomain)
  // - "localhost" -> ["localhost"] (length 1, no subdomain)
  // - "www.llatria.com" -> ["www", "llatria", "com"] (length 3, but "www" is special)
  
  if (parts.length >= 3) {
    const firstPart = parts[0];
    
    // Skip "www" as it's not a store subdomain
    if (firstPart !== 'www' && firstPart !== 'localhost') {
      // Store the subdomain as store identifier
      (req as any).storeIdentifier = firstPart;
    }
  }
  
  // Also check for localhost subdomain patterns (for development)
  // e.g., "mystore.localhost" or "mystore.llatria.local"
  if (parts.length === 2 && parts[1] === 'localhost') {
    (req as any).storeIdentifier = parts[0];
  }
  
  next();
}



