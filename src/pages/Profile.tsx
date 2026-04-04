import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { User, Mail, Phone, MapPin, Edit, ShoppingBag, Heart, LogOut, Camera, Package, Eye, ChevronRight, Clock, CheckCircle, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">("profile");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders] = useState<any[]>([
    {
      id: "ORD-001", date: "2026-02-20", status: "Delivered", total: 156990,
      items: [
        { name: "Brake Pad Set - Ceramic", qty: 2, price: 45990, image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop" },
        { name: "Oil Filter - Premium", qty: 1, price: 12990, image: "https://images.unsplash.com/photo-1635784063407-577ca6097e01?w=80&h=80&fit=crop" },
      ],
    },
  ]);
  
  const { profile, updateProfile, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    city: "",
    avatar: ""
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        country: profile.country || "",
        city: profile.city || "",
        avatar: profile.avatar || ""
      });
    }
  }, [profile]);

  // Check authentication status
  useEffect(() => {
    if (!loading && !profile && !user) {
      navigate("/login");
    }
  }, [profile, user, loading, navigate]);

  const handleSave = async () => {
    try {
      await updateProfile(profileForm);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Failed to logout");
    }
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

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Don't render anything if no profile (will redirect)
  if (!profile) {
    return null;
  }

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
                  {profileForm.avatar ? (
                    <img src={profileForm.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 p-1.5 bg-secondary text-secondary-foreground rounded-full shadow-lg">
                    <Camera className="h-3 w-3" />
                  </button>
                </div>
                <h2 className="font-display font-bold text-lg text-foreground mt-3">{profileForm.name || profile.email}</h2>
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
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
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
                      { icon: MapPin, label: "City", field: "city" },
                      { icon: MapPin, label: "Country", field: "country" },
                    ].map(({ icon: Icon, label, field }) => (
                      <div key={field}>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
                        {editing ? (
                          <div className="relative">
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                              value={profileForm[field as keyof typeof profileForm]}
                              onChange={(e) => setProfileForm({ ...profileForm, [field]: e.target.value })}
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 py-2.5">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{profileForm[field as keyof typeof profileForm] || "Not provided"}</span>
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
                    <Link to="/products" className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm">
                      Browse Products
                    </Link>
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

export default Profile; // MAKE SURE THIS LINE EXISTS!