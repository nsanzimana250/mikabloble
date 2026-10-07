import { ArrowRight, Headphones, ShieldCheck, Truck, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import heroBackground from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const { t } = useTranslation();
  const trustItems = [
    { icon: ShieldCheck, label: t("home.feat2Title") },
    { icon: Truck, label: t("home.freeDeliveryBadge") },
    { icon: Headphones, label: t("home.feat3Title") },
  ];

  return (
    <section className="section-container py-5 sm:py-7" aria-labelledby="home-hero-title">
      <div className="relative isolate overflow-hidden border border-white/10 bg-[#061d43] shadow-[0_24px_70px_rgba(6,29,67,0.22)]">
        <img
          src={heroBackground}
          alt=""
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-55 sm:opacity-65 lg:left-auto lg:w-[70%] lg:object-center lg:opacity-100"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#061d43]/80 lg:bg-[linear-gradient(90deg,#061d43_0%,#061d43_43%,rgba(6,29,67,0.9)_55%,rgba(6,29,67,0.3)_78%,rgba(6,29,67,0.08)_100%)]"
        />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[#ff9d1a]" />
        <div aria-hidden="true" className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#084995]/35 blur-3xl" />
        <div aria-hidden="true" className="absolute bottom-0 right-0 h-28 w-2/5 bg-gradient-to-l from-[#ff9d1a]/10 to-transparent" />

        <div className="relative z-10 flex min-h-[540px] items-center px-6 py-12 sm:px-10 sm:py-14 lg:min-h-[570px] lg:px-16 xl:px-20">
          <div className="max-w-[680px]">
            <div className="mb-6 inline-flex items-center gap-3 border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              <span className="grid h-7 w-7 place-items-center bg-[#ff9d1a] text-[#10213f]">
                <Wrench className="h-4 w-4" aria-hidden="true" />
              </span>
              MIKA GLOBAL BUSINESS LTD
            </div>

            <h1
              id="home-hero-title"
              className="max-w-[650px] font-display text-4xl font-black uppercase leading-[0.94] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl xl:text-[4.4rem]"
            >
              {t("home.heroTitle1")}
              <span className="mt-1 block text-[#ff9d1a]">{t("home.heroTitle2")}</span>
            </h1>

            <p className="mt-6 max-w-[590px] text-sm leading-7 text-slate-200 sm:text-base">
              {t("home.heroSubtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <Link
                to="/products"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#ff9d1a] px-6 text-sm font-black uppercase tracking-wide text-[#10213f] transition hover:bg-[#ffad3d] hover:shadow-[var(--orange-glow)]"
              >
                {t("home.shopNow")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center justify-center border border-white/45 bg-white/5 px-6 text-sm font-black uppercase tracking-wide text-white backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-[#061d43]"
              >
                {t("home.requestQuote")}
              </Link>
            </div>

            <ul className="mt-9 flex max-w-[650px] flex-wrap gap-x-6 gap-y-4 border-t border-white/15 pt-5 text-white/90">
              {trustItems.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-xs font-bold sm:text-sm">
                  <span className="grid h-8 w-8 shrink-0 place-items-center border border-[#ff9d1a]/60 bg-[#ff9d1a]/10 text-[#ffad3d]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div aria-hidden="true" className="absolute bottom-0 left-0 h-1 w-1/3 bg-[#ff9d1a]" />
      </div>
    </section>
  );
};

export default HeroSection;
