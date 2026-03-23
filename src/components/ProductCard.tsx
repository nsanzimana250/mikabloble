import { ShoppingCart, Eye, Truck } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Fallback image in case the product image fails to load
  const fallbackImage = "/images/placeholder.jpg"; // Update this path to your actual placeholder image

  return (
    <div
      className="product-card group relative flex flex-col h-full bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Container - Fixed aspect ratio with full width */}
      <div className="relative w-full bg-muted overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src={imageError ? fallbackImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={() => setImageError(true)}
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-md z-10">
            -{discount}%
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
        {hovered && product.inStock && (
          <Link
            to={`/products/${product.id}`}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4 text-gray-700" />
          </Link>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/products/${product.id}`} className="hover:no-underline">
          <h3 className="font-semibold text-sm text-foreground hover:text-secondary transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Free Delivery Badge */}
        <div className="flex items-center gap-1 mt-2 text-green-600">
          <Truck className="h-3 w-3 flex-shrink-0" />
          <span className="text-xs font-medium">Free Delivery</span>
        </div>

        {/* Price and Add to Cart Button */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">
              RWF {product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                RWF {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;