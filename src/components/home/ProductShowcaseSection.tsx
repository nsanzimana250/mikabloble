import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { supabase } from "@/supabase";

const showcaseImages = [
  { src: "/correction_images/auto-products-assortment.jpg", alt: "Auto parts assortment" },
  { src: "/correction_images/mogas-engine-oil.jpg", alt: "Mogas engine oil" },
  { src: "/correction_images/engine-oil-bottles.jpeg", alt: "Engine oil bottles" },
  { src: "/correction_images/altopower-engine-oil.jpeg", alt: "Altopower engine oil" },
  { src: "/correction_images/premium-lubricants.jpeg", alt: "Premium lubricants" },
  { src: "/correction_images/auto-lubricants-shelf.jpeg", alt: "Auto lubricants shelf" },
  { src: "/correction_images/engine-oil-display-1.jpeg", alt: "Engine oil display" },
  { src: "/correction_images/engine-oil-display-2.jpeg", alt: "Engine oil product display" },
  { src: "/correction_images/engine-oil-display-3.jpeg", alt: "Engine oil stock display" },
  { src: "/correction_images/oil-promotion.jpeg", alt: "Oil product promotion" },
  { src: "/correction_images/motor-oil-cans.avif", alt: "Motor oil cans" },
  { src: "/correction_images/benz-engine-oil.webp", alt: "Benz engine oil" },
  { src: "/correction_images/advance-oil-filter.jpg", alt: "Advance oil filter" },
  { src: "/correction_images/great-wall-oil-filter.webp", alt: "Great Wall oil filter" },
  { src: "/correction_images/car-lighting-products.jpeg", alt: "Car lighting products" },
  { src: "/correction_images/round-led-car-light.jpg", alt: "Round LED car light" },
  { src: "/correction_images/odyssey-shock-absorbers.jpeg", alt: "Odyssey shock absorbers" },
  { src: "/correction_images/shock-absorbers-banner.jpg", alt: "Shock absorbers banner" },
  { src: "/correction_images/sinotruk-howo-parts.jpeg", alt: "Sinotruk Howo parts" },
  { src: "/correction_images/car-body-filler.avif", alt: "Car body filler" },
  { src: "/correction_images/auto-parts-discount-poster.jpeg", alt: "Auto parts discount poster" },
  { src: "/correction_images/shop-product-photo-1.jpg", alt: "Shop product photo" },
  { src: "/correction_images/shop-product-photo-2.jpg", alt: "Shop product photo" },
  { src: "/correction_images/shop-product-photo-3.jpg", alt: "Shop product photo" },
];

const fallbackCategories = [
  "Engine Oils",
  "Oil Filters",
  "Car Lights",
  "Shock Absorbers",
  "Truck Parts",
  "Body Fillers",
  "Lubricants",
  "Accessories",
];

const ProductShowcaseSection = () => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [categories, setCategories] = useState(fallbackCategories);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % showcaseImages.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("mika_categories")
        .select("name")
        .order("name", { ascending: true });

      if (!error && data?.length) {
        setCategories(data.map((category) => category.name));
      }
    };

    fetchCategories();
  }, []);

  const activeImage = showcaseImages[activeIndex];

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + showcaseImages.length) % showcaseImages.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % showcaseImages.length);
  };

  return (
    <section className="bg-white py-14 sm:py-16 md:py-20">
      <div className="section-container">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <CheckCircle2 className="h-4 w-4" />
              {t("home.showcaseBadge")}
            </span>
            <div>
              <h2 className="section-title text-left">{t("home.showcaseTitle")}</h2>
              <div className="mt-3 h-1 w-16 rounded-full bg-secondary" />
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap gap-2.5">
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={`/products?category=${encodeURIComponent(category)}`}
                    className="rounded-md bg-muted px-3 py-2 text-xs font-bold uppercase text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary sm:text-sm"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="min-w-0"
          >
            <div className="relative overflow-hidden rounded-lg border border-border bg-background">
              <div className="flex min-h-[300px] items-center justify-center p-3 sm:min-h-[430px] md:min-h-[500px]">
                <img
                  key={activeImage.src}
                  src={activeImage.src}
                  alt={activeImage.alt}
                  className="max-h-[280px] w-full object-contain sm:max-h-[410px] md:max-h-[480px]"
                />
              </div>
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-background"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition hover:bg-background"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                {activeIndex + 1} / {showcaseImages.length}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcaseSection;
