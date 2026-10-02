import { ShoppingCart, Eye } from "lucide-react";
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
      className="product-card group relative flex h-full flex-col"
      onMouseEnter={prefetchProduct}
    >
      {/* Image Container - 80% of card, fully visible product */}
      <Link to={`/products/${product.id}`} className="relative block aspect-square w-full overflow-hidden bg-white" aria-label={`View ${product.name}`}>
        <img
          src={imageError ? fallbackImage : image320}
          srcSet={imageError ? undefined : `${image320} 320w, ${image640} 640w`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          alt={product.name}
          width={640}
          height={640}
          className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
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
      <div className="flex flex-grow items-end justify-between gap-2 border-t border-slate-100 p-3 sm:p-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="mb-1 truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">{product.brand}</span>
          <Link to={`/products/${product.id}`} className="hover:no-underline">
            <h3 className="line-clamp-2 min-h-9 text-xs font-semibold leading-[1.35] text-foreground transition-colors hover:text-primary sm:text-sm">
              {product.name}
            </h3>
          </Link>
          <div className="mt-2 flex flex-wrap items-baseline gap-2"><span className="text-sm font-extrabold text-[#e98400] sm:text-base">RWF {product.price.toLocaleString()}</span>{product.originalPrice && product.originalPrice > product.price && <span className="text-[10px] text-slate-400 line-through">RWF {product.originalPrice.toLocaleString()}</span>}</div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="flex-shrink-0 bg-secondary p-2 text-secondary-foreground transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2.5"
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
};

export default memo(ProductCard);
