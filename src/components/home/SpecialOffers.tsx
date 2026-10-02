import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFeaturedProducts } from "@/hooks/use-product-data";
import { getOptimizedImageUrl } from "@/lib/images";

const SpecialOffers = () => {
  const { t } = useTranslation();
  const { data: products = [] } = useFeaturedProducts();
  const product = products.find((item) => item.image) || products[0];

  return (
    <section className="py-7">
      <div className="section-container">
        <div className="relative min-h-[220px] overflow-hidden border border-slate-200 bg-white px-7 py-8 sm:px-12">
          <div className="relative z-10 max-w-lg">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#e98400]">MIKA GLOBAL BUSINESS LTD</span>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-none text-[#15223a] sm:text-4xl">{product?.name || t("home.viewAllProducts")}</h2>
            {product && <p className="mt-3 text-lg font-extrabold text-[#084995]">RWF {product.price.toLocaleString()}</p>}
            <Link to={product ? `/products/${product.id}` : "/products"} className="mt-6 inline-block bg-[#ff9d1a] px-5 py-3 text-xs font-black uppercase text-[#15223a]">{t("home.shopNow")}</Link>
          </div>
          {product?.image && <img src={getOptimizedImageUrl(product.image, 760)} alt={product.name} width={760} height={480} loading="lazy" decoding="async" className="absolute inset-y-0 right-0 h-full w-[52%] object-contain object-right p-4" />}
          <div className="absolute inset-y-0 right-[34%] hidden w-24 -skew-x-12 bg-[#ff9d1a]/15 lg:block" />
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
