import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCategories } from "@/hooks/use-product-data";
import LanguageSwitcher from "./LanguageSwitcher";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { user, profile, signOut } = useAuth();
  const { totalItems, subtotal } = useCart();
  const { data: categories = [] } = useCategories();
  const location = useLocation();
  const navigate = useNavigate();
  const navLinks = [{ name: t("nav.home"), path: "/" }, { name: t("nav.products"), path: "/products" }, { name: t("nav.about"), path: "/about" }, { name: t("nav.contact"), path: "/contact" }];

  useEffect(() => setIsOpen(false), [location]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = search.trim();
    navigate(value ? `/products?search=${encodeURIComponent(value)}` : "/products");
  };

  const handleLogout = async () => {
    try { await signOut(); toast.success(t("auth.logoutSuccess")); navigate("/"); }
    catch { toast.error(t("auth.logoutFailed")); }
  };

  return (
    <header className="store-header sticky top-0 z-50">
      <div className="bg-[#061d43] text-white/70">
        <div className="section-container flex h-8 items-center justify-between text-[11px]">
          <LanguageSwitcher scrolled />
          <div className="flex items-center gap-4">
            <a href="tel:+250793209175" className="hover:text-[#ff9d1a]">+250 793 209 175</a>
            {user ? <><Link to="/profile" className="hover:text-white">{profile?.name || t("nav.profile")}</Link><button onClick={handleLogout} className="hover:text-white">{t("nav.logout")}</button></> : <><Link to="/login" className="hover:text-white">{t("nav.login")}</Link><Link to="/signup" className="hover:text-white">{t("nav.signup")}</Link></>}
          </div>
        </div>
      </div>
      <div className="bg-[#082b61] text-white">
        <div className="section-container flex min-h-[82px] flex-wrap items-center gap-3 py-3 lg:flex-nowrap lg:gap-7">
          <Link to="/" className="shrink-0 bg-white px-2 py-1" aria-label="MIKA GLOBAL BUSINESS LTD - Home"><img src={logo} alt="MIKA GLOBAL BUSINESS LTD" width="220" height="56" className="h-11 w-auto max-w-[145px] object-contain sm:max-w-[190px]" /></Link>
          <form onSubmit={submitSearch} className="order-3 flex w-full overflow-hidden rounded-sm bg-white shadow-sm md:order-none md:w-auto md:flex-1">
            <label htmlFor="global-search" className="sr-only">{t("common.search")}</label>
            <input id="global-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("home.searchParts")} className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            <button type="submit" className="flex items-center gap-2 bg-[#ff9d1a] px-4 font-bold text-[#10213f] transition hover:bg-[#ffad3d] sm:px-6"><Search className="h-4 w-4" /><span className="hidden sm:inline">{t("common.search")}</span></button>
          </form>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link to={user ? "/profile" : "/login"} aria-label={user ? t("nav.profile") : t("nav.login")} className="header-action"><User className="h-5 w-5" /><span className="hidden xl:inline">{user ? t("nav.profile") : t("nav.login")}</span></Link>
            {user && <Link to="/notifications" aria-label={t("nav.notifications")} className="header-action hidden sm:flex"><Bell className="h-5 w-5" /></Link>}
            <Link to="/cart" aria-label={`${t("nav.cart")} (${totalItems})`} className="header-cart"><span className="relative"><ShoppingCart className="h-5 w-5" />{totalItems > 0 && <span className="absolute -right-3 -top-3 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-black text-[#082b61]">{totalItems}</span>}</span><span className="hidden text-left lg:block"><span className="block text-[10px] uppercase opacity-70">{t("nav.cart")}</span><span className="text-xs font-bold">RWF {subtotal.toLocaleString()}</span></span></Link>
            <button aria-label={isOpen ? t("common.close") : t("nav.menu")} aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)} className="header-action lg:hidden">{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
      </div>
      <nav className="hidden bg-[#084995] text-white lg:block" aria-label="Primary navigation"><div className="section-container flex h-11 items-center">{navLinks.map((link) => <Link key={link.path} to={link.path} className={`nav-rail-link ${location.pathname === link.path ? "active" : ""}`}>{link.name}</Link>)}{categories.slice(0, 6).map((category) => <Link key={category.id} to={`/products?category=${encodeURIComponent(category.name)}`} className="nav-rail-link">{category.name}</Link>)}</div></nav>
      <div className="hidden border-b bg-white text-xs text-slate-500 md:block"><div className="section-container flex h-9 items-center gap-2 overflow-hidden whitespace-nowrap"><span className="font-semibold text-slate-700">Categories:</span>{categories.slice(0, 8).map((category, index) => <span key={category.id} className="flex items-center gap-2"><Link to={`/products?category=${encodeURIComponent(category.name)}`} className="hover:text-[#084995]">{category.name}</Link>{index < Math.min(categories.length, 8) - 1 && <span>•</span>}</span>)}</div></div>
      <AnimatePresence>{isOpen && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/10 bg-[#082b61] text-white lg:hidden"><div className="section-container grid gap-1 py-3">{navLinks.map((link) => <Link key={link.path} to={link.path} className="rounded px-4 py-3 text-sm font-semibold hover:bg-white/10">{link.name}</Link>)}<details className="group"><summary className="flex cursor-pointer list-none items-center justify-between rounded px-4 py-3 text-sm font-semibold hover:bg-white/10">Categories <ChevronDown className="h-4 w-4 group-open:rotate-180" /></summary><div className="grid grid-cols-2 gap-1 px-3 pb-3">{categories.map((category) => <Link key={category.id} to={`/products?category=${encodeURIComponent(category.name)}`} className="rounded px-3 py-2 text-xs text-white/80 hover:bg-white/10">{category.name}</Link>)}</div></details></div></motion.nav>}</AnimatePresence>
    </header>
  );
};

export default Navbar;
