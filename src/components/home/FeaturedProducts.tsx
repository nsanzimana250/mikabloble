import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/supabase"; // FIXED: Correct import path
import { Product } from "@/types/product";

const FeaturedProducts = () => {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the last 8 inserted products that are in stock, ordered by creation date
        const { data, error } = await supabase
          .from('mika_products')
          .select(`
            id,
            name,
            description,
            price,
            original_price,
            review_count,
            in_stock,
            low_stock,
            image,
            images,
            specs,
            compatibility,
            created_at,
            mika_categories (id, name),
            mika_brands (id, name)
          `)
          .eq('in_stock', true)
          .limit(8); // CHANGED: from 6 to 8 products

        if (error) {
          console.error('Error fetching featured products:', error);
          setError('Failed to load products');
          setFeatured([]);
          return;
        }
        
        if (data && data.length > 0) {
          // Transform the data to match the Product interface
          const transformedProducts = data.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price),
            originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
            reviewCount: product.review_count || 0,
            category: (Array.isArray(product.mika_categories) ? product.mika_categories[0]?.name : (product.mika_categories as any)?.name) || 'Uncategorized',
            brand: (Array.isArray(product.mika_brands) ? product.mika_brands[0]?.name : (product.mika_brands as any)?.name) || 'Unbranded',
            inStock: product.in_stock,
            lowStock: product.low_stock || false,
            image: product.image || '',
            images: product.images || [],
            specs: product.specs || {},
            compatibility: product.compatibility || []
          }));

          // Shuffle products randomly
          const shuffled = transformedProducts.sort(() => Math.random() - 0.5);

          setFeatured(shuffled);
        } else {
          setFeatured([]);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('An error occurred while loading products');
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Best Selling Spare Parts</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
            <p className="section-subtitle mt-3">Latest products from our inventory</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => ( // CHANGED: from 4 to 8 skeleton loaders
              <div key={i} className="bg-card rounded-xl p-6 border border-border animate-pulse">
                <div className="h-32 sm:h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Best Selling Spare Parts</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
            <p className="section-subtitle mt-3">Latest products from our inventory</p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary inline-block"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="section-title">Best Selling Spare Parts</h2>
          <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
          <p className="section-subtitle mt-3">Latest products from our inventory</p>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }} // CHANGED: faster animation for more products
              >
                <ProductCard product={product as any} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available at the moment.</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/products" className="btn-primary inline-block">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;