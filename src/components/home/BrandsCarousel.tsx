import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTranslation } from "react-i18next";
import { supabase } from "@/supabase"; // FIXED: Correct import path

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
}

const BrandsCarousel = () => {
  const { t } = useTranslation();
  const { t } = useTranslation();
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all brands from database
        const { data, error: brandsError } = await supabase
          .from('mika_brands')
          .select('name')
          .order('name', { ascending: true });
        
        if (brandsError) {
          console.error('Error fetching brands:', brandsError);
          setError(t('home.failedBrands'));
          setBrands([]);
          return;
        }
        
        if (data && data.length > 0) {
          // Extract just the brand names
          const brandNames = data.map(brand => brand.name);
          setBrands(brandNames);
        } else {
          setBrands([]);
        }
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError(t('home.failedBrands'));
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-card overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-10">
            <h2 className="section-title">{t("home.popularBrands")}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
          </div>
        </div>
        <div className="relative">
          <div className="flex gap-8 items-center">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 px-8 py-4 bg-muted rounded-xl animate-pulse w-32"
              >
                <div className="h-6 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-card overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-10">
            <h2 className="section-title">{t("home.popularBrands")}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
          </div>
          <div className="text-center py-8">
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

  if (brands.length === 0) {
    return (
      <section className="py-16 bg-card overflow-hidden">
        <div className="section-container">
          <div className="text-center mb-10">
            <h2 className="section-title">{t("home.popularBrands")}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("home.noBrands")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-card overflow-hidden">
      <div className="section-container">
        <div className="text-center mb-10">
          <h2 className="section-title">{t("home.popularBrands")}</h2>
          <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
        </div>
      </div>

      {/* Infinite scroll marquee */}
      <div className="relative">
        <motion.div
          className="flex gap-8 items-center"
          animate={{ x: [0, -1400] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {/* Duplicate brands array for seamless infinite scroll */}
          {[...brands, ...brands, ...brands].map((brand, i) => (
            <div
              key={`${brand}-${i}`}
              className="shrink-0 px-8 py-4 bg-muted rounded-xl font-display font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer whitespace-nowrap"
              onClick={() => {
                // Optional: Navigate to products page with brand filter
                window.location.href = `/products?brand=${encodeURIComponent(brand)}`;
              }}
            >
              {brand}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BrandsCarousel;