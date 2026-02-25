import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, CalendarCheck, Eye, ChevronDown, ChevronUp, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Booking {
  id: string;
  customer: string;
  email: string;
  phone: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
  address: string;
}

const mockBookings: Booking[] = [
  { id: "MG-7A2F", customer: "Jean Mugabo", email: "jean@gmail.com", phone: "+250 788 123 456", items: [{ name: "Ceramic Brake Pad Set", qty: 2, price: 45.99 }, { name: "Oil Filter", qty: 4, price: 12.99 }], total: 143.94, status: "Delivered", date: "2026-02-25", address: "KN 3 St, Kigali" },
  { id: "MG-8B3C", customer: "Alice Uwase", email: "alice@gmail.com", phone: "+250 722 456 789", items: [{ name: "LED Headlight Kit", qty: 1, price: 34.99 }, { name: "Spark Plug Set", qty: 2, price: 24.99 }], total: 84.97, status: "Shipped", date: "2026-02-24", address: "KG 11 Ave, Kigali" },
  { id: "MG-9D4E", customer: "Patrick Nkusi", email: "patrick@yahoo.com", phone: "+250 733 789 012", items: [{ name: "Alternator Assembly", qty: 1, price: 189.99 }], total: 189.99, status: "Processing" as any, date: "2026-02-24", address: "KK 15 Rd, Kigali" },
  { id: "MG-1F5G", customer: "Grace Muhire", email: "grace@outlook.com", phone: "+250 788 345 678", items: [{ name: "Shock Absorber Pair", qty: 1, price: 79.99 }, { name: "Air Filter", qty: 3, price: 15.99 }], total: 127.96, status: "Pending", date: "2026-02-23", address: "Musanze, Rwanda" },
  { id: "MG-2H6J", customer: "Eric Habimana", email: "eric@gmail.com", phone: "+250 722 567 890", items: [{ name: "Side Mirror Assembly", qty: 2, price: 65.99 }], total: 131.98, status: "Confirmed", date: "2026-02-22", address: "Huye, Rwanda" },
  { id: "MG-3K7L", customer: "Claudine Ingabire", email: "claudine@gmail.com", phone: "+250 733 234 567", items: [{ name: "Spark Plug Set", qty: 5, price: 24.99 }], total: 124.95, status: "Cancelled", date: "2026-02-21", address: "Rubavu, Rwanda" },
];

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-500/10 text-yellow-600",
  Confirmed: "bg-primary/10 text-primary",
  Processing: "bg-secondary/10 text-secondary",
  Shipped: "bg-blue-500/10 text-blue-600",
  Delivered: "bg-green-500/10 text-green-600",
  Cancelled: "bg-red-500/10 text-red-500",
};

const AdminBookings = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const statuses = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
  const filtered = mockBookings.filter((b) => {
    const matchSearch = b.customer.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {statuses.map((s) => {
            const count = s === "All" ? mockBookings.length : mockBookings.filter((b) => b.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-xl p-3 border text-center transition-all ${statusFilter === s ? "border-secondary bg-secondary/10 shadow-sm" : "border-border bg-card hover:border-muted-foreground/30"}`}>
                <p className="text-lg font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{s}</p>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search bookings…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Bookings */}
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                  <div>
                    <p className="font-semibold text-sm truncate">{b.customer}</p>
                    <p className="text-xs text-muted-foreground">{b.id}</p>
                  </div>
                  <p className="text-sm text-muted-foreground hidden sm:block">{b.date}</p>
                  <p className="text-sm font-bold">${b.total.toFixed(2)}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium w-fit ${statusColors[b.status]}`}>{b.status}</span>
                </div>
                {expanded === b.id ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </div>

              <AnimatePresence>
                {expanded === b.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div><p className="text-xs text-muted-foreground">Email</p><p>{b.email}</p></div>
                        <div><p className="text-xs text-muted-foreground">Phone</p><p>{b.phone}</p></div>
                        <div><p className="text-xs text-muted-foreground">Address</p><p>{b.address}</p></div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Items</p>
                        <div className="space-y-2">
                          {b.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                              <span>{item.name} × {item.qty}</span>
                              <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                            </div>
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
              <CalendarCheck className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No bookings found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;
