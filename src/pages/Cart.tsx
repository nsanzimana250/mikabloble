import Layout from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Cart = () => {
  const { t } = useTranslation();
  const { items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();

  const shipping = 0; // Free delivery
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="section-title">{t("cart.empty")}</h1>
          <p className="section-subtitle mt-2">{t("cart.emptyDesc")}</p>
          <Link to="/products" className="btn-primary inline-block mt-6">{t("cart.browseProducts")}</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container py-8">
        <h1 className="section-title mb-8">{t("cart.title")} ({totalItems} {t("cart.items")})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card rounded-xl p-4 shadow-[var(--card-shadow)] flex gap-4"
              >
                <img src={item.product.image} alt={item.product.name} className="w-24 h-24 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.id}`} className="font-semibold text-card-foreground hover:text-secondary transition-colors">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-1">{item.product.brand}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:bg-muted transition-colors" aria-label="-">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:bg-muted transition-colors" aria-label="+">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-bold text-card-foreground">RWF {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors self-start p-1" aria-label={t("common.delete")}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-card rounded-xl p-6 shadow-[var(--card-shadow)] h-fit sticky top-24">
            <h2 className="font-display font-semibold text-lg text-card-foreground mb-4">{t("cart.orderSummary")}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("common.subtotal")}</span>
                <span className="text-card-foreground font-medium">RWF {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("common.shipping")}</span>
                <span className="text-green-600 font-medium">{t("common.free")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.taxLabel")}</span>
                <span className="text-card-foreground font-medium">RWF {tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-card-foreground">{t("common.total")}</span>
                <span className="font-bold text-lg text-card-foreground">RWF {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full mt-6 text-center block">
              {t("cart.proceedCheckout")}
            </Link>
            <Link to="/products" className="block text-center text-sm text-muted-foreground hover:text-secondary mt-3 transition-colors">
              {t("cart.continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
