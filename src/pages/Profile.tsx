import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { User, Phone, MapPin, Edit, ShoppingBag, LogOut, Camera, Package, ChevronRight, Clock, CheckCircle, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase";

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

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
        .select(`*, items:mika_order_items(*)`)
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

  useEffect(() => {
    if (!profile) {
      navigate("/login");
    }
  }, [profile, navigate]);

  const handleSave = async () => {
    try {
      await updateProfile(profileForm);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
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

  if (!profile) return null;

  return (
    <Layout>
      <section className="gradient-hero py-16 text-center">
        <h1 className="font-display font-black text-4xl text-primary-foreground">
          My Profile
        </h1>
      </section>

      <section className="py-12">
        <div className="section-container grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl p-6 shadow h-fit">

            <div className="text-center mb-6">
              {profileForm.avatar ? (
                <img src={profileForm.avatar} className="w-24 h-24 rounded-full mx-auto" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
              <h2 className="font-bold mt-3">{profileForm.name || profile.email}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              <button onClick={() => setActiveTab("profile")} className="btn">Profile</button>
              <button onClick={() => setActiveTab("orders")} className="btn">Orders</button>
              <button onClick={handleLogout} className="btn text-red-500">Logout</button>
            </nav>
          </motion.div>

          {/* Content */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2">

            {/* PROFILE */}
            {activeTab === "profile" && (
              <div className="bg-card p-6 rounded-2xl shadow">
                <div className="flex justify-between mb-4">
                  <h3>Personal Info</h3>
                  <button onClick={() => editing ? handleSave() : setEditing(true)}>
                    {editing ? "Save" : "Edit"}
                  </button>
                </div>

                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  disabled={!editing}
                  placeholder="Name"
                  className="border p-2 rounded w-full"
                />
              </div>
            )}

            {/* ORDERS */}
            {activeTab === "orders" && (
              <div className="bg-card p-6 rounded-2xl shadow">
                <h3 className="mb-4">My Orders ({orders.length})</h3>

                {orders.length === 0 ? (
                  <p>No orders yet</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="border p-4 mb-3 rounded">
                      <div className="flex justify-between">
                        <span>{order.id}</span>
                        <span>{order.total} RWF</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;