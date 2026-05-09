import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter, ArrowUp, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Subscribed successfully!");
      setEmail("");
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <img src={logo} alt="MIKA GLOBAL BUSINESS LTD" width="240" height="56" className="h-14 w-auto brightness-0 invert" />
            </div>
            <p className="text-primary-foreground/90 text-sm leading-relaxed mb-4">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
                { Icon: Twitter, label: "Twitter" },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={`Follow us on ${label}`} className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">{t("footer.quickLinks")}</h3>
            <div className="flex flex-col gap-2">
              {[
                { name: t("nav.home"), path: "/" },
                { name: t("nav.products"), path: "/products" },
                { name: t("nav.about"), path: "/about" },
                { name: t("nav.contact"), path: "/contact" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-primary-foreground/90 hover:text-secondary transition-colors text-sm">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">{t("footer.contactUs")}</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 text-sm text-primary-foreground/90">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
                <span>KN 8 Ave/RN3 and KG 14 Ave – Kinamba to Genocide Memorial Site, Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <Phone className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                <a href="tel:+250793209175" className="hover:text-secondary transition-colors">+250 793 209 175</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <Mail className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
                <a href="mailto:info@mikaglobalbusiness.com" className="hover:text-secondary transition-colors">info@mikaglobalbusiness.com</a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">{t("footer.newsletter")}</h3>
            <p className="text-primary-foreground/90 text-sm mb-4">{t("footer.newsletterDesc")}</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <label htmlFor="newsletter-email" className="sr-only">{t("footer.yourEmail")}</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder={t("footer.yourEmail")}
                aria-label={t("footer.yourEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 px-2 py-1.5 h-8 rounded-md bg-primary-foreground/10 border border-primary-foreground/30 text-xs text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:border-secondary"
                required
              />
              <button type="submit" className="px-3 h-8 text-xs font-semibold rounded-md bg-secondary text-secondary-foreground hover:brightness-110 transition-all">
                {t("footer.join")}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="section-container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-primary-foreground/80 text-xs text-center sm:text-left">
            <p>© 2026 MIKA GLOBAL BUSINESS LTD. {t("footer.rights")}</p>
            <p className="mt-1">{t("footer.developedBy")} <a href="https://esdras-kappa.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-secondary underline underline-offset-2 hover:brightness-125">dev esdras</a></p>
            <Link to="/admin/login" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors mt-1 inline-block underline underline-offset-2">{t("footer.admin")}</Link>
          </div>
          <button onClick={scrollToTop} aria-label="Scroll to top" className="p-2 rounded-full bg-secondary text-secondary-foreground hover:brightness-110 transition-all">
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
