import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import saleBanner from "@/assets/sale-banner.jpg";

const SpecialOffers = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-card">
      <div className="section-container">
        <div className="relative rounded-2xl overflow-hidden">
          <img src={saleBanner} alt="Special offer" className="w-full h-[450px] sm:h-[400px] md:h-[350px] object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-85" />
          <div className="absolute inset-0 flex items-center">
            <div className="section-container">
              <div className="max-w-lg">
                <span className="inline-block bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4">
                  LIMITED TIME OFFER
                </span>
                <h2 className="font-display font-bold text-xl sm:text-3xl md:text-4xl text-primary-foreground mb-3">
                  Special Discount on Brake Parts
                </h2>
                <p className="text-primary-foreground/70 mb-6">Up to 30% off on premium brake systems. Don't miss out!</p>

                {/* Countdown */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                  {[
                    { value: timeLeft.days, label: "Days" },
                    { value: timeLeft.hours, label: "Hours" },
                    { value: timeLeft.minutes, label: "Min" },
                    { value: timeLeft.seconds, label: "Sec" },
                  ].map((unit) => (
                    <div key={unit.label} className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-4 py-3 text-center min-w-[60px]">
                      <div className="font-display font-bold text-2xl text-primary-foreground">{String(unit.value).padStart(2, "0")}</div>
                      <div className="text-primary-foreground/60 text-xs">{unit.label}</div>
                    </div>
                  ))}
                </div>

                <Link to="/products?category=Brake+Systems" className="btn-primary inline-block">
                  Shop Sale
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
