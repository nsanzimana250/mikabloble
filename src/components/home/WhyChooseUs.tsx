import { Globe, ShieldCheck, Headphones, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const WhyChooseUs = () => {
  const { t } = useTranslation();
  const features = [
    { icon: Globe, title: t("home.feat1Title"), desc: t("home.feat1Desc") },
    { icon: ShieldCheck, title: t("home.feat2Title"), desc: t("home.feat2Desc") },
    { icon: Headphones, title: t("home.feat3Title"), desc: t("home.feat3Desc") },
    { icon: RotateCcw, title: t("home.feat4Title"), desc: t("home.feat4Desc") },
  ];

  return (
    <section className="py-20">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="section-title">{t("home.whyChoose")}</h2>
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
