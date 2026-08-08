import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useBrands } from "@/hooks/use-product-data";

const renderHeader = (title: string) => (
  <div className="mb-10 text-center">
    <h2 className="section-title">{title}</h2>
    <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-secondary" />
  </div>
);

const BrandsCarousel = () => {
  const { t } = useTranslation();
  const { data = [], isPending: loading, error } = useBrands();
  const brands = data.map((brand) => brand.name);

  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="section-container">
          {renderHeader(t("home.popularBrands"))}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="min-h-14 animate-pulse rounded-lg bg-muted px-4 py-4"
              >
                <div className="mx-auto h-5 w-20 rounded bg-muted-foreground/10" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-16">
        <div className="section-container">
          {renderHeader(t("home.popularBrands"))}
          <div className="py-8 text-center">
            <p className="mb-4 text-red-500">{t('home.failedBrands')}</p>
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
      <section className="bg-white py-16">
        <div className="section-container">
          {renderHeader(t("home.popularBrands"))}
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t("home.noBrands")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <div className="section-container">
        {renderHeader(t("home.popularBrands"))}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {brands.map((brand, i) => (
            <motion.button
              key={brand}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="min-h-14 rounded-lg bg-muted px-3 py-3 text-center font-display text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary sm:px-4 sm:text-base"
              onClick={() => {
                window.location.href = `/products?brand=${encodeURIComponent(brand)}`;
              }}
            >
              {brand}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsCarousel;
