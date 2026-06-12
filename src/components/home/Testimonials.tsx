import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const testimonials = [
  {
    name: "Jean Claude Niyonzima",
    location: "Kigali",
    text: "MIKA GLOBAL helped me find the right engine oil and filter without wasting time. The team explained everything clearly and the quality was exactly what I needed.",
  },
  {
    name: "Claudine Mukamana",
    location: "Remera",
    text: "I ordered car lights and received quick support from start to finish. The products looked the same as shown and worked perfectly on my vehicle.",
  },
  {
    name: "Eric Tuyishime",
    location: "Musanze",
    text: "Their shock absorbers made a big difference in my car. I liked the honest advice, fair pricing, and fast communication.",
  },
  {
    name: "Aline Uwamahoro",
    location: "Kicukiro",
    text: "I needed reliable oil for regular service, and MIKA GLOBAL made the choice easy. Good products, clean service, and respectful staff.",
  },
  {
    name: "Patrick Habimana",
    location: "Rubavu",
    text: "The truck parts I bought were strong and well packed. I trust them because they understand what customers need before recommending a product.",
  },
  {
    name: "Diane Ishimwe",
    location: "Huye",
    text: "Their customer care is excellent. I asked many questions before buying and they answered every one with patience and confidence.",
  },
  {
    name: "Olivier Manirakiza",
    location: "Nyamirambo",
    text: "I found filters and accessories in one place, which saved me a full day of moving around. The website also makes it clear what they sell.",
  },
  {
    name: "Grace Umutoni",
    location: "Gisozi",
    text: "The engine oil I bought was original and my car has been running smoothly since service. I will keep buying from MIKA GLOBAL.",
  },
  {
    name: "Emmanuel Hakizimana",
    location: "Rwamagana",
    text: "Delivery was smooth and the product quality was better than expected. I appreciate a business that keeps promises.",
  },
  {
    name: "Chantal Uwase",
    location: "Kimihurura",
    text: "They recommended the correct car lighting product for my model. It was easy, professional, and the result looks great.",
  },
];

const Testimonials = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % testimonials.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const active = testimonials[current];

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="section-container">
        <div className="mb-10 text-center">
          <h2 className="section-title">{t("home.testimonials")}</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-secondary" />
        </div>

        <div className="mx-auto max-w-4xl">
          <motion.div
            key={active.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-lg border border-border bg-card p-6 text-center shadow-[var(--card-shadow)] sm:p-8"
          >
            <Quote className="mx-auto mb-5 h-10 w-10 text-secondary/40" />
            <div className="mb-5 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-5 w-5 fill-secondary text-secondary" />
              ))}
            </div>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-foreground/80">
              "{active.text}"
            </p>
            <div className="mt-6">
              <div className="font-display text-lg font-bold text-foreground">{active.name}</div>
              <div className="text-sm font-medium text-muted-foreground">{active.location}, Rwanda</div>
            </div>
          </motion.div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.name}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Show testimonial from ${testimonial.name}`}
                className={`h-2.5 rounded-full transition-all ${
                  current === index ? "w-9 bg-secondary" : "w-2.5 bg-muted-foreground/25 hover:bg-muted-foreground/45"
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
