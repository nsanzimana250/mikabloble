import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, ShoppingBag, Loader2, ChevronDown, ChevronUp, Receipt, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/supabase";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
const paymentStatusOptions = ["pending", "paid", "cancelled"];
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  processing: "bg-secondary/10 text-secondary",
  shipped: "bg-blue-500/10 text-blue-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-red-500/10 text-red-500",
  paid: "bg-green-500/10 text-green-600",
};

const fmtRWF = (n: number) => `RWF ${Number(n || 0).toLocaleString()}`;

const generateReceipt = (o: any) => {
  const itemsHtml = (o.items || [])
    .map((it: any) => {
      const img = it.product?.image || it.product?.images?.[0] || "";
      const name = it.product?.name || it.product_name || "";
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${img ? `<img src="${img}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:8px;"/>` : ""}${name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${it.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${fmtRWF(it.product_price)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${fmtRWF(it.total)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Receipt ${o.order_number}</title>
<style>
body{font-family:Arial,sans-serif;color:#222;max-width:780px;margin:24px auto;padding:24px;}
h1{color:#0a3d8f;margin:0;font-size:22px;}
.header{display:flex;justify-content:space-between;border-bottom:2px solid #0a3d8f;padding-bottom:12px;margin-bottom:20px;}
.meta{font-size:12px;color:#555;line-height:1.5;}
.section{margin:16px 0;}
.section h3{margin:0 0 6px;color:#0a3d8f;font-size:13px;text-transform:uppercase;letter-spacing:1px;}
table{width:100%;border-collapse:collapse;margin-top:8px;}
th{background:#0a3d8f;color:#fff;padding:10px 8px;text-align:left;font-size:12px;}
.totals{margin-top:16px;width:100%;}
.totals td{padding:6px 8px;}
.totals .total-row td{border-top:2px solid #0a3d8f;font-weight:bold;font-size:15px;color:#0a3d8f;}
.footer{margin-top:32px;text-align:center;color:#777;font-size:11px;border-top:1px solid #eee;padding-top:12px;}
.badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:10px;text-transform:uppercase;background:#e8f0ff;color:#0a3d8f;margin-left:4px;}
@media print{.noprint{display:none;}}
</style></head><body>
<div class="header">
  <div><h1>MIKA GLOBAL BUSINESS LTD</h1>
  <div class="meta">KN 8 Ave/RN3 and KG 14 Ave, Kigali, Rwanda<br/>info@mikaglobalbusiness.com · +250 793 209 175<br/>www.mikaglobalbusiness.com</div></div>
  <div style="text-align:right;">
    <div style="font-size:20px;font-weight:bold;">RECEIPT</div>
    <div class="meta"># ${o.order_number}<br/>${new Date(o.created_at).toLocaleString()}<br/><span class="badge">${o.order_status}</span><span class="badge">${o.payment_status || "pending"}</span></div>
  </div>
</div>
<div class="section"><h3>Bill To</h3>
<div class="meta"><strong>${o.first_name || ""} ${o.last_name || ""}</strong><br/>${o.email || ""}<br/>${o.phone || ""}<br/>${o.address || ""}, ${o.city || ""}, ${o.country || ""}</div></div>
<div class="section"><h3>Items</h3>
<table><thead><tr><th>Product</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr></thead>
<tbody>${itemsHtml}</tbody></table></div>
<table class="totals">
<tr><td style="text-align:right;">Subtotal:</td><td style="text-align:right;width:140px;">${fmtRWF(o.subtotal)}</td></tr>
<tr><td style="text-align:right;">Tax:</td><td style="text-align:right;">${fmtRWF(o.tax)}</td></tr>
${o.shipping ? `<tr><td style="text-align:right;">Shipping:</td><td style="text-align:right;">${fmtRWF(o.shipping)}</td></tr>` : ""}
<tr class="total-row"><td style="text-align:right;">TOTAL:</td><td style="text-align:right;">${fmtRWF(o.total)}</td></tr></table>
<div class="section"><h3>Payment Method</h3><div class="meta">${(o.payment_method || "").toUpperCase()}</div></div>
<div class="footer">Thank you for your business!<br/>Developed by dev esdras</div>
<div class="noprint" style="text-align:center;margin-top:20px;"><button onclick="window.print()" style="padding:10px 24px;background:#0a3d8f;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;">Print Receipt</button></div>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) { toast.error("Allow pop-ups to view receipt"); return; }
  w.document.write(html);
  w.document.close();
};

const AdminOrders = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mika_orders")
        .select("*, items:mika_order_items(*, product:mika_products(id, name, image, images))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("mika_orders").update({ payment_status: status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment status updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("mika_orders").update({ order_status: status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order status updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("mika_order_items").delete().eq("order_id", id);
      const { error } = await supabase.from("mika_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order deleted");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard-full"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = orders.filter((o: any) => {
    const text = `${o.first_name} ${o.last_name} ${o.order_number} ${o.email}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.order_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const allStatuses = ["All", ...statusOptions];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {allStatuses.map((s) => {
            const count = s === "All" ? orders.length : orders.filter((o: any) => o.order_status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-xl p-3 border text-center transition-all ${statusFilter === s ? "border-secondary bg-secondary/10 shadow-sm" : "border-border bg-card hover:border-muted-foreground/30"}`}>
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-muted-foreground capitalize">{s}</p>
              </button>
            );
          })}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search by customer, email or order #..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o: any) => (
              <div key={o.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{o.first_name} {o.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{o.order_number}</p>
                    </div>
                    <p className="text-xs text-muted-foreground hidden sm:block">{new Date(o.created_at).toLocaleDateString()}</p>
                    <p className="text-sm font-bold">{fmtRWF(o.total)}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize w-fit ${statusColors[o.order_status]}`}>{o.order_status}</span>
                  </div>
                  {expanded === o.id ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </div>

                <AnimatePresence>
                  {expanded === o.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                        <div className="grid sm:grid-cols-3 gap-3 text-sm">
                          <div><p className="text-xs text-muted-foreground">Email</p><p className="truncate">{o.email}</p></div>
                          <div><p className="text-xs text-muted-foreground">Phone</p><p>{o.phone}</p></div>
                          <div><p className="text-xs text-muted-foreground">Address</p><p className="truncate">{o.address}, {o.city}, {o.country}</p></div>
                          <div><p className="text-xs text-muted-foreground">Payment</p><p className="capitalize">{o.payment_method} ({o.payment_status})</p></div>
                          <div><p className="text-xs text-muted-foreground">Subtotal</p><p>{fmtRWF(o.subtotal)}</p></div>
                          <div><p className="text-xs text-muted-foreground">Tax</p><p>{fmtRWF(o.tax)}</p></div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Items</p>
                          <div className="space-y-2">
                            {(o.items || []).map((it: any) => {
                              const img = it.product?.image || it.product?.images?.[0] || "/placeholder.svg";
                              return (
                                <div key={it.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-2">
                                  <img
                                    src={img}
                                    alt={it.product_name}
                                    className="h-14 w-14 rounded-md object-cover bg-background shrink-0"
                                    onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.svg")}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{it.product_name}</p>
                                    <p className="text-xs text-muted-foreground">Qty: {it.quantity} · {fmtRWF(it.product_price)}</p>
                                  </div>
                                  <span className="font-semibold text-sm shrink-0">{fmtRWF(it.total)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Order Status</p>
                            <div className="flex flex-wrap gap-2">
                              {statusOptions.map((s) => (
                                <button
                                  key={s}
                                  disabled={updateStatus.isPending || o.order_status === s}
                                  onClick={() => updateStatus.mutate({ id: o.id, status: s })}
                                  className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${o.order_status === s ? statusColors[s] : "bg-muted hover:bg-muted/70"}`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Payment Status</p>
                            <div className="flex flex-wrap gap-2">
                              {paymentStatusOptions.map((s) => (
                                <button
                                  key={s}
                                  disabled={updatePayment.isPending || o.payment_status === s}
                                  onClick={() => updatePayment.mutate({ id: o.id, status: s })}
                                  className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${o.payment_status === s ? statusColors[s] : "bg-muted hover:bg-muted/70"}`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <button
                            onClick={() => generateReceipt(o)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
                          >
                            <Receipt className="h-4 w-4" /> Generate Receipt
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
                <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No orders found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
