import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, ShoppingBag, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/supabase";
import { toast } from "sonner";

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  processing: "bg-secondary/10 text-secondary",
  shipped: "bg-blue-500/10 text-blue-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-red-500/10 text-red-500",
};

const fmtRWF = (n: number) => `RWF ${Number(n || 0).toLocaleString()}`;

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
        .select("*, items:mika_order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
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
                            {(o.items || []).map((it: any) => (
                              <div key={it.id} className="flex justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                                <span className="truncate">{it.product_name} × {it.quantity}</span>
                                <span className="font-medium shrink-0">{fmtRWF(it.total)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Update Status</p>
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
