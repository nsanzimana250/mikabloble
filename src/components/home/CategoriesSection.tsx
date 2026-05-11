import { Link } from "react-router-dom";
import { Cog, Disc3, Zap, Car, ArrowUpDown, Droplets, Settings, Wrench, Filter, Battery, Gauge, Thermometer } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/supabase"; // FIXED: Correct import path

// Map of icons for different categories
const iconMap: Record<string, React.ElementType> = {
  // Default/Common icons
  "Engine": Cog,
  "Brakes": Disc3,
  "Electrical": Zap,
  "Body Parts": Car,
  "Suspension": ArrowUpDown,
  "Cooling System": Droplets,
  "Transmission": Settings,
  "Exhaust": Wrench,
  "Filters": Filter,
  "Battery": Battery,
  "Instruments": Gauge,
  "AC System": Thermometer,
  // Fallback
  "default": Cog,
};

// Helper function to get icon for category name
const getIconForCategory = (categoryName: string) => {
  // Try to find matching icon, case-insensitive
  for (const [key, Icon] of Object.entries(iconMap)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return Icon;
    }
  }
  return iconMap.default;
};

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  count?: number;
}

const CategoriesSection = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('mika_categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          setError(t('home.failedCategories'));
          setCategories([]);
          return;
        }
        
        if (categoriesData && categoriesData.length > 0) {
          // Fetch product counts for all categories efficiently
          const { data: productCounts, error: countError } = await supabase
            .from('mika_products')
            .select('category_id')
            .eq('in_stock', true);

          if (countError) {
            console.error('Error fetching product counts:', countError);
            // Fallback: set all categories to count 0
            const categoriesWithCount = categoriesData.map(category => ({
              id: category.id,
              name: category.name,
              description: category.description,
              image: category.image,
              count: 0
            }));
            setCategories(categoriesWithCount);
            return;
          }

          // Count products per category
          const countMap = (productCounts || []).reduce((acc: Record<string, number>, product) => {
            if (product.category_id) {
              acc[product.category_id] = (acc[product.category_id] || 0) + 1;
            }
            return acc;
          }, {});

          // Combine categories with their counts
          const categoriesWithCount = categoriesData.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            image: category.image,
            count: countMap[category.id] || 0
          }));

          setCategories(categoriesWithCount);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(t('home.failedCategories'));
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-card">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title">{t("home.browseCategory")}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
            <p className="section-subtitle mt-3">{t("home.browseCategoryDesc")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                <div className="w-14 h-14 rounded-xl bg-muted"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-3 bg-muted rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-card">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title">{t("home.browseCategory")}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
            <p className="section-subtitle mt-3">{t("home.browseCategoryDesc")}</p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary inline-block"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-20 bg-card">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title">{t("home.browseCategory")}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
            <p className="section-subtitle mt-3">{t("home.browseCategoryDesc")}</p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("home.noCategories")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-card">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="section-title">{t("home.browseCategory")}</h2>
          <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
          <p className="section-subtitle mt-3">{t("home.browseCategoryDesc")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat, i) => {
            const Icon = getIconForCategory(cat.name);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link 
                  to={`/products?category=${encodeURIComponent(cat.name)}`} 
                  className="category-card flex flex-col items-center gap-3 group transition-all duration-300 hover:scale-105"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm text-card-foreground text-center">{cat.name}</h3>
                  <span className="text-xs text-muted-foreground">{cat.count || 0} {t("common.parts")}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;