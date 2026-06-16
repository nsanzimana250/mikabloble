import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { User, Phone, MapPin, Edit, ShoppingBag, LogOut, Camera, Package, ChevronRight, Clock, CheckCircle, Truck, Mail, Map, Building, Globe, Save, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase";
import { SEOHelmet } from "@/seo";
import { pageSEO } from "@/seo";

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const { profile, updateProfile, signOut, user } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    country: "",
    city: "",
    avatar: ""
  });

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("mika_orders")
        .select(`*, items:mika_order_items(*, product:mika_products(id, name, image, images, brand, category))`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedOrders =
        data?.map((order) => ({
          id: order.order_number,
          date: new Date(order.created_at).toLocaleDateString(),
          status: order.order_status,
          total: order.total,
          items: order.items || []
        })) || [];

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        country: profile.country || "",
        city: profile.city || "",
        avatar: profile.avatar || ""
      });
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === "orders" && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  // Note: route is already wrapped in <ProtectedRoute>, so auth is guaranteed.
  // Do NOT redirect on missing profile — it may still be loading after refresh.

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setProfileForm({ ...profileForm, avatar: publicUrl });
      toast.success("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(profileForm);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setProfileForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      country: profile?.country || "",
      city: profile?.city || "",
      avatar: profile?.avatar || ""
    });
    setEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!profile) return null;

  return (
    <Layout>
      <SEOHelmet seo={pageSEO.profile} />
      <section className="gradient-hero py-16 text-center">
        <h1 className="font-display font-black text-4xl text-primary-foreground">
          My Profile
        </h1>
        <p className="text-primary-foreground/80 mt-2">Manage your account and orders</p>
      </section>

      <section className="py-12">
        <div className="section-container grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl p-6 shadow-lg h-fit border border-border"
          >
            <div className="text-center mb-6 relative group">
              {profileForm.avatar ? (
                <div className="relative inline-block">
                  <img 
                    src={profileForm.avatar} 
                    alt={profileForm.name || "Avatar"}
                    className="w-28 h-28 rounded-full object-cover border-4 border-primary/20"
                  />
                  {editing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              ) : (
                <div className="relative inline-block">
                  <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  {editing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              )}
              <h2 className="font-bold mt-3 text-lg">{profileForm.name || "User"}</h2>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Mail className="h-3 w-3" /> {user?.email}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                {profile.role || 'user'}
              </span>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === "profile" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
              >
                <User className="h-4 w-4" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                  activeTab === "orders" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-accent"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                My Orders
                {orders.length > 0 && (
                  <span className="ml-auto bg-primary/20 px-2 py-0.5 rounded-full text-xs">
                    {orders.length}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-3 text-red-500 hover:bg-red-50 mt-4"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </motion.div>

          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="lg:col-span-2"
          >

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                  <h3 className="font-bold text-xl">Personal Information</h3>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors flex items-center gap-2"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" /> Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      disabled={!editing}
                      className={`w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        !editing && "bg-muted/30"
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-border bg-muted/30 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      disabled={!editing}
                      className={`w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        !editing && "bg-muted/30"
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Street Address
                    </label>
                    <textarea
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      disabled={!editing}
                      rows={2}
                      className={`w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${
                        !editing && "bg-muted/30"
                      }`}
                      placeholder="Enter your street address"
                    />
                  </div>

                  {/* City and Country - Two columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" /> City
                      </label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        disabled={!editing}
                        className={`w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          !editing && "bg-muted/30"
                        }`}
                        placeholder="Enter your city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" /> Country
                      </label>
                      <select
                        value={profileForm.country}
                        onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                        disabled={!editing}
                        className={`w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          !editing && "bg-muted/30"
                        }`}
                      >
                        <option value="">Select Country</option>
                        <option value="Rwanda">Rwanda</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    My Orders ({orders.length})
                  </h3>
                </div>

                <div className="p-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                      <Link to="/products" className="btn-primary inline-block mt-4">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-border rounded-lg overflow-hidden">
                          <div 
                            className="p-4 bg-accent/20 cursor-pointer hover:bg-accent/30 transition-colors"
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          >
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(order.status)}
                                <div>
                                  <p className="font-semibold">Order #{order.id.slice(-8)}</p>
                                  <p className="text-sm text-muted-foreground">{order.date}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {order.status}
                                </span>
                                <span className="font-bold text-primary">{order.total.toLocaleString()} RWF</span>
                                <ChevronRight className={`h-5 w-5 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
                              </div>
                            </div>
                          </div>
                          
                          {expandedOrder === order.id && (
                            <div className="p-4 border-t border-border bg-background">
                              <h4 className="font-semibold mb-3">Order Items</h4>
                              <div className="space-y-3">
                                {order.items?.map((item: any, idx: number) => {
                                  const img = item.product?.image || item.product?.images?.[0] || "/placeholder.svg";
                                  const name = item.product?.name || item.product_name || `Product #${item.product_id}`;
                                  const price = item.product_price ?? item.unit_price ?? 0;
                                  const lineTotal = item.total ?? price * item.quantity;
                                  return (
                                    <Link
                                      to={item.product?.id ? `/products/${item.product.id}` : "#"}
                                      key={idx}
                                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                                    >
                                      <img
                                        src={img}
                                        alt={name}
                                        className="h-16 w-16 rounded-md object-cover bg-muted shrink-0"
                                        onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.svg")}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{name}</p>
                                        {item.product?.brand && (
                                          <p className="text-xs text-muted-foreground truncate">
                                            {item.product.brand}{item.product.category ? ` · ${item.product.category}` : ""}
                                          </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          Qty: {item.quantity} × {Number(price).toLocaleString()} RWF
                                        </p>
                                      </div>
                                      <span className="font-semibold text-sm shrink-0">
                                        {Number(lineTotal).toLocaleString()} RWF
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;