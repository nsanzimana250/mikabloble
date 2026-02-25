import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Lock, ChevronLeft, Check, Truck, Shield } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", zip: "", country: "Rwanda",
    cardNumber: "", cardName: "", expiry: "", cvv: "",
    paymentMethod: "card",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handlePlaceOrder = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setOrderPlaced(true);
      clearCart();
      toast.success("Order placed successfully!");
    }, 2500);
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <Layout>
        <div className="section-container py-20 text-center">
          <h1 className="section-title mb-4">Your cart is empty</h1>
          <Link to="/products"><Button>Browse Products</Button></Link>
        </div>
      </Layout>
    );
  }

  if (orderPlaced) {
    return (
      <Layout>
        <div className="section-container py-20 flex flex-col items-center text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="section-title mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-2">Order #MG-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
          <p className="text-muted-foreground mb-8 max-w-md">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
          <div className="flex gap-4">
            <Link to="/"><Button variant="outline">Back to Home</Button></Link>
            <Link to="/products"><Button>Continue Shopping</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-container py-8 md:py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {["Shipping", "Payment", "Review"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < 2 && <div className={`w-8 sm:w-16 h-0.5 ${step > i + 1 ? "bg-green-500" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl p-6 shadow-sm border border-border">
              {step === 1 && (
                <>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Truck className="h-5 w-5 text-secondary" /> Shipping Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>First Name</Label><Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="John" /></div>
                    <div><Label>Last Name</Label><Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Doe" /></div>
                    <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" /></div>
                    <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+250 7XX XXX XXX" /></div>
                    <div className="sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="KN 4 Ave, Kigali" /></div>
                    <div><Label>City</Label><Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Kigali" /></div>
                    <div><Label>ZIP Code</Label><Input value={form.zip} onChange={(e) => update("zip", e.target.value)} placeholder="00000" /></div>
                  </div>
                  <Button className="mt-6 w-full sm:w-auto" onClick={() => setStep(2)}>Continue to Payment</Button>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard className="h-5 w-5 text-secondary" /> Payment Method</h2>
                  {/* Payment method selector */}
                  <div className="grid sm:grid-cols-3 gap-3 mb-6">
                    {[
                      { id: "card", label: "Credit Card" },
                      { id: "momo", label: "Mobile Money" },
                      { id: "bank", label: "Bank Transfer" },
                    ].map((m) => (
                      <button key={m.id} onClick={() => update("paymentMethod", m.id)} className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${form.paymentMethod === m.id ? "border-secondary bg-secondary/10 text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground"}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {form.paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div><Label>Card Number</Label><Input value={form.cardNumber} onChange={(e) => update("cardNumber", e.target.value)} placeholder="4242 4242 4242 4242" /></div>
                      <div><Label>Name on Card</Label><Input value={form.cardName} onChange={(e) => update("cardName", e.target.value)} placeholder="John Doe" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Expiry</Label><Input value={form.expiry} onChange={(e) => update("expiry", e.target.value)} placeholder="MM/YY" /></div>
                        <div><Label>CVV</Label><Input value={form.cvv} onChange={(e) => update("cvv", e.target.value)} placeholder="123" /></div>
                      </div>
                    </div>
                  )}
                  {form.paymentMethod === "momo" && (
                    <div><Label>Mobile Money Number</Label><Input placeholder="+250 7XX XXX XXX" /></div>
                  )}
                  {form.paymentMethod === "bank" && (
                    <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">Bank Transfer Details</p>
                      <p>Bank: Bank of Kigali</p><p>Account: MIKA GLOBLE BUSINESS LTD</p><p>SWIFT: BKIGRWRW</p><p>Account No: 100-XXXX-XXXX</p>
                    </div>
                  )}
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
                    <Button onClick={() => setStep(3)}>Review Order</Button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Shield className="h-5 w-5 text-secondary" /> Order Review</h2>
                  <div className="divide-y divide-border">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-4 py-4">
                        <img src={item.product.image} alt={item.product.name} className="h-16 w-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product.name}</p>
                          <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1 text-sm bg-muted rounded-lg p-4">
                    <p><span className="text-muted-foreground">Ship to:</span> {form.address || "KN 4 Ave"}, {form.city || "Kigali"}</p>
                    <p><span className="text-muted-foreground">Payment:</span> {form.paymentMethod === "card" ? "Credit Card" : form.paymentMethod === "momo" ? "Mobile Money" : "Bank Transfer"}</p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
                    <Button onClick={handlePlaceOrder} disabled={processing} className="flex-1 sm:flex-none">
                      {processing ? (
                        <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" /> Processing…</span>
                      ) : (
                        <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Place Order — ${total.toFixed(2)}</span>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border sticky top-24">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span className="text-muted-foreground truncate mr-2">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax (18%)</span><span>${tax.toFixed(2)}</span></div>
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span><span className="text-secondary">${total.toFixed(2)}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" /> Secure checkout · SSL encrypted
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
