import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { motion } from "framer-motion";
import { supabase } from "@/supabase";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, sign in with Supabase
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (!authData.user) {
        throw new Error("No user found");
      }

      // Check if user has admin role in mika_users table
      const { data: userProfile, error: profileError } = await supabase
        .from("mika_users")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw profileError;

      console.log("Admin login - user role:", userProfile?.role);

      // Verify role is admin
      if (userProfile?.role !== "admin") {
        // Redirect to home page if not admin
        console.log("Admin login - non-admin user, redirecting to home");
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        setLoading(false);
        return;
      }

      // Store admin session info
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("adminEmail", email);

      console.log("Admin login - admin user, redirecting to dashboard");
      toast.success(`Welcome back, ${userProfile.role}!`);
      navigate("/admin");
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-[0_8px_40px_-12px_hsl(224_76%_33%/0.25)] border border-border p-8">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={logo} alt="MIKA GLOBAL" className="h-12 mx-auto mb-4" />
            </Link>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Portal
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in with your admin credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10" 
                  type="email" 
                  placeholder="admin@mikaglobal.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Verifying admin access...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to website
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;