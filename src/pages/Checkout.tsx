import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Lock, ChevronLeft, Check, Truck, Shield } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { supabase } from "@/supabase";
import momoLogo from "@/assets/momo-pay-logo.png";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Copy } from "lucide-react";

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string>("");

  const shipping = 0;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", zip: "", country: "Rwanda",
    momoNumber: "",
    paymentMethod: "momo",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !orderPlaced) {
      navigate("/login?returnTo=/checkout");
    }
  }, [user, navigate, orderPlaced]);

  // Prefill from profile / auth user
  useEffect(() => {
    if (!user) return;
    const fullName = (profile?.name || user.user_metadata?.name || "").trim();
    const [fn, ...rest] = fullName.split(" ");
    setForm((p) => ({
      ...p,
      firstName: p.firstName || fn || "",
      lastName: p.lastName || rest.join(" ") || "",
      email: p.email || user.email || "",
      phone: p.phone || profile?.phone || "",
      address: p.address || profile?.address || "",
      city: p.city || profile?.city || "",
      country: profile?.country || p.country,
    }));
  }, [user, profile]);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const shippingValid =
    form.firstName.trim() && form.lastName.trim() && form.email.trim() &&
    form.phone.trim() && form.address.trim() && form.city.trim() &&
    form.zip.trim() && form.country.trim();

  const paymentValid = form.paymentMethod === "momo" && form.momoNumber.trim();

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/login?returnTo=/checkout");
      return;
    }

    // Basic validation
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.address || !form.city) {
      toast.error("Please fill in all required shipping fields");
      return;
    }

    setProcessing(true);
    try {
      // Generate unique order number
      const orderNumber = `MG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('mika_orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          zip: form.zip,
          country: form.country,
          subtotal: subtotal,
          shipping_cost: shipping,
          tax: tax,
          total: total,
          payment_method: form.paymentMethod,
          payment_status: 'pending',
          order_status: 'processing'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
        created_at: new Date().toISOString()
      }));

      const { error: itemsError } = await supabase
        .from('mika_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      setPlacedOrderNumber(orderNumber);
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
  } catch (error) {
    console.error('Order placement error:', error);
    const message = error instanceof Error ? error.message : "Failed to place order. Please try again.";
    toast.error(message);
    setProcessing(false);
  }
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
          <p className="text-muted-foreground mb-2">Order #{placedOrderNumber}</p>
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
          <div className="lg:col-span-2">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-xl p-6 shadow-sm border border-border">
              {step === 1 && (
                <>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Truck className="h-5 w-5 text-secondary" /> Shipping Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>First Name <span className="text-red-500">*</span></Label><Input required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="John" /></div>
                    <div><Label>Last Name <span className="text-red-500">*</span></Label><Input required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Doe" /></div>
                    <div><Label>Email <span className="text-red-500">*</span></Label><Input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" /></div>
                    <div><Label>Phone <span className="text-red-500">*</span></Label><Input required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+250 7XX XXX XXX" /></div>
                    <div className="sm:col-span-2"><Label>Address <span className="text-red-500">*</span></Label><Input required value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="KN 4 Ave, Kigali" /></div>
                    <div><Label>City <span className="text-red-500">*</span></Label><Input required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Kigali" /></div>
                    <div><Label>ZIP Code <span className="text-red-500">*</span></Label><Input required value={form.zip} onChange={(e) => update("zip", e.target.value)} placeholder="00000" /></div>
                    <div><Label>Country <span className="text-red-500">*</span></Label><Input required value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="Rwanda" /></div>
                  </div>
                  <Button className="mt-6 w-full sm:w-auto" disabled={!shippingValid} onClick={() => {
                    if (!shippingValid) { toast.error("Please fill in all required shipping fields"); return; }
                    setStep(2);
                  }}>Continue to Payment</Button>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard className="h-5 w-5 text-secondary" /> Payment Method</h2>

                  <div className="mb-6 relative overflow-hidden rounded-2xl border-2 border-[#ffcb05] bg-gradient-to-br from-[#0c3b5e] via-[#0c3b5e] to-[#08294a] p-5 shadow-md">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#ffcb05]/30 blur-2xl" />
                    <div className="relative flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center p-1">
                        <img src={momoLogo} alt="MoMo Pay" width={64} height={64} loading="lazy" className="h-full w-full object-contain" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-lg">MoMo Pay</p>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ffcb05] text-[#0c3b5e] px-2 py-0.5 rounded-full">Selected</span>
                        </div>
                        <p className="text-sm text-white/80 mt-0.5">Pay securely with Mobile Money</p>
                      </div>
                      <Check className="h-6 w-6 text-[#ffcb05]" />
                    </div>
                  </div>

                  <div className="rounded-2xl border-2 border-[#0c3b5e]/20 bg-gradient-to-br from-card to-muted/40 p-5 mb-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Payment Instructions</p>
                    <p className="font-bold text-[#0c3b5e] mb-4 leading-snug">ISHURA NA MOMO PAY K'UBUNTU – MIKA GLOBAL BUSINESS LTD</p>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-background border-2 border-dashed border-[#ffcb05] px-4 py-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">USSD Code</p>
                        <p className="font-mono font-bold text-lg text-[#0c3b5e] tracking-wider">*182*8*1*3529609#</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="shrink-0 border-[#0c3b5e] text-[#0c3b5e] hover:bg-[#0c3b5e] hover:text-white" onClick={() => { navigator.clipboard.writeText(`*182*8*1*3529609*${Math.round(total)}#`); toast.success("Code copied"); }}>
                        <Copy className="h-4 w-4 mr-1" /> Copy
                      </Button>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => {
                              const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
                              if (isMobile) {
                                window.location.href = `tel:*182*8*1*3529609*${Math.round(total)}%23`;
                              } else {
                                toast.info("Open on your mobile phone");
                              }
                            }}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-[#ffcb05] hover:bg-[#e6b800] text-[#0c3b5e] font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] border-2 border-[#0c3b5e]"
                          >
                            <span className="text-xl leading-none">📱</span>
                            <span>Tap to Dial MoMo Pay</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Open on your mobile phone</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div>
                    <Label>Mobile Money Number <span className="text-red-500">*</span></Label>
                    <Input required value={form.momoNumber} onChange={(e) => update("momoNumber", e.target.value)} placeholder="+250 7XX XXX XXX" />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
                    <Button disabled={!paymentValid} onClick={() => {
                      if (!paymentValid) { toast.error("Please enter your Mobile Money number"); return; }
                      setStep(3);
                    }}>After Payment Send Us Your Order</Button>
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
                        <p className="font-semibold text-sm">RWF {(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1 text-sm bg-muted rounded-lg p-4">
                    <p><span className="text-muted-foreground">Ship to:</span> {form.address || "KN 4 Ave"}, {form.city || "Kigali"}</p>
                    <p><span className="text-muted-foreground">Payment:</span> MoMo Pay</p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(2)}><ChevronLeft className="h-4 w-4 mr-1" />Back</Button>
                    <Button onClick={handlePlaceOrder} disabled={processing} className="flex-1 sm:flex-none">
                      {processing ? (
                        <span className="flex items-center gap-2"><span className="h-4 w-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" /> Processing…</span>
                      ) : (
                        <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Place Order — RWF {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border sticky top-24">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span className="text-muted-foreground truncate mr-2">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium">RWF {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>RWF {subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-green-600">Free</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax (18%)</span><span>RWF {tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></div>
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg">
                <span>Total</span><span className="text-secondary">RWF {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
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
