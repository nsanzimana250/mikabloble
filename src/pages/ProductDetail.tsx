import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, Minus, Plus, Heart, ShoppingCart, Truck, ShieldCheck, RotateCcw, ZoomIn } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/supabase";
import ImageLightbox from "@/components/ImageLightbox";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  reviewCount: number;
  category: string;
  category_id?: string;
  brand: string;
  brand_id?: string;
  inStock: boolean;
  lowStock: boolean;
  image: string;
  images: string[];
  specs: Record<string, any>;
  compatibility: string[];
}

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { authReady, session } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "compatibility">("specs");
  
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Helper: Debug log Supabase session state
  const logSessionState = async (context: string) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const localSession = sessionData?.session;
      const sessionUser = localSession?.user;
      
      const authState = !localSession 
        ? 'unauthenticated' 
        : localSession.expires_at && localSession.expires_at * 1000 < Date.now() 
          ? 'expired' 
          : 'authenticated';
      
      console.log(`[ProductDetail] ${context} - Session State:`, {
        hasSession: !!localSession,
        userId: sessionUser?.id,
        userEmail: sessionUser?.email,
        authState,
        expiresAt: localSession?.expires_at ? new Date(localSession.expires_at * 1000).toISOString() : null,
        error: sessionError?.message
      });
      
      return { session: localSession, sessionUser, authState };
    } catch (err) {
      console.error('[ProductDetail] Session check error:', err);
      return { session: null, sessionUser: null, authState: 'error' };
    }
  };

  useEffect(() => {
    if (!authReady) {
      console.log('[ProductDetail] Waiting for auth...');
      return;
    }

    console.log('[ProductDetail] Auth ready, current user:', session?.user?.id);

    const fetchData = async () => {
      try {
        // Debug: Log session before fetching
        const { session: localSession } = await logSessionState('Before fetch');
        console.log('[ProductDetail] Current user:', localSession?.user);
        
        setLoading(true);
        setError(null);
        
        if (!id) {
          setError("Product ID not found");
          return;
        }
        
        // Fetch product details
        const { data: productData, error: productError } = await supabase
          .from('mika_products')
          .select(`
            *,
            mika_categories!left (id, name),
            mika_brands!left (id, name)
          `)
          .eq('id', id)
          .single();
        
        if (productError) {
          console.error('[ProductDetail] Fetch error:', {
            code: productError.code,
            message: productError.message,
            details: productError.details,
            hint: productError.hint
          });
          setError("Product not found");
          setProduct(null);
          return;
        }
        
        if (!productData) {
          setError("Product not found");
          setProduct(null);
          return;
        }
        
        // Transform product data
        const transformedProduct: Product = {
          id: productData.id,
          name: productData.name,
          description: productData.description || '',
          price: parseFloat(productData.price),
          originalPrice: productData.original_price ? parseFloat(productData.original_price) : undefined,
          reviewCount: productData.review_count || 0,
          category: productData.mika_categories?.name || 'Uncategorized',
          category_id: productData.category_id,
          brand: productData.mika_brands?.name || 'Unbranded',
          brand_id: productData.brand_id,
          inStock: productData.in_stock ?? true,
          lowStock: productData.low_stock ?? false,
          image: productData.image || '',
          images: productData.images || [],
          specs: productData.specs || {},
          compatibility: productData.compatibility || []
        };
        
        setProduct(transformedProduct);
        setMainImage(transformedProduct.image || transformedProduct.images?.[0] || '');
        
        // Fetch related products if category exists
        if (productData.category_id) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('mika_products')
            .select(`
              *,
              mika_categories!left (id, name),
              mika_brands!left (id, name)
            `)
            .eq('category_id', productData.category_id)
            .neq('id', id)
            .limit(4);
          
          if (relatedError) {
            console.error('Error fetching related products:', relatedError);
            setRelated([]);
          } else if (relatedData && relatedData.length > 0) {
            const transformedRelated = relatedData.map(p => ({
              id: p.id,
              name: p.name,
              description: p.description || '',
              price: parseFloat(p.price),
              originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
              reviewCount: p.review_count || 0,
              category: p.mika_categories?.name || 'Uncategorized',
              category_id: p.category_id,
              brand: p.mika_brands?.name || 'Unbranded',
              brand_id: p.brand_id,
              inStock: p.in_stock ?? true,
              lowStock: p.low_stock ?? false,
              image: p.image || '',
              images: p.images || [],
              specs: p.specs || {},
              compatibility: p.compatibility || []
            }));
            
            setRelated(transformedRelated);
          } else {
            setRelated([]);
          }
        } else {
          setRelated([]);
        }
        
      } catch (error) {
        console.error('Error fetching product:', error);
        setError("Failed to load product. Please try again.");
        setProduct(null);
        setRelated([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.inStock) {
      addToCart(product, quantity);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <h1 className="section-title text-2xl mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <Link to="/products" className="btn-primary inline-block">Back to Products</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container py-8 overflow-x-hidden">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link to="/products" className="hover:text-secondary transition-colors">Products</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-secondary transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl overflow-hidden shadow-[var(--card-shadow)] w-full"
          >
            <button
              type="button"
              onClick={() => {
                const gallery = product.images && product.images.length > 0 ? product.images : [mainImage];
                const idx = Math.max(0, gallery.indexOf(mainImage));
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
              className="group relative w-full bg-white flex items-center justify-center cursor-zoom-in"
              style={{ aspectRatio: '1/1' }}
              aria-label="Open image gallery to zoom"
            >
              <img
                src={mainImage || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                }}
              />
              <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 text-white text-xs font-medium px-2.5 py-1.5 rounded-full opacity-90 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-3.5 w-3.5" />
                Tap to zoom
              </span>
            </button>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 p-2">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} - view ${index + 1}`}
                    className={`w-full aspect-square object-contain bg-white p-1 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${mainImage === img ? 'ring-2 ring-secondary' : ''}`}
                    onClick={() => setMainImage(img)}
                    onDoubleClick={() => {
                      setLightboxIndex(index);
                      setLightboxOpen(true);
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {lightboxOpen && (
            <ImageLightbox
              images={product.images && product.images.length > 0 ? product.images : [mainImage]}
              startIndex={lightboxIndex}
              alt={product.name}
              onClose={() => setLightboxOpen(false)}
            />
          )}

          {/* Product Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="min-w-0">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{product.brand}</span>
            <h1 className="font-display font-bold text-xl md:text-2xl text-foreground mt-2 break-words">{product.name}</h1>

            <div className="flex items-baseline gap-3 mt-4 flex-wrap">
              <span className="text-xl md:text-2xl font-bold text-foreground">RWF {product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-sm md:text-base text-muted-foreground line-through">RWF {product.originalPrice.toLocaleString()}</span>
                  <span className="bg-secondary/10 text-secondary text-xs font-semibold px-2 py-0.5 rounded">
                    Save RWF {(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            <p className="text-muted-foreground mt-3 leading-relaxed text-xs md:text-sm">{product.description}</p>

            {/* Delivery & Stock Info */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg">
                <Truck className="h-5 w-5 shrink-0" />
                <span className="text-sm font-bold">FREE DELIVERY — Nationwide</span>
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
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="p-2 hover:bg-muted transition-colors"
                  disabled={!product.inStock}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-3 font-semibold text-foreground text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="p-2 hover:bg-muted transition-colors"
                  disabled={!product.inStock}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 text-xs md:text-sm"
              >
                <ShoppingCart className="h-3 w-3" />
                Add to Cart
              </button>

              <button 
                className="p-2 border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                aria-label="Add to wishlist"
              >
                <Heart className="h-4 w-4" />
              </button>

              <a
                href={`https://wa.me/250793903992?text=${encodeURIComponent(`🛒 *ORDER REQUEST* 🛒\n\n*Product Details:*\n━━━━━━━━━━━━━━━━━━━━\n📦 *Product:* ${product.name}\n💰 *Price:* RWF ${product.price.toLocaleString()}\n📊 *Category:* ${product.category}\n🔄 *Quantity:* ${quantity}\n💵 *Total:* RWF ${(product.price * quantity).toLocaleString()}\n📦 *Stock Status:* ${product.inStock ? 'Available ✅' : 'Out of Stock ❌'}\n\n*Customer Request:*\nI would like to order ${quantity} unit${quantity > 1 ? 's' : ''} of this product.\n\n*Product Link:*\n${window.location.origin}/products/${product.id}\n\n*Product Information:*\n${product.description || 'N/A'}\n━━━━━━━━━━━━━━━━━━━━\n\n📍 *Please confirm:*\n• Product availability\n• Total price including delivery\n• Estimated delivery time\n\nThank you! 🙏`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe57] transition-colors text-white flex items-center gap-2 shadow-md font-semibold"
                title="Order on WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-sm hidden sm:inline">Order on WhatsApp</span>
              </a>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-1 md:gap-2 mt-4">
              {[
                { icon: Truck, text: "Free Delivery" },
                { icon: ShieldCheck, text: "Genuine Parts" },
                { icon: RotateCcw, text: "30-Day Returns" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 p-1 md:p-2 bg-muted rounded-lg">
                  <Icon className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                  <span className="text-[8px] md:text-[10px] font-medium text-foreground text-center">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex gap-1 border-b border-border">
            {(["specs", "compatibility"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab ? "border-secondary text-secondary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "specs" ? "Specifications" : "Compatibility"}
              </button>
            ))}
          </div>

          <div className="py-4">
            {activeTab === "specs" && (
              <div className="bg-card rounded-xl overflow-hidden">
                {product.specs && Object.keys(product.specs).length > 0 ? (
                  <table className="w-full">
                    <tbody>
                      {Object.entries(product.specs).map(([key, value], i) => (
                        <tr key={key} className={i % 2 === 0 ? "bg-muted/50" : ""}>
                          <td className="px-3 py-2 text-xs font-medium text-foreground w-1/3 capitalize">
                            {key.replace(/_/g, ' ')}
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {String(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No specifications available for this product.</p>
                )}
              </div>
            )}
            
            {activeTab === "compatibility" && (
              <div className="space-y-1">
                {product.compatibility && product.compatibility.length > 0 ? (
                  product.compatibility.map((car) => (
                    <div key={car} className="flex items-center gap-2 p-2 bg-card rounded-lg">
                      <span className="text-xs text-foreground">✓ {car}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No compatibility information available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="section-title mb-4 text-lg md:text-xl">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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