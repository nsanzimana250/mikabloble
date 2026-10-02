import { Link } from "react-router-dom";
import { ArrowUpDown, Battery, Car, Cog, Disc3, Droplets, Filter, Gauge, Settings, Thermometer, Wrench, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/hooks/use-product-data";

const iconMap: Record<string, React.ElementType> = {
  Engine: Cog,
  Brakes: Disc3,
  Electrical: Zap,
  "Body Parts": Car,
  Suspension: ArrowUpDown,
  "Cooling System": Droplets,
  Transmission: Settings,
  Exhaust: Wrench,
  Filters: Filter,
  Battery,
  Instruments: Gauge,
  "AC System": Thermometer,
  default: Cog,
};

const getIconForCategory = (categoryName: string) => {
  for (const [key, Icon] of Object.entries(iconMap)) {
    if (categoryName.toLowerCase().includes(key.toLowerCase())) {
      return Icon;
    }
  }

  return iconMap.default;
};

const CategoriesSection = () => {
  const { t } = useTranslation();
  const { data: categories = [], isPending: loading, error } = useCategories();

  const renderHeader = () => (
    <div className="mb-4 flex items-end justify-between border-b border-slate-200 pb-2 text-left">
      <h2 className="font-display text-xl font-bold uppercase tracking-tight text-foreground md:text-2xl">{t("home.browseCategory")}</h2>
      <p className="hidden text-xs text-muted-foreground sm:block">{t("home.browseCategoryDesc")}</p>
    </div>
  );

  if (loading) {
    return (
      <section className="py-6">
        <div className="section-container">
          {renderHeader()}
          <div className="flex gap-3 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex min-w-[160px] animate-pulse items-center gap-3 border border-slate-100 bg-white px-4 py-3">
                <div className="h-9 w-9 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-6">
        <div className="section-container">
          {renderHeader()}
          <div className="py-12 text-center">
            <p className="mb-4 text-red-500">{t("home.failedCategories")}</p>
            <button onClick={() => window.location.reload()} className="btn-primary inline-block">
              {t("common.tryAgain")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-6">
        <div className="section-container">
          {renderHeader()}
          <div className="py-12 text-center">
            <p className="text-muted-foreground">{t("home.noCategories")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="section-container">
        {renderHeader()}
        <div className="group overflow-hidden" role="region" aria-label={t("home.browseCategory")}>
          <div className="category-marquee flex w-max gap-3 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
            {[false, true].map((duplicate) => (
              <div key={String(duplicate)} className="flex gap-3" aria-hidden={duplicate || undefined}>
                {categories.map((cat) => {
                  const Icon = getIconForCategory(cat.name);
                  return (
                    <Link key={cat.id} tabIndex={duplicate ? -1 : undefined} to={`/products?category=${encodeURIComponent(cat.name)}`} className="group/card flex min-w-[150px] items-center gap-3 rounded-sm border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-[#ff9d1a] hover:shadow-md sm:min-w-[170px]">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-primary/10 transition-colors group-hover/card:bg-[#ff9d1a]/15"><Icon className="h-5 w-5 text-primary" /></span>
                      <span className="max-w-[105px] text-xs font-bold leading-tight text-card-foreground">{cat.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
