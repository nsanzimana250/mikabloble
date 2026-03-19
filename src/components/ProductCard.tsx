import { ShoppingCart, Eye, Truck } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="product-card group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
        {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-md">
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <span className="bg-card text-foreground px-4 py-2 rounded-lg font-semibold text-sm">Out of Stock</span>
          </div>
        )}
        {hovered && product.inStock && (
          <Link
            to={`/products/${product.id}`}
            className="absolute top-3 right-3 p-2 bg-card rounded-full shadow-lg hover:bg-secondary hover:text-secondary-foreground transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
        )}
      </div>

        {/* Info */}
      <div className="p-3">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm text-card-foreground hover:text-secondary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Free Delivery Badge */}
        <div className="flex items-center gap-1 mt-2 text-green-600">
          <Truck className="h-3 w-3" />
          <span className="text-xs font-medium">Free Delivery</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-card-foreground">RWF {product.price.toLocaleString()}</span>
          </div>
          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
