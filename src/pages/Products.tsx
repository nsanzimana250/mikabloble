import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal, Grid3X3, List, ChevronRight, X } from "lucide-react";
import { motion } from "framer-motion";
import { SEOHelmet } from "@/seo";
import { pageSEO } from "@/seo";
import { useBrands, useCategories, useProductPage } from "@/hooks/use-product-data";
import { PRODUCT_PAGE_SIZE } from "@/lib/product-data";

const Products = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialBrand = searchParams.get("brand") || "";

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [sortBy, setSortBy] = useState<"popularity" | "price-asc" | "price-desc">("popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const categoriesQuery = useCategories();
  const brandsQuery = useBrands();
  const categories = useMemo(() => categoriesQuery.data || [], [categoriesQuery.data]);
  const brands = useMemo(() => brandsQuery.data || [], [brandsQuery.data]);
  const categoryIds = useMemo(() => categories.filter((item) => selectedCategories.includes(item.name)).map((item) => item.id), [categories, selectedCategories]);
  const brandIds = useMemo(() => brands.filter((item) => selectedBrands.includes(item.name)).map((item) => item.id), [brands, selectedBrands]);

  useEffect(() => {
    const querySearch = searchParams.get("search") || "";
    const queryCategory = searchParams.get("category") || "";
    const queryBrand = searchParams.get("brand") || "";
    setSearch(querySearch);
    setSelectedCategories(queryCategory ? [queryCategory] : []);
    setSelectedBrands(queryBrand ? [queryBrand] : []);
  }, [searchParams]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, selectedCategories, selectedBrands, sortBy]);

  const filtersReady = (!selectedCategories.length || categoriesQuery.isSuccess) && (!selectedBrands.length || brandsQuery.isSuccess);
  const productsQuery = useProductPage({ page, search: debouncedSearch, categoryIds, brandIds, sort: sortBy }, filtersReady);
  const products = productsQuery.data?.products || [];
  const totalProducts = productsQuery.data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCT_PAGE_SIZE));
  const loading = productsQuery.isPending;
  const error = productsQuery.error;

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  
  const toggleBrand = (brand: string) =>
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedBrands([]);
  };

  const activeFilterCount = selectedCategories.length + selectedBrands.length + (search ? 1 : 0);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">{t("products.search")}</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("products.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">{t("products.categories")}</label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("products.noCategories")}</p>
          ) : (
            categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm text-foreground cursor-pointer hover:text-secondary transition-colors">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.name)}
                  onChange={() => toggleCategory(cat.name)}
                  className="rounded border-border accent-secondary"
                />
                {cat.name}
              </label>
            ))
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground mb-2 block">{t("products.brands")}</label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {brands.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("products.noBrands")}</p>
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
      <SEOHelmet seo={pageSEO.products} />
      <div className="section-container py-8">
          <div className="text-center py-20">
            <div className="text-red-500 text-lg mb-4">{error instanceof Error ? error.message : t('products.failed')}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              {t('common.tryAgain')}
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
          <Link to="/" className="hover:text-secondary transition-colors">{t("products.breadcrumbHome")}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{t("products.breadcrumbProducts")}</span>
          {selectedCategories.length === 1 && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{selectedCategories[0]}</span>
            </>
          )}
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-card rounded-xl p-5 shadow-[var(--card-shadow)] sticky top-[calc(var(--store-header-height,150px)+1rem)]">
              <h3 className="font-display font-semibold text-lg mb-4">{t("products.filters")}</h3>
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
                <span className="text-sm text-muted-foreground">{totalProducts} {t("common.viewAll").length > 0 ? "" : ""}{t("products.productsCount", { count: totalProducts }).replace(/\d+ /, "")}</span>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="popularity">{t("products.sortPopularity")}</option>
                  <option value="price-asc">{t("products.sortPriceAsc")}</option>
                  <option value="price-desc">{t("products.sortPriceDesc")}</option>
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
                    {t('products.searchLabel')} {search}
                    <button onClick={() => setSearch("")}><X className="h-3 w-3" /></button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className={`grid gap-4 sm:gap-6 ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="aspect-[3/4] animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-4 sm:gap-6 ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {products.map((product, i) => (
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
                <p className="text-muted-foreground text-lg mb-4">{t("products.noResults")}</p>
                <button onClick={resetFilters} className="btn-primary">{t("products.resetFilters")}</button>
              </div>
            )}
            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Product pages">
                <button className="rounded-lg border px-4 py-2 disabled:opacity-50" disabled={page === 1 || productsQuery.isFetching} onClick={() => setPage((value) => value - 1)}>Previous</button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <button className="rounded-lg border px-4 py-2 disabled:opacity-50" disabled={page === totalPages || productsQuery.isFetching} onClick={() => setPage((value) => value + 1)}>Next</button>
              </nav>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-foreground/50" onClick={() => setShowFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-card p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-lg">{t("products.filters")}</h3>
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
