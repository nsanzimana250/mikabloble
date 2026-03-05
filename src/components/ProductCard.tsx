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
      <div className="relative overflow-hidden aspect-square bg-muted">
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
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.brand} · {product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-card-foreground hover:text-secondary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>

        {/* Free Delivery Badge */}
        <div className="flex items-center gap-1 mt-2 text-green-600">
          <Truck className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Free Delivery</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-card-foreground">RWF {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">RWF {product.originalPrice.toLocaleString()}</span>
            )}
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
