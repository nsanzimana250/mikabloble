import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Newsletter = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(t("home.subscribeSuccess"));
      setEmail("");
    }
  };

  return (
    <section className="py-20 gradient-hero">
      <div className="section-container text-center">
        <Mail className="h-12 w-12 text-secondary mx-auto mb-4" />
        <h2 className="font-display font-bold text-3xl text-primary-foreground mb-3">
          {t("home.newsletterTitle")}
        </h2>
        <p className="text-primary-foreground/60 max-w-md mx-auto mb-8">
          {t("home.newsletterDesc")}
        </p>

        <form onSubmit={handleSubmit} className="max-w-sm mx-auto flex gap-2">
          <input
            type="email"
            placeholder={t("home.enterEmail")}
            aria-label={t("home.enterEmail")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 h-9 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-xs focus:outline-none focus:border-secondary"
            required
          />
          <button type="submit" className="px-4 h-9 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold hover:brightness-110 transition-all">
            {t("home.subscribe")}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
