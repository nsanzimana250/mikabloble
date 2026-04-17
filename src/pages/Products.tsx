import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { Search, SlidersHorizontal, Grid3X3, List, ChevronRight, X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/supabase";

interface Category {
  id: string;
  name: string;
  count?: number;
}

interface Brand {
  id: string;
  name: string;
}

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

const Products = () => {
  const { authReady, session } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformProduct = (product: any): Product => ({
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: parseFloat(product.price),
    originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
    reviewCount: product.review_count || 0,
    category: product.mika_categories?.name || 'Uncategorized',
    category_id: product.category_id,
    brand: product.mika_brands?.name || 'Unbranded',
    brand_id: product.brand_id,
    inStock: product.in_stock ?? true,
    lowStock: product.low_stock ?? false,
    image: product.image || '',
    images: product.images || [],
    specs: product.specs || {},
    compatibility: product.compatibility || []
  });

  // Helper: Debug log Supabase session state
  const logSessionState = async (context: string) => {
    try {
      const { data: { session: localSession }, error: sessionError } = await supabase.auth.getSession();
      
      const authState = !localSession 
        ? 'unauthenticated' 
        : localSession.expires_at && localSession.expires_at * 1000 < Date.now() 
          ? 'expired' 
          : 'authenticated';
      
      console.log(`[Products] ${context} - Session State:`, {
        hasSession: !!localSession,
        userId: localSession?.user?.id,
        userEmail: localSession?.user?.email,
        authState,
        expiresAt: localSession?.expires_at ? new Date(localSession.expires_at * 1000).toISOString() : null,
        error: sessionError?.message
      });
      
      return { session: localSession, authState };
    } catch (err) {
      console.error('[Products] Session check error:', err);
      return { session: null, authState: 'error' };
    }
  };

  // Check auth state and wait for it to be ready (from context)
  useEffect(() => {
    if (!authReady) {
      console.log('[Products] Waiting for auth to be ready...');
      return;
    }
    
    console.log('[Products] Auth ready, current session:', session?.user?.id || 'none');
  }, [authReady, session]);

  // Listen for auth state changes and refetch when user logs in/out
  // Note: Auth state is now managed by AuthContext, this is just for data refetching
  useEffect(() => {
    if (!authReady) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[Products] Auth state changed:', {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id
      });

      // Reload data when auth state changes
      loadData();
    });

    return () => subscription.unsubscribe();
  }, [authReady]);

  // Data loading function
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { session } = await logSessionState('Before fetch');
      console.log('[Products] Current user:', session?.user || 'none');

      const { data: productsData, error: productsError } = await supabase
        .from('mika_products')
        .select(`
          *,
          mika_categories!left (id, name),
          mika_brands!left (id, name)
        `)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('[Products] Products fetch error:', {
          code: productsError.code,
          message: productsError.message,
          details: productsError.details,
          hint: productsError.hint
        });
        setError(`Failed to load products: ${productsError.message}`);
        return;
      }

      console.log('[Products] Raw products data:', productsData?.length || 0, 'products');

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('mika_categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Categories error:', categoriesError);
      }

      const { data: brandsData, error: brandsError } = await supabase
        .from('mika_brands')
        .select('*')
        .order('name');

      if (brandsError) {
        console.error('Brands error:', brandsError);
      }

      if (productsData && productsData.length > 0) {
        const transformedProducts = productsData.map(transformProduct);
        console.log('[Products] Transformed products:', transformedProducts.length);
        setProducts(transformedProducts);
      } else {
        console.warn('[Products] No products returned - possible RLS issue');
        setProducts([]);
      }

      if (categoriesData && categoriesData.length > 0) {
        const productCounts: Record<string, number> = {};
        (productsData || []).forEach(product => {
          if (product.category_id) {
            productCounts[product.category_id] = (productCounts[product.category_id] || 0) + 1;
          }
        });

        const categoriesWithCount = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          image: cat.image,
          count: productCounts[cat.id] || 0
        }));
        setCategories(categoriesWithCount);
      } else {
        setCategories([]);
      }

      setBrands(brandsData || []);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when auth is ready
  useEffect(() => {
    if (!authReady) return;
    loadData();
  }, [authReady, loadData]);

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  
  const toggleBrand = (brand: string) =>
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);

  const filtered = useMemo(() => {
    let result = [...products];
    
    if (search) {
      result = result.filter((p) => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (selectedCategories.length) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }
    
    if (selectedBrands.length) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }
    
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }
    
    return result;
  }, [search, selectedCategories, selectedBrands, sortBy, products]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedBrands([]);
  };

  const activeFilterCount = selectedCategories.length + selectedBrands.length + (search ? 1 : 0);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">Categories</label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories available</p>
          ) : (
            categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer hover:text-secondary transition-colors">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.name)}
                  onChange={() => toggleCategory(cat.name)}
                  className="rounded border-border accent-secondary"
                  disabled={cat.count === 0}
                />
                {cat.name} <span className="text-muted-foreground ml-auto">({cat.count || 0})</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">Brands</label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands.length === 0 ? (
            <p className="text-sm text-muted-foreground">No brands available</p>
          ) : (
            brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer hover:text-secondary transition-colors">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.name)}
                  onChange={() => toggleBrand(brand.name)}
                  className="rounded border-border accent-secondary"
                />
                {brand.name}
              </label>
            ))
          )}
        </div>
      </div>

      <button 
        onClick={resetFilters} 
        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );

  if (error) {
    return (
      <Layout>
        <div className="section-container py-8">
          <div className="text-center py-20">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Products</span>
          {selectedCategories.length === 1 && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{selectedCategories[0]}</span>
            </>
          )}
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-card rounded-xl p-5 shadow-[var(--card-shadow)] sticky top-24">
              <h3 className="font-display font-semibold text-lg mb-4">Filters</h3>
              <FilterSidebar />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border text-sm"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-secondary text-secondary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <span className="text-sm text-muted-foreground">{filtered.length} products</span>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <div className="hidden sm:flex bg-card border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map((cat) => (
                  <span key={cat} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {cat}
                    <button onClick={() => toggleCategory(cat)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
                {selectedBrands.map((brand) => (
                  <span key={brand} className="flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full">
                    {brand}
                    <button onClick={() => toggleBrand(brand)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
                {search && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    Search: {search}
                    <button onClick={() => setSearch("")}><X className="h-3 w-3" /></button>
                  </span>
                )}
              </div>
            )}

            {(!authReady || loading) ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    {!authReady ? 'Checking auth...' : 'Loading products...'}
                  </p>
                </div>
              </div>
            ) : filtered.length > 0 ? (
              <div className={`grid gap-4 sm:gap-6 ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg mb-4">No products found matching your criteria.</p>
                <button onClick={resetFilters} className="btn-primary">Reset Filters</button>
              </div>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-foreground/50" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-card p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;