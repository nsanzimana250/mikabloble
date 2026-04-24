import { Link } from "react-router-dom";
import { Search, Truck } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[520px] sm:min-h-[600px] md:min-h-[680px] flex items-center gradient-hero overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="Car spare parts" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 gradient-hero opacity-80" />
      </div>

      <div className="section-container relative z-10 py-12 sm:py-16 md:py-20 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6"
          >
            <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="whitespace-nowrap">FREE DELIVERY — Nationwide!</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary-foreground leading-tight"
          >
            Quality Car Spare Parts for{" "}
            <span className="text-gradient">Every Vehicle</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-primary-foreground/70 text-base sm:text-lg md:text-xl mt-4 sm:mt-6 max-w-lg"
          >
            From small clips to major engine components — MIKA GLOBAL delivers excellence worldwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-6 sm:mt-8 flex items-center bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 rounded-xl p-1.5 max-w-md w-full"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground/50 ml-2 sm:ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search parts..."
              className="flex-1 min-w-0 bg-transparent text-primary-foreground placeholder:text-primary-foreground/40 px-2 sm:px-3 py-2 sm:py-2.5 text-sm focus:outline-none"
            />
            <button className="btn-primary rounded-lg px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm shrink-0">Search</button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4"
          >
            <Link to="/products" className="btn-primary text-sm sm:text-base">Shop Now</Link>
            <Link to="/contact" className="btn-outline-hero text-sm sm:text-base">Request Quote</Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:flex sm:gap-8 max-w-md"
          >
            {[
              { value: "50K+", label: "Parts" },
              { value: "15K+", label: "Customers" },
              { value: "120+", label: "Countries" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display font-bold text-xl sm:text-2xl text-secondary">{stat.value}</div>
                <div className="text-primary-foreground/60 text-[10px] sm:text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
