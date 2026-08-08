import { ShoppingCart, Eye, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { memo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchProduct } from "@/lib/product-data";
import { productKeys } from "@/hooks/use-product-data";
import { getOptimizedImageUrl } from "@/lib/images";
import type { Product } from "@/types/product";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Fallback image in case the product image fails to load
  const fallbackImage = "/placeholder.svg";

  // Use a default placeholder if no image is provided
  const productImage = product.image || fallbackImage;
  const image320 = getOptimizedImageUrl(productImage, 320);
  const image640 = getOptimizedImageUrl(productImage, 640);

  const prefetchProduct = () => {
    void queryClient.prefetchQuery({
      queryKey: productKeys.detail(product.id),
      queryFn: () => fetchProduct(product.id),
      staleTime: 10 * 60_000,
    });
  };

  const handleAddToCart = () => {
    if (product.inStock) {
      addToCart(product);
    }
  };

  return (
    <div
      className="product-card group relative flex flex-col h-full bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
      onMouseEnter={prefetchProduct}
    >
      {/* Image Container - 80% of card, fully visible product */}
      <Link to={`/products/${product.id}`} className="relative block w-full bg-white overflow-hidden" style={{ aspectRatio: '1/1' }} aria-label={`View ${product.name}`}>
        <img
          src={imageError ? fallbackImage : image320}
          srcSet={imageError ? undefined : `${image320} 320w, ${image640} 640w`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          alt={product.name}
          width={640}
          height={640}
          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-md z-10">
            -{discount}%
          </span>
        )}
        
        {/* Low Stock Badge */}
        {product.inStock && product.lowStock && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
            Low Stock
          </span>
        )}
        
        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm">
              Out of Stock
            </span>
          </div>
        )}
        
        {/* Quick View Button on Hover */}
        {product.inStock && (
          <span
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4 text-gray-700" />
          </span>
        )}
      </Link>

      {/* Product Info - 20% area, compact */}
      <div className="p-2 sm:p-3 flex items-center justify-between gap-2 flex-grow">
        <div className="flex flex-col min-w-0 flex-1">
          <Link to={`/products/${product.id}`} className="hover:no-underline">
            <h3 className="font-semibold text-xs sm:text-sm text-foreground hover:text-secondary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <span className="text-sm sm:text-base font-bold text-foreground mt-0.5">
            RWF {product.price.toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="p-1.5 sm:p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
};

export default memo(ProductCard);
