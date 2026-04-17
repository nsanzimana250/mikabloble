import { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  review_count?: number;
  category?: string;
  category_id?: string;
  brand?: string;
  brand_id?: string;
  in_stock?: boolean;
  low_stock?: boolean;
  image?: string;
  images?: string[];
  specs?: Record<string, any>;
  compatibility?: string[];
  created_at?: string;
}

interface ProductListProps {
  onProductClick?: (product: Product) => void;
}

const ProductList = ({ onProductClick }: ProductListProps) => {
  const { authReady } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch until auth is ready
    if (!authReady) {
      setLoading(true);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("[ProductList] Starting fetch...");

        // Get session to verify auth state
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[ProductList] Session error:", sessionError.message);
        }
        
        const userId = sessionData?.session?.user?.id;
        console.log("[ProductList] User:", userId || "not authenticated");

        // The exact query requested
        const { data: productsData, error: productsError } = await supabase
          .from("mika_products")
          .select("*");

        if (productsError) {
          console.error("[ProductList] Query error:", {
            code: productsError.code,
            message: productsError.message,
            details: productsError.details,
            hint: productsError.hint,
          });
          throw new Error(productsError.message);
        }

        console.log("[ProductList] Raw data:", productsData);

        if (!productsData || productsData.length === 0) {
          console.warn("[ProductList] No products found - empty table or RLS issue");
          setProducts([]);
          return;
        }

        // Transform data to match interface
        const transformed: Product[] = productsData.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          price: parseFloat(p.price),
          original_price: p.original_price ? parseFloat(p.original_price) : undefined,
          review_count: p.review_count || 0,
          category: p.category || "",
          category_id: p.category_id || undefined,
          brand: p.brand || "",
          brand_id: p.brand_id || undefined,
          in_stock: p.in_stock ?? true,
          low_stock: p.low_stock ?? false,
          image: p.image || "",
          images: p.images || [],
          specs: p.specs || {},
          compatibility: p.compatibility || [],
          created_at: p.created_at,
        }));

        console.log("[ProductList] Transformed:", transformed.length, "products");
        setProducts(transformed);

      } catch (err) {
        // Detailed error logging
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("[ProductList] Catch error:", {
          message: errorMessage,
          error: err,
        });
        
        setError(errorMessage);
        setProducts([]);
      } finally {
        setLoading(false);
        console.log("[ProductList] Loading complete");
      }
    };

    fetchProducts();
  }, [authReady]);

  // Loading state
  if (loading || !authReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {!authReady ? "Checking auth..." : "Loading products..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No products found.</p>
        <p className="text-sm text-muted-foreground mt-2">
          This may be due to RLS policies or empty table.
        </p>
      </div>
    );
  }

  // Product grid
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onProductClick?.(product)}
          className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-cover rounded mb-2"
            />
          )}
          <h3 className="font-semibold truncate">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <p className="font-bold mt-2">
            RWF {product.price.toLocaleString()}
          </p>
          {!product.in_stock && (
            <span className="text-xs text-red-500">Out of stock</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductList;