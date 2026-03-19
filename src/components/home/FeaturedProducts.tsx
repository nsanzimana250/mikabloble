import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  reviewCount: number;
  category: string;
  brand: string;
  inStock: boolean;
  lowStock?: boolean;
  image: string;
  images?: string[];
  specs?: Record<string, string>;
  compatibility?: string[];
}

const FeaturedProducts = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch the last 6 inserted products that are in stock, ordered by creation date
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
            mika_categories (name),
            mika_brands (name)
          `)
          .eq('in_stock', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching featured products:', error);
          // Fallback to static data if database fetch fails
          const { products } = await import("@/data/products");
          const staticFeatured = products.filter((p) => p.inStock).slice(0, 6);
          setFeatured(staticFeatured);
        } else if (data) {
          // Transform the data to match the Product interface
          const transformedProducts = data.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price),
            originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
            reviewCount: product.review_count || 0,
            category: product.mika_categories?.[0]?.name || 'Uncategorized',
            brand: product.mika_brands?.[0]?.name || 'Unbranded',
            inStock: product.in_stock,
            lowStock: product.low_stock || false,
            image: product.image || '',
            images: product.images || [],
            specs: product.specs || {},
            compatibility: product.compatibility || []
          }));

          setFeatured(transformedProducts);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Fallback to static data if there's any error
        const { products } = await import("@/data/products");
        const staticFeatured = products.filter((p) => p.inStock).slice(0, 6);
        setFeatured(staticFeatured);
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
            <p className="section-subtitle mt-3">Top-rated parts trusted by professionals</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
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

  return (
    <section className="py-20">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="section-title">Best Selling Spare Parts</h2>
          <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
          <p className="section-subtitle mt-3">Latest products from our inventory</p>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard product={product} />
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
