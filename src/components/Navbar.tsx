import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, LogIn, UserPlus, User, LogOut, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import LanguageSwitcher from "./LanguageSwitcher";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.products"), path: "/products" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(t("auth.logoutSuccess"));
      navigate("/");
    } catch (error) {
      toast.error(t("auth.logoutFailed"));
    }
  };

  const iconBtn = `p-2 rounded-lg transition-colors ${scrolled ? "text-foreground hover:bg-muted" : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"}`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-card/95 backdrop-blur-md shadow-lg" : "bg-primary"
      }`}
    >
      <div className="section-container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="MIKA GLOBAL BUSINESS LTD - Home">
          <img src={logo} alt="MIKA GLOBAL BUSINESS LTD" width="240" height="56" className="h-10 md:h-14 w-auto max-w-[180px] md:max-w-[240px]" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? scrolled
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary-foreground/20 text-primary-foreground"
                  : scrolled
                  ? "text-foreground hover:bg-muted"
                  : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher scrolled={scrolled} />

          {user ? (
            <>
              {/* Profile Icon — visible on ALL screens */}
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors ${scrolled ? "text-foreground hover:bg-muted" : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"}`}
                title={t("nav.profile")}
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {profile?.name?.split(" ")[0] || t("nav.profile")}
                </span>
              </Link>

              <Link to="/notifications" className={`${iconBtn} hidden sm:block`} title={t("nav.notifications")}>
                <Bell className="h-5 w-5" />
              </Link>

              <button onClick={handleLogout} className={`${iconBtn} hidden sm:block`} title={t("nav.logout")}>
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              {/* Login icon — visible on ALL screens (next to cart on mobile) */}
              <Link to="/login" className={iconBtn} title={t("nav.login")} aria-label={t("nav.login")}>
                <LogIn className="h-5 w-5" />
              </Link>
              <Link to="/signup" className={`${iconBtn} hidden sm:block`} title={t("nav.signup")} aria-label={t("nav.signup")}>
                <UserPlus className="h-5 w-5" />
              </Link>
            </>
          )}

          <Link
            to="/cart"
            aria-label={`${t("nav.cart")}${totalItems > 0 ? ` (${totalItems})` : ""}`}
            className={`${iconBtn} relative`}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            aria-label={isOpen ? t("common.close") : t("nav.menu")}
            aria-expanded={isOpen}
            className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border overflow-hidden"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-border my-2 pt-2">
                {user ? (
                  <>
                    <Link to="/profile" className="px-4 py-3 rounded-lg font-medium text-foreground hover:bg-muted flex items-center gap-2">
                      <User className="h-4 w-4" /> {t("nav.profile")}
                    </Link>
                    <Link to="/notifications" className="px-4 py-3 rounded-lg font-medium text-foreground hover:bg-muted flex items-center gap-2">
                      <Bell className="h-4 w-4" /> {t("nav.notifications")}
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="px-4 py-3 rounded-lg font-medium text-foreground hover:bg-muted flex items-center gap-2">
                      <LogIn className="h-4 w-4" /> {t("nav.login")}
                    </Link>
                    <Link to="/signup" className="px-4 py-3 rounded-lg font-medium text-foreground hover:bg-muted flex items-center gap-2">
                      <UserPlus className="h-4 w-4" /> {t("nav.signup")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
