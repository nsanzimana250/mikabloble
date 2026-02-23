import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center gradient-hero overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Car spare parts" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 gradient-hero opacity-80" />
      </div>

      <div className="section-container relative z-10 py-20">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-primary-foreground leading-tight"
          >
            Quality Car Spare Parts for{" "}
            <span className="text-gradient">Every Vehicle</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-primary-foreground/70 text-lg md:text-xl mt-6 max-w-lg"
          >
            From small clips to major engine components — MIKA GLOBLE delivers excellence worldwide.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex items-center bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 rounded-xl p-1.5 max-w-md"
          >
            <Search className="h-5 w-5 text-primary-foreground/50 ml-3" />
            <input
              type="text"
              placeholder="Search by part name, number, or vehicle..."
              className="flex-1 bg-transparent text-primary-foreground placeholder:text-primary-foreground/40 px-3 py-2.5 text-sm focus:outline-none"
            />
            <button className="btn-primary rounded-lg px-5 py-2.5 text-sm">
              Search
            </button>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link to="/products" className="btn-primary text-base">
              Shop Now
            </Link>
            <Link to="/request-quote" className="btn-outline-hero text-base">
              Request Quote
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-12 flex gap-8"
          >
            {[
              { value: "50K+", label: "Parts Available" },
              { value: "15K+", label: "Happy Customers" },
              { value: "120+", label: "Countries" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display font-bold text-2xl text-secondary">{stat.value}</div>
                <div className="text-primary-foreground/60 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
