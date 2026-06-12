import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, Battery, Car, Cog, Disc3, Droplets, Filter, Gauge, Settings, Thermometer, Wrench, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { supabase } from "@/supabase";

const iconMap: Record<string, React.ElementType> = {
  Engine: Cog,
  Brakes: Disc3,
  Electrical: Zap,
  "Body Parts": Car,
  Suspension: ArrowUpDown,
  "Cooling System": Droplets,
  Transmission: Settings,
  Exhaust: Wrench,
  Filters: Filter,
  Battery,
  Instruments: Gauge,
  "AC System": Thermometer,
  default: Cog,
};

const getIconForCategory = (categoryName: string) => {
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

        const { data: categoriesData, error: categoriesError } = await supabase
          .from("mika_categories")
          .select("*")
          .order("name", { ascending: true });

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
          setError(t("home.failedCategories"));
          setCategories([]);
          return;
        }

        if (categoriesData?.length) {
          const { data: productCounts, error: countError } = await supabase
            .from("mika_products")
            .select("category_id")
            .eq("in_stock", true);

          if (countError) {
            console.error("Error fetching product counts:", countError);
            setCategories(
              categoriesData.map((category) => ({
                id: category.id,
                name: category.name,
                description: category.description,
                image: category.image,
                count: 0,
              }))
            );
            return;
          }

          const countMap = (productCounts || []).reduce((acc: Record<string, number>, product) => {
            if (product.category_id) {
              acc[product.category_id] = (acc[product.category_id] || 0) + 1;
            }
            return acc;
          }, {});

          setCategories(
            categoriesData.map((category) => ({
              id: category.id,
              name: category.name,
              description: category.description,
              image: category.image,
              count: countMap[category.id] || 0,
            }))
          );
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(t("home.failedCategories"));
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [t]);

  const renderHeader = () => (
    <div className="mb-12 text-center">
      <h2 className="section-title">{t("home.browseCategory")}</h2>
      <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-secondary" />
      <p className="section-subtitle mt-3">{t("home.browseCategoryDesc")}</p>
    </div>
  );

  if (loading) {
    return (
      <section className="bg-card py-20">
        <div className="section-container">
          {renderHeader()}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex animate-pulse flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-xl bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-3 w-12 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-card py-20">
        <div className="section-container">
          {renderHeader()}
          <div className="py-12 text-center">
            <p className="mb-4 text-red-500">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary inline-block">
              {t("common.tryAgain")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="bg-card py-20">
        <div className="section-container">
          {renderHeader()}
          <div className="py-12 text-center">
            <p className="text-muted-foreground">{t("home.noCategories")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card py-20">
      <div className="section-container">
        {renderHeader()}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
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
                  className="category-card group flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-center text-sm font-semibold text-card-foreground">{cat.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {cat.count || 0} {t("common.parts")}
                  </span>
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
