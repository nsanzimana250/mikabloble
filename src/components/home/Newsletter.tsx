import { Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Subscribed successfully!");
      setEmail("");
    }
  };

  return (
    <section className="py-20 gradient-hero">
      <div className="section-container text-center">
        <Mail className="h-12 w-12 text-secondary mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-primary-foreground mb-3">
          Subscribe for Latest Updates & Offers
        </h2>
        <p className="text-primary-foreground/60 max-w-md mx-auto mb-8">
          Get exclusive deals, new arrivals, and industry news delivered to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-sm focus:outline-none focus:border-secondary"
            required
          />
          <button type="submit" className="btn-primary rounded-lg">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
