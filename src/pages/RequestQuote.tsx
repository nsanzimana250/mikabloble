import Layout from "@/components/Layout";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Phone, Mail, FileText, Send } from "lucide-react";

const RequestQuote = () => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", partName: "", quantity: 1,
    carModel: "", urgency: "Normal", details: "", contactMethod: "Email",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Quote request submitted!");
  };

  const update = (field: string, value: string | number) => setForm({ ...form, [field]: value });

  if (submitted) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <CheckCircle className="h-20 w-20 text-secondary mx-auto mb-6" />
          </motion.div>
          <h1 className="section-title">Quote Request Submitted!</h1>
          <p className="section-subtitle mt-3">We'll get back to you within 24 hours.</p>
          <button onClick={() => setSubmitted(false)} className="btn-primary mt-6">Submit Another</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="gradient-hero py-16">
        <div className="section-container text-center">
          <h1 className="font-display font-black text-4xl text-primary-foreground">Request a Quote</h1>
          <p className="text-primary-foreground/70 mt-3">Get competitive pricing for bulk or specific parts</p>
        </div>
      </section>

      <section className="py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="lg:col-span-2 bg-card rounded-2xl p-6 md:p-8 shadow-[var(--card-shadow)] space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { name: "name", label: "Full Name *", type: "text" },
                  { name: "email", label: "Email Address *", type: "email" },
                  { name: "phone", label: "Phone Number *", type: "tel" },
                  { name: "company", label: "Company Name", type: "text" },
                  { name: "partName", label: "Part Name / Number *", type: "text" },
                  { name: "carModel", label: "Car Model / Year *", type: "text" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="text-sm font-medium text-foreground mb-1 block">{field.label}</label>
                    <input
                      type={field.type}
                      value={form[field.name as keyof typeof form] as string}
                      onChange={(e) => update(field.name, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                      required={field.label.includes("*")}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => update("quantity", parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Urgency Level</label>
                  <select
                    value={form.urgency}
                    onChange={(e) => update("urgency", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option>Normal</option>
                    <option>Urgent</option>
                    <option>Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Contact Method</label>
                  <select
                    value={form.contactMethod}
                    onChange={(e) => update("contactMethod", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                  >
                    <option>Email</option>
                    <option>Phone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Additional Details</label>
                <textarea
                  value={form.details}
                  onChange={(e) => update("details", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                  placeholder="Describe the part you need, any specific requirements..."
                />
              </div>

              <button type="submit" className="btn-primary flex items-center gap-2">
                <Send className="h-4 w-4" /> Submit Quote Request
              </button>
            </motion.form>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-[var(--card-shadow)]">
                <h3 className="font-display font-semibold text-lg text-card-foreground mb-4">Why Request a Quote?</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    "Best prices for bulk orders",
                    "Custom sourcing for rare parts",
                    "Expert advice on compatibility",
                    "Priority processing available",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-[var(--card-shadow)]">
                <h3 className="font-display font-semibold text-lg text-card-foreground mb-4">Contact Info</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-secondary" /> +44 20 1234 5678</div>
                  <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-secondary" /> quotes@mikaglobal.com</div>
                  <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-secondary" /> Mon-Fri: 8AM-6PM</div>
                </div>
              </div>

              <div className="bg-secondary/10 rounded-2xl p-6 border border-secondary/20 text-center">
                <FileText className="h-8 w-8 text-secondary mx-auto mb-2" />
                <p className="font-semibold text-foreground">Quick Response</p>
                <p className="text-sm text-muted-foreground mt-1">We respond to all quote requests within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RequestQuote;
