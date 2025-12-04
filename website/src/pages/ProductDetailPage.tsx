import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { InventoryItem } from '@/types/inventory';
import { productService } from '@/services/productService';
import { useStoreId } from '@/hooks/useStoreId';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const storeId = useStoreId();

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await productService.getProduct(id, storeId || undefined);
          setProduct(data);
        } catch (error) {
          console.error('Failed to load product:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadProduct();
  }, [id, storeId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Link to="/" className="text-primary hover:underline">
            Return to product listing
          </Link>
        </div>
      </div>
    );
  }

  const hasFacebook = product.platforms.includes('facebook') && product.facebookListingId;
  const hasEbay = product.platforms.includes('ebay') && product.ebayListingId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="text-primary hover:underline mb-6 inline-block">
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
            <img
              src={product.images[selectedImage] || 'https://via.placeholder.com/600'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
            <span className="px-3 py-1 bg-muted rounded-full text-sm capitalize">
              {product.condition.replace('_', ' ')}
            </span>
            <span className="px-3 py-1 bg-muted rounded-full text-sm">{product.category}</span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* AI Data Specifications */}
          {product.aiData?.specifications && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Specifications</h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(product.aiData.specifications).map(([key, value]) => (
                  <div key={key} className="border-b border-border pb-2">
                    <span className="text-sm text-muted-foreground">{key}:</span>
                    <span className="ml-2 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buy Buttons */}
          <div className="space-y-3">
            {hasFacebook && (
              <a
                href={`https://www.facebook.com/marketplace/item/${product.facebookListingId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Buy on Facebook Marketplace
              </a>
            )}
            {hasEbay && (
              <a
                href={`https://www.ebay.com/itm/${product.ebayListingId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Buy on eBay
              </a>
            )}
            {!hasFacebook && !hasEbay && (
              <div className="text-center py-3 px-6 bg-muted rounded-lg text-muted-foreground">
                This item is not currently available for purchase on external platforms.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

