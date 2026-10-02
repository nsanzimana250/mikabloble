import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFeaturedProducts } from "@/hooks/use-product-data";
import { getOptimizedImageUrl } from "@/lib/images";

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: products = [], isPending } = useFeaturedProducts();
  const productCount = products.length;
  const primary = productCount ? products[activeIndex % productCount] : undefined;
  const secondary = productCount ? products[(activeIndex + 1) % productCount] : undefined;
  const tertiary = productCount ? products[(activeIndex + 2) % productCount] : undefined;

  useEffect(() => {
    if (productCount < 2) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % productCount);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [productCount]);

  useEffect(() => {
    setActiveIndex((current) => (productCount ? current % productCount : 0));
  }, [productCount]);

  const showPrevious = () => setActiveIndex((current) => (current - 1 + productCount) % productCount);
  const showNext = () => setActiveIndex((current) => (current + 1) % productCount);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(search.trim() ? `/products?search=${encodeURIComponent(search.trim())}` : "/products");
  };

  return (
    <section className="section-container py-5 sm:py-7">
      <div className="grid min-h-[430px] gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.82fr)]">
        <article className="relative isolate flex min-h-[390px] overflow-hidden bg-white p-7 shadow-sm sm:p-10 lg:p-12" aria-live="polite">
          <div className="relative z-10 flex max-w-[72%] flex-col justify-center sm:max-w-[54%]">
            <span className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff9d1a]">MIKA GLOBAL BUSINESS LTD</span>
            <h1 className="font-display text-3xl font-black uppercase leading-[0.98] text-[#111c31] sm:text-5xl">{primary?.name || t("home.heroTitle1")}</h1>
            {primary && <p className="mt-4 text-lg font-extrabold text-[#084995]">RWF {primary.price.toLocaleString()}</p>}
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-500">{primary?.description || t("home.heroSubtitle")}</p>
            <Link to={primary ? `/products/${primary.id}` : "/products"} className="mt-7 w-fit bg-[#ff9d1a] px-5 py-3 text-xs font-black uppercase tracking-wide text-[#15223a] transition hover:bg-[#ffad3d]">{t("home.shopNow")}</Link>
          </div>
          <div className="absolute inset-y-0 right-0 flex w-[55%] items-center justify-center bg-[radial-gradient(circle_at_center,#f5f7fa_0%,transparent_68%)] p-5 opacity-55 sm:opacity-100">
            {isPending ? <div className="h-64 w-64 animate-pulse rounded-full bg-slate-100" /> : <img src={getOptimizedImageUrl(primary?.image || "", 900)} alt={primary?.name || "Automotive product"} width={900} height={900} className="max-h-[350px] w-full object-contain drop-shadow-2xl" />}
          </div>
          {productCount > 1 && (
            <>
              <div className="absolute bottom-4 left-7 z-20 flex gap-2 sm:left-10 lg:left-12">
                {products.map((product, index) => (
                  <button key={product.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show ${product.name}`} aria-current={index === activeIndex} className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-7 bg-[#ff9d1a]" : "w-2.5 bg-slate-300 hover:bg-slate-400"}`} />
                ))}
              </div>
              <div className="absolute bottom-4 right-4 z-20 flex gap-1">
                <button type="button" onClick={showPrevious} aria-label="Previous featured product" className="grid h-9 w-9 place-items-center bg-white/90 text-[#15223a] shadow transition hover:bg-[#ff9d1a]"><ChevronLeft className="h-5 w-5" /></button>
                <button type="button" onClick={showNext} aria-label="Next featured product" className="grid h-9 w-9 place-items-center bg-white/90 text-[#15223a] shadow transition hover:bg-[#ff9d1a]"><ChevronRight className="h-5 w-5" /></button>
              </div>
            </>
          )}
        </article>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {[secondary, tertiary].map((product, index) => (
            <Link key={product?.id || index} to={product ? `/products/${product.id}` : "/products"} className="group relative min-h-[190px] overflow-hidden bg-white p-6 shadow-sm">
              <div className="relative z-10 max-w-[52%]"><span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff9d1a]">{product?.brand || t("nav.products")}</span><h2 className="mt-2 line-clamp-2 font-display text-xl font-black uppercase leading-tight text-[#16223a]">{product?.name || t("home.bestSelling")}</h2>{product && <p className="mt-3 text-sm font-bold text-[#084995]">RWF {product.price.toLocaleString()}</p>}<span className="mt-4 inline-block border-b border-[#16223a] text-[10px] font-bold uppercase">View product</span></div>
              <img src={getOptimizedImageUrl(product?.image || "", 480)} alt={product?.name || "Automotive product"} width={480} height={480} loading={index ? "lazy" : "eager"} decoding="async" className="absolute -bottom-3 right-0 h-[88%] w-[52%] object-contain transition-transform duration-300 group-hover:scale-105" />
            </Link>
          ))}
        </div>
      </div>

      <form onSubmit={submitSearch} className="mt-4 flex overflow-hidden border border-slate-200 bg-white lg:hidden"><label htmlFor="hero-search" className="sr-only">{t("common.search")}</label><Search className="ml-4 h-5 w-5 self-center text-slate-400" /><input id="hero-search" value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" placeholder={t("home.searchParts")} /><button className="bg-[#ff9d1a] px-5 text-sm font-bold">{t("common.search")}</button></form>
    </section>
  );
};

export default HeroSection;
