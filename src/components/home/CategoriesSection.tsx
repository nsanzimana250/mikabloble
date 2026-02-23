import { Link } from "react-router-dom";
import { categories } from "@/data/products";
import { Cog, Disc3, Zap, Car, ArrowUpDown, Droplets } from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ElementType> = {
  Cog, Disc3, Zap, Car, ArrowUpDown, Droplets,
};

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-card">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="section-title">Browse by Category</h2>
          <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
          <p className="section-subtitle mt-3">Find the right parts for your vehicle</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon] || Cog;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/products?category=${encodeURIComponent(cat.name)}`} className="category-card flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm text-card-foreground">{cat.name}</h3>
                  <span className="text-xs text-muted-foreground">{cat.count} parts</span>
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
