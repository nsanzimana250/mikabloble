import { Link } from "react-router-dom";
import { Car, Facebook, Instagram, Linkedin, Twitter, ArrowUp, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Footer = () => {
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
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-6 w-6 text-secondary" />
              <span className="font-display font-bold text-lg">MIKA GLOBLE</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Your trusted partner for quality car spare parts. From small clips to major engine components, we deliver excellence worldwide.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              {[
                { name: "Home", path: "/" },
                { name: "Products", path: "/products" },
                { name: "About Us", path: "/about" },
                { name: "Contact", path: "/contact" },
                { name: "Request Quote", path: "/request-quote" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contact Us</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-secondary" />
                <span>123 Industrial Area, Business District, London, UK</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 shrink-0 text-secondary" />
                <span>+44 20 1234 5678</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                <span>info@mikagloble.com</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Newsletter</h3>
            <p className="text-primary-foreground/70 text-sm mb-4">Subscribe for the latest updates and offers.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:border-secondary"
                required
              />
              <button type="submit" className="btn-primary px-4 py-2 text-sm rounded-lg">
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="section-container py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-primary-foreground/50 text-xs">
            © 2026 MIKA GLOBLE BUSINESS LTD. All rights reserved.
          </p>
          <button onClick={scrollToTop} className="p-2 rounded-full bg-secondary text-secondary-foreground hover:brightness-110 transition-all">
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
