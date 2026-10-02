import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFeaturedProducts } from "@/hooks/use-product-data";
import { getOptimizedImageUrl } from "@/lib/images";

const ProductShowcaseSection = () => {
  const { t } = useTranslation();
  const { data: products = [] } = useFeaturedProducts();
  const showcase = products.slice(0, 3);
  if (!showcase.length) return null;

  return (
    <section className="hidden py-9 md:block">
      <div className="section-container">
        <div className="mb-7 flex items-end justify-between border-b border-slate-200 pb-3">
          <h2 className="section-title">Product highlights</h2>
          <Link to="/products" className="flex items-center gap-1 text-xs font-bold uppercase text-[#084995]">{t("home.viewAllProducts")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {showcase.map((product, index) => (
            <Link key={product.id} to={`/products/${product.id}`} className={`group relative min-h-[260px] overflow-hidden border border-slate-200 bg-white p-6 ${index === 0 ? "lg:col-span-2" : ""}`}>
              <div className="relative z-10 max-w-[52%]"><span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e98400]">{product.brand}</span><h3 className="mt-2 line-clamp-3 font-display text-2xl font-black uppercase leading-none text-[#16223a]">{product.name}</h3><p className="mt-3 text-sm font-extrabold text-[#084995]">RWF {product.price.toLocaleString()}</p><span className="mt-5 inline-flex items-center gap-1 text-[10px] font-bold uppercase">View product <ArrowRight className="h-3 w-3" /></span></div>
              <img src={getOptimizedImageUrl(product.image, index === 0 ? 760 : 520)} alt={product.name} width={760} height={520} loading="lazy" decoding="async" className="absolute bottom-0 right-0 h-[90%] w-[54%] object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcaseSection;
