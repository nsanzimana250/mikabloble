import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { supabase } from "@/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to transform database product to Product interface
const mapProduct = (p: Record<string, unknown>): Product => {
  return {
    id: p.id as string,
    name: p.name as string,
    description: (p.description as string) || '',
    price: parseFloat(p.price as string | number),
    originalPrice: p.original_price ? parseFloat(p.original_price as string | number) : undefined,
    reviewCount: p.review_count ? Number(p.review_count) : 0,
    category: (p.category as string) || '',
    category_id: p.category_id as string | undefined,
    brand: (p.brand as string) || '',
    brand_id: p.brand_id as string | undefined,
    inStock: (p.in_stock as boolean | null | undefined) ?? true,
    lowStock: (p.low_stock as boolean | null | undefined) ?? false,
    image: (p.image as string) || '',
    images: (p.images as string[]) || [],
    specs: (p.specs as Record<string, unknown>) || {},
    compatibility: (p.compatibility as string[]) || []
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // Fetch cart from database for logged-in user
  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mika_cart')
        .select('*, product:mika_products(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const cartItems: CartItem[] = data.map((item: { product: Record<string, unknown>; quantity: number }) => ({
          product: mapProduct(item.product),
          quantity: item.quantity
        }));
        setItems(cartItems);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      toast.error('Failed to load cart');
    }
  }, [user]);

  // Load cart when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    // Guest users: only local state
    if (!user) {
      setItems(prev => {
        const existing = prev.find(i => i.product.id === product.id);
        if (existing) {
          return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
        }
        return [...prev, { product, quantity }];
      });
      toast.success(`${product.name} added to cart`);
      return;
    }

    // Logged-in users: optimistic UI update
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product, quantity }];
    });

    try {
      // Determine new quantity (including any optimistic addition)
      const existingItem = items.find(i => i.product.id === product.id);
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      // Remove any existing entries for this product and insert new quantity
      await supabase.from('mika_cart').delete().eq('user_id', user.id).eq('product_id', product.id);
      const { error } = await supabase.from('mika_cart').insert({
        user_id: user.id,
        product_id: product.id,
        quantity: newQuantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      if (error) throw error;

      toast.success(`${product.name} added to cart`);
      // Refresh to ensure consistency
      await fetchCart();
    } catch (err) {
      console.error('Failed to add to cart:', err);
      toast.error('Failed to add to cart');
      await fetchCart();
    }
  }, [user, items, fetchCart]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!user) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
      toast.info('Item removed from cart');
      return;
    }

    try {
      await supabase.from('mika_cart').delete().eq('user_id', user.id).eq('product_id', productId);
      toast.info('Item removed from cart');
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      toast.error('Failed to remove item');
    }
  }, [user, fetchCart]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    if (!user) {
      setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
      return;
    }

    try {
      // Replace with new quantity
      await supabase.from('mika_cart').delete().eq('user_id', user.id).eq('product_id', productId);
      const { error } = await supabase.from('mika_cart').insert({
        user_id: user.id,
        product_id: productId,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      toast.error('Failed to update quantity');
    }
  }, [user, fetchCart]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      const { error } = await supabase.from('mika_cart').delete().eq('user_id', user.id);
      if (error) console.error('Failed to clear cart:', error);
    }
  }, [user]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
