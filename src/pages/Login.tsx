import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { supabase } from "@/supabase";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      
      if (error) {
        setError("Invalid email or password");
        toast.error("Login failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast.success("Login successful!");
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate("/profile");
        }, 100);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      toast.error("Login failed");
      setIsLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (error) setError(null);
  };

  return (
    <Layout>
      <section className="py-16 min-h-[80vh] flex items-center">
        <div className="section-container w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 shadow-[var(--card-shadow)]"
          >
            <div className="text-center mb-8">
              <img src={logo} alt="MIKA GLOBLE" className="h-16 mx-auto mb-4" />
              <h1 className="font-display font-bold text-2xl text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => update("email", e.target.value)} 
                    placeholder="you@example.com" 
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary" 
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={form.password} 
                    onChange={(e) => update("password", e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary" 
                    required 
                    disabled={isLoading}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}

              <button 
                type="submit" 
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" /> Sign In
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-secondary font-semibold hover:underline">Create Account</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;