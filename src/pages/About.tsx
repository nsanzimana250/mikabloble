import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Target, Eye, Award, Users, Package, Globe } from "lucide-react";

const stats = [
  { icon: Users, value: "15,000+", label: "Happy Customers" },
  { icon: Package, value: "50,000+", label: "Parts Available" },
  { icon: Globe, value: "120+", label: "Countries Served" },
  { icon: Award, value: "12+", label: "Years in Business" },
];

const team = [
  { name: "Michael Adebayo", role: "CEO & Founder", initials: "MA" },
  { name: "Sarah Johnson", role: "Head of Operations", initials: "SJ" },
  { name: "David Chen", role: "Supply Chain Director", initials: "DC" },
  { name: "Amina Okafor", role: "Customer Relations", initials: "AO" },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero py-20">
        <div className="section-container text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-black text-4xl md:text-5xl text-primary-foreground">
            About MIKA GLOBLE
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-primary-foreground/70 text-lg mt-4 max-w-2xl mx-auto">
            Your trusted global partner for quality automotive spare parts since 2014.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="section-title">Our Story</h2>
            <div className="w-16 h-1 bg-secondary mt-3 rounded-full" />
            <p className="text-muted-foreground mt-6 leading-relaxed">
              Founded in 2014, MIKA GLOBLE BUSINESS LTD started with a simple mission: to make quality car spare parts accessible to everyone, everywhere. What began as a small operation has grown into a global enterprise, serving mechanics, fleet managers, and car enthusiasts across 120+ countries.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Today, we offer over 50,000 genuine parts from the world's leading manufacturers. Our commitment to authenticity, competitive pricing, and exceptional customer service continues to drive everything we do.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-6 rounded-xl shadow-[var(--card-shadow)] text-center"
              >
                <stat.icon className="h-8 w-8 text-secondary mx-auto mb-3" />
                <div className="font-display font-bold text-2xl text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-card">
        <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10">
            <Target className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-display font-bold text-xl text-foreground mb-3">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To provide automotive professionals and enthusiasts with genuine, high-quality spare parts at competitive prices, backed by unmatched customer support and global delivery.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-secondary/5 border border-secondary/10">
            <Eye className="h-10 w-10 text-secondary mb-4" />
            <h3 className="font-display font-bold text-xl text-foreground mb-3">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              To become the world's most trusted marketplace for automotive spare parts, driving innovation in global supply chain logistics and customer experience.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Leadership Team</h2>
            <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display font-bold text-xl text-primary">{member.initials}</span>
                </div>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
