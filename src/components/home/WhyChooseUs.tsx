import { Globe, ShieldCheck, Headphones, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Globe, title: "Worldwide Shipping", desc: "Fast delivery to over 120 countries with real-time tracking." },
  { icon: ShieldCheck, title: "100% Authentic Parts", desc: "Every part is genuine and backed by manufacturer warranty." },
  { icon: Headphones, title: "24/7 Customer Support", desc: "Expert assistance available around the clock via chat, email, or phone." },
  { icon: RotateCcw, title: "Easy Returns", desc: "Hassle-free 30-day return policy on all orders." },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="section-title">Why Choose Us</h2>
          <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-6 text-center shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <f.icon className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
