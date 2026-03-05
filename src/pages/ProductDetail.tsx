import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { ChevronRight, Minus, Plus, Heart, ShoppingCart, Truck, ShieldCheck, RotateCcw, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "compatibility">("specs");

  if (!product) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <h1 className="section-title">Product Not Found</h1>
          <Link to="/products" className="btn-primary inline-block mt-6">Back to Products</Link>
        </div>
      </Layout>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <Layout>
      <div className="section-container py-8 overflow-x-hidden">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link to="/products" className="hover:text-secondary transition-colors">Products</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl overflow-hidden shadow-[var(--card-shadow)] w-full"
          >
            <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="min-w-0">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{product.brand}</span>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mt-2 break-words">{product.name}</h1>

            <div className="flex items-baseline gap-3 mt-5 flex-wrap">
              <span className="text-2xl md:text-3xl font-bold text-foreground">RWF {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-base md:text-lg text-muted-foreground line-through">RWF {product.originalPrice.toLocaleString()}</span>
              )}
              {product.originalPrice && (
                <span className="bg-secondary/10 text-secondary text-sm font-semibold px-2 py-0.5 rounded">
                  Save RWF {(product.originalPrice - product.price).toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-muted-foreground mt-4 leading-relaxed text-sm md:text-base">{product.description}</p>

            {/* Free Delivery + Stock */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <Truck className="h-4 w-4 shrink-0" />
                <span className="text-sm font-semibold">🚚 FREE DELIVERY — Nationwide</span>
              </div>
              {product.inStock ? (
                product.lowStock ? (
                  <span className="text-sm font-medium text-secondary">⚠ Low Stock - Order Soon</span>
                ) : (
                  <span className="text-sm font-medium text-green-600">✓ In Stock</span>
                )
              ) : (
                <span className="text-sm font-medium text-destructive">✗ Out of Stock</span>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-muted transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 font-semibold text-foreground">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-muted transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                disabled={!product.inStock}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 text-sm md:text-base"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>

              <button className="p-3 border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive">
                <Heart className="h-5 w-5" />
              </button>

              <a
                href={`https://wa.me/250788123456?text=${encodeURIComponent(`Hi! I'd like to order: ${product.name} (Qty: ${quantity}) - RWF ${(product.price * quantity).toLocaleString()}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-green-500 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-green-600 flex items-center gap-2"
                title="Order on WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline">WhatsApp</span>
              </a>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 mt-8">
              {[
                { icon: Truck, text: "Free Delivery" },
                { icon: ShieldCheck, text: "Genuine Parts" },
                { icon: RotateCcw, text: "30-Day Returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 p-2 md:p-3 bg-muted rounded-lg">
                  <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  <span className="text-[10px] md:text-xs font-medium text-foreground text-center">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-border">
            {(["specs", "compatibility"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab ? "border-secondary text-secondary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "specs" ? "Specifications" : "Compatibility"}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === "specs" && product.specs && (
              <div className="bg-card rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value], i) => (
                      <tr key={key} className={i % 2 === 0 ? "bg-muted/50" : ""}>
                        <td className="px-4 md:px-5 py-3 text-sm font-medium text-foreground w-1/3">{key}</td>
                        <td className="px-4 md:px-5 py-3 text-sm text-muted-foreground">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "compatibility" && product.compatibility && (
              <div className="space-y-2">
                {product.compatibility.map((car) => (
                  <div key={car} className="flex items-center gap-2 p-3 bg-card rounded-lg">
                    <span className="text-sm text-foreground">✓ {car}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="section-title mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
