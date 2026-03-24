import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, error, clearError, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear previous errors
    
    await signIn(email, password);
    if (error) {
      // error is set by the auth context, so we return and let the error display section show it
      return;
    }
    toast.success("Login successful! Welcome back.");
    navigate("/profile");
  };

  // Display error from auth context (use effect to avoid state updates during render)
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError(); // Clear after showing
    }
  }, [error, clearError]);

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border" 
                  />
                  Remember me
                </label>
                <a href="#" className="text-secondary hover:underline">Forgot password?</a>
              </div>

               <button
                 type="submit"
                 disabled={loading}
                 className="btn-primary w-full flex items-center justify-center gap-2"
               >
                 {loading ? (
                   <>
                     <LogIn className="h-4 w-4" />
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
              <Link to="/signup" className="text-secondary font-semibold hover:underline">Sign Up</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;