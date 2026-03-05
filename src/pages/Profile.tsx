import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { User, Mail, Phone, MapPin, Edit, ShoppingBag, Heart, LogOut, Camera, Package, Eye, ChevronRight, Clock, CheckCircle, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">("profile");
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+250 788 000 000",
    address: "KN 4 Ave, Kigali City, Rwanda",
  });

  const orders = [
    {
      id: "ORD-001", date: "2026-02-20", status: "Delivered", total: 156990,
      items: [
        { name: "Brake Pad Set - Ceramic", qty: 2, price: 45990, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop" },
        { name: "Oil Filter - Premium", qty: 1, price: 12990, image: "https://images.unsplash.com/photo-1635784063407-577ca6097e01?w=80&h=80&fit=crop" },
      ],
    },
    {
      id: "ORD-002", date: "2026-02-18", status: "Shipped", total: 89500,
      items: [
        { name: "Alternator Assembly", qty: 1, price: 89500, image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=80&h=80&fit=crop" },
      ],
    },
    {
      id: "ORD-003", date: "2026-02-10", status: "Processing", total: 234000,
      items: [
        { name: "Suspension Kit - Complete", qty: 1, price: 189000, image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=80&h=80&fit=crop" },
        { name: "Shock Absorber - Front", qty: 2, price: 22500, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop" },
      ],
    },
  ];

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const handleSave = () => {
    setEditing(false);
    toast.success("Profile updated successfully!");
  };

  const statusIcon = (status: string) => {
    if (status === "Delivered") return <CheckCircle className="h-4 w-4" />;
    if (status === "Shipped") return <Truck className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const statusColor = (status: string) => {
    if (status === "Delivered") return "bg-green-100 text-green-700";
    if (status === "Shipped") return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <Layout>
      <section className="gradient-hero py-16">
        <div className="section-container text-center">
          <h1 className="font-display font-black text-4xl text-primary-foreground">My Profile</h1>
        </div>
      </section>

      <section className="py-12">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl p-6 shadow-[var(--card-shadow)] h-fit">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-secondary text-secondary-foreground rounded-full shadow-lg">
                    <Camera className="h-3 w-3" />
                  </button>
                </div>
                <h2 className="font-display font-bold text-lg text-foreground mt-3">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>

              <nav className="space-y-1">
                {([
                  { icon: User, label: "Profile Info", tab: "profile" as const },
                  { icon: ShoppingBag, label: "My Orders", tab: "orders" as const },
                  { icon: Heart, label: "Wishlist", tab: "wishlist" as const },
                ] as const).map(({ icon: Icon, label, tab }) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
                <Link to="/login" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </Link>
              </nav>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-8">
              {activeTab === "profile" && (
                <div className="bg-card rounded-2xl p-6 shadow-[var(--card-shadow)]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display font-bold text-lg text-foreground">Personal Information</h3>
                    <button onClick={() => editing ? handleSave() : setEditing(true)} className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:underline">
                      <Edit className="h-4 w-4" /> {editing ? "Save" : "Edit"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: User, label: "Full Name", field: "name" },
                      { icon: Mail, label: "Email", field: "email" },
                      { icon: Phone, label: "Phone", field: "phone" },
                      { icon: MapPin, label: "Address", field: "address" },
                    ].map(({ icon: Icon, label, field }) => (
                      <div key={field}>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
                        {editing ? (
                          <div className="relative">
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              value={profile[field as keyof typeof profile]}
                              onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 py-2.5">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{profile[field as keyof typeof profile]}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div className="bg-card rounded-2xl p-6 shadow-[var(--card-shadow)]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display font-bold text-lg text-foreground">My Orders</h3>
                      <span className="text-sm text-muted-foreground">{orders.length} orders</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { label: "Total Orders", value: orders.length, color: "bg-primary/10 text-primary" },
                        { label: "Delivered", value: orders.filter(o => o.status === "Delivered").length, color: "bg-green-100 text-green-700" },
                        { label: "In Progress", value: orders.filter(o => o.status !== "Delivered").length, color: "bg-yellow-100 text-yellow-700" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
                          <div className="font-display font-bold text-2xl">{value}</div>
                          <div className="text-xs mt-1 opacity-80">{label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-border rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                <Package className="h-5 w-5 text-primary" />
                              </div>
                              <div className="text-left">
                                <span className="font-semibold text-sm text-foreground block">{order.id}</span>
                                <span className="text-xs text-muted-foreground">{order.date} · {order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${statusColor(order.status)}`}>
                                {statusIcon(order.status)} {order.status}
                              </span>
                              <span className="font-bold text-sm text-foreground hidden sm:block">RWF {order.total.toLocaleString()}</span>
                              <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedOrder === order.id ? "rotate-90" : ""}`} />
                            </div>
                          </button>

                          {expandedOrder === order.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              className="border-t border-border"
                            >
                              <div className="p-4 space-y-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">RWF {(item.price * item.qty).toLocaleString()}</span>
                                  </div>
                                ))}

                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                  <div className="flex gap-2">
                                    <button className="text-xs text-secondary hover:underline flex items-center gap-1">
                                      <Eye className="h-3 w-3" /> View Invoice
                                    </button>
                                    <button className="text-xs text-secondary hover:underline flex items-center gap-1">
                                      <Truck className="h-3 w-3" /> Track Shipment
                                    </button>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs text-muted-foreground">Total: </span>
                                    <span className="font-bold text-foreground">RWF {order.total.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "wishlist" && (
                <div className="bg-card rounded-2xl p-6 shadow-[var(--card-shadow)]">
                  <h3 className="font-display font-bold text-lg text-foreground mb-4">My Wishlist</h3>
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Your wishlist is empty.</p>
                    <Link to="/products" className="btn-primary inline-block mt-4 text-sm">Browse Products</Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
