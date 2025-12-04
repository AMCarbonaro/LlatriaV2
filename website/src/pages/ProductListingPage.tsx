import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InventoryItem } from '@/types/inventory';
import { productService } from '@/services/productService';
import { useStoreId } from '@/hooks/useStoreId';

export const ProductListingPage: React.FC = () => {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const storeId = useStoreId();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts({ storeId: storeId || undefined });
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [storeId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">All Products</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No products available at this time.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} storeId={storeId} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductListItem key={product.id} product={product} storeId={storeId} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCard: React.FC<{ product: InventoryItem; storeId?: string | null }> = ({ product, storeId }) => {
  const productPath = storeId ? `/${storeId}/product/${product.id}` : `/product/${product.id}`;
  return (
    <Link
      to={productPath}
      className="block bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square bg-muted overflow-hidden">
        <img
          src={product.images[0] || 'https://via.placeholder.com/400'}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground capitalize">{product.condition.replace('_', ' ')}</span>
        </div>
      </div>
    </Link>
  );
};

const ProductListItem: React.FC<{ product: InventoryItem; storeId?: string | null }> = ({ product, storeId }) => {
  const productPath = storeId ? `/${storeId}/product/${product.id}` : `/product/${product.id}`;
  return (
    <Link
      to={productPath}
      className="flex gap-4 bg-background border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
    >
      <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={product.images[0] || 'https://via.placeholder.com/400'}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-xl mb-2">{product.title}</h3>
        <p className="text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground capitalize">{product.condition.replace('_', ' ')}</span>
        </div>
      </div>
    </Link>
  );
};

