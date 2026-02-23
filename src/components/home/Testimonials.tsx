import { testimonials } from "@/data/products";
import { Star, Quote } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  return (
    <section className="py-20">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Quote className="h-10 w-10 text-secondary/30 mx-auto mb-4" />
              <p className="text-lg text-foreground/80 italic leading-relaxed mb-6">
                "{testimonials[current].text}"
              </p>
              <div className="flex items-center justify-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < testimonials[current].rating ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <div className="font-display font-semibold text-foreground">{testimonials[current].name}</div>
              <div className="text-sm text-muted-foreground">{testimonials[current].role}</div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === current ? "bg-secondary w-8" : "bg-muted-foreground/20 hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
