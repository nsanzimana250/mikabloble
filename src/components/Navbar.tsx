import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User, ShoppingCart, Menu, X, LogIn, UserPlus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "Request Quote", path: "/request-quote" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/95 backdrop-blur-md shadow-lg"
          : "bg-primary"
      }`}
    >
      <div className="section-container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="MIKA GLOBLE BUSINESS LTD" className="h-10 md:h-14 w-auto max-w-[180px] md:max-w-[240px]" />
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
        <div className="flex items-center gap-3">
          <button className={`p-2 rounded-lg transition-colors ${scrolled ? "text-foreground hover:bg-muted" : "text-primary-foreground/80 hover:text-primary-foreground"}`}>
            <Search className="h-5 w-5" />
          </button>
          
          {/* Authenticated user */}
          {user ? (
            <Link to="/profile" className={`p-2 rounded-lg transition-colors hidden sm:block ${scrolled ? "text-foreground hover:bg-muted" : "text-primary-foreground/80 hover:text-primary-foreground"}`}>
              <User className="h-5 w-5" />
            </Link>
          ) : (
            <>
              {/* Login */}
              <Link 
                to="/login" 
                className={`p-2 rounded-lg transition-colors hidden sm:block ${scrolled ? "text-foreground hover:bg-muted" : "text-primary-foreground/80 hover:text-primary-foreground"}`}
              >
                <LogIn className="h-5 w-5" />
              </Link>
              {/* Sign Up */}
              <Link 
                to="/signup" 
                className={`p-2 rounded-lg transition-colors hidden sm:block ${scrolled ? "text-foreground hover:bg-muted" : "text-primary-foreground/80 hover:text-primary-foreground"}`}
              >
                <UserPlus className="h-5 w-5" />
              </Link>
            </>
          )}
          
          <Link
            to="/cart"
            className={`p-2 rounded-lg transition-colors relative ${scrolled ? "text-foreground hover:bg-muted" : "text-primary-foreground/80 hover:text-primary-foreground"}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
