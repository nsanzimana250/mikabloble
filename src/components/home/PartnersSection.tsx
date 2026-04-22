import { motion } from "framer-motion";

const partners = [
  { name: "Mika Global", logo: "/pateners/mikaglobal.png" },
  { name: "Delarcha", logo: "/pateners/delarcha.png" },
  { name: "Umumararungu Plaza", logo: "/pateners/umumararunguplaza.png" },
  { name: "Zawico Ltd", logo: "/pateners/zawicoltd.png" },
];

const PartnersSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="section-title">Our Trusted Partners</h2>
          <p className="section-subtitle">
            Working together with leading brands and businesses
          </p>
          <div className="w-16 h-1 bg-secondary mx-auto mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group bg-card rounded-xl p-6 md:p-8 shadow-[var(--card-shadow)] hover:shadow-[var(--card-shadow-hover)] transition-all duration-300 flex items-center justify-center aspect-[3/2]"
            >
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                loading="lazy"
                className="max-h-20 md:max-h-24 w-auto object-contain transition-all duration-300 group-hover:scale-105"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
