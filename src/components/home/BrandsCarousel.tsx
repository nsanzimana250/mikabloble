import { brands } from "@/data/products";
import { motion } from "framer-motion";

const BrandsCarousel = () => {
  return (
    <section className="py-16 bg-card overflow-hidden">
      <div className="section-container">
        <div className="text-center mb-10">
          <h2 className="section-title">Popular Brands</h2>
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
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={`${brand}-${i}`}
              className="shrink-0 px-8 py-4 bg-muted rounded-xl font-display font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer whitespace-nowrap"
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
