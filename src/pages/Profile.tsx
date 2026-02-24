import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { User, Mail, Phone, MapPin, Edit, ShoppingBag, Heart, LogOut, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+250 788 000 000",
    address: "KN 4 Ave, Kigali City, Rwanda",
  });

  const orders = [
    { id: "ORD-001", date: "2026-02-20", status: "Delivered", total: 156.99 },
    { id: "ORD-002", date: "2026-02-18", status: "Shipped", total: 89.50 },
    { id: "ORD-003", date: "2026-02-10", status: "Processing", total: 234.00 },
  ];

  const handleSave = () => {
    setEditing(false);
    toast.success("Profile updated successfully!");
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
            {/* Sidebar */}
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
                {[
                  { icon: User, label: "Profile Info", active: true },
                  { icon: ShoppingBag, label: "My Orders" },
                  { icon: Heart, label: "Wishlist" },
                ].map(({ icon: Icon, label, active }) => (
                  <button key={label} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
                <Link to="/login" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </Link>
              </nav>
            </motion.div>

            {/* Main Content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-8">
              {/* Profile Info */}
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

              {/* Orders */}
              <div className="bg-card rounded-2xl p-6 shadow-[var(--card-shadow)]">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <span className="font-semibold text-sm text-foreground">{order.id}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        order.status === "Delivered" ? "bg-green-100 text-green-700" :
                        order.status === "Shipped" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status}
                      </span>
                      <span className="font-semibold text-sm text-foreground">${order.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
