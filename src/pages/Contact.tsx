import Layout from "@/components/Layout";
import { MapPin, Phone, Mail, Clock, Send, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/supabase";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const faqs = [
  { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days domestically and 10-15 days internationally. Express options are available." },
  { q: "Do you offer warranties on parts?", a: "Yes, all genuine parts come with manufacturer warranty. OEM parts carry a 12-month warranty." },
  { q: "Can I return a part if it doesn't fit?", a: "Absolutely. We have a 30-day return policy for unused parts in original packaging." },
  { q: "Do you ship internationally?", a: "Yes, we ship to over 120 countries worldwide with various shipping options." },
  { q: "How can I track my order?", a: "Once shipped, you'll receive a tracking number via email to monitor your delivery." },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
      });
      if (error) throw error;
      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero py-16">
        <div className="section-container text-center">
          <h1 className="font-display font-black text-4xl text-primary-foreground">Contact Us</h1>
          <p className="text-primary-foreground/70 mt-3">We're here to help. Reach out anytime.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="section-container">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: MapPin, title: "Address", text: "KN 8 Ave/RN3 and KG 14 Ave, Kigali, Rwanda" },
              { icon: Phone, title: "Phone", text: "+250 793 209 175" },
              { icon: Mail, title: "Email", text: "info@mikaglobalbusiness.com" },
              { icon: Clock, title: "Hours", text: "Mon-Fri: 8AM-6PM\nSat: 9AM-2PM" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-card rounded-xl p-5 shadow-[var(--card-shadow)] text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{text}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Google Maps Embed */}
            <div className="bg-muted rounded-2xl h-[400px] overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1993.7772254082786!2d30.06423432739651!3d-1.930222191730555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2srw!4v1777029959873!5m2!1sen!2srw"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="MIKA GLOBAL BUSINESS LTD Location"
              />
            </div>

            {/* Contact Form */}
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="bg-card rounded-2xl p-6 shadow-[var(--card-shadow)] space-y-4"
            >
              <h2 className="font-display font-bold text-xl text-card-foreground mb-2">Send Us a Message</h2>
              {[
                { name: "name", label: "Full Name", type: "text" },
                { name: "email", label: "Email Address", type: "email" },
                { name: "phone", label: "Phone (optional)", type: "tel" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium text-foreground mb-1 block">{field.label}</label>
                  <input
                    type={field.type}
                    value={form[field.name as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                    required={field.name !== "phone"}
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Sending…" : "Send Message"}
              </button>
            </motion.form>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="section-title text-center mb-8">Frequently Asked Questions</h2>
            <div className="max-w-2xl mx-auto space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden shadow-[var(--card-shadow)]">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                  >
                    <span className="font-medium text-card-foreground">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="px-5 pb-4"
                    >
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
