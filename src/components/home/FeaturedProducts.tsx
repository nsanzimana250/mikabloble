import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useFeaturedProducts } from "@/hooks/use-product-data";

const FeaturedProducts = () => {
  const { t } = useTranslation();
  const { data: featured = [], isPending: loading, error } = useFeaturedProducts();

  if (loading) {
    return (
      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title">{t("home.bestSelling")}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
            <p className="section-subtitle mt-3">{t("home.bestSellingDesc")}</p>
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
            <h2 className="section-title">{t("home.bestSelling")}</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
            <p className="section-subtitle mt-3">{t("home.bestSellingDesc")}</p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{t('home.failedProducts')}</p>
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

  return (
    <section className="py-20">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="section-title">{t("home.bestSelling")}</h2>
          <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
          <p className="section-subtitle mt-3">{t("home.bestSellingDesc")}</p>
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
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("home.noProducts")}</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/products" className="btn-primary inline-block">
            {t("home.viewAllProducts")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
