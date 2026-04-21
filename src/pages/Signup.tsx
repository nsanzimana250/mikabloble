import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Mail, Lock, Eye, EyeOff, UserPlus, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { supabase } from "@/supabase"; // Fixed import path

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setEmailError(null);
    setIsLoading(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setEmailError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Password validation
    if (form.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
          },
        },
      });

      if (authError) {
        console.error("Signup error:", authError);
        
        if (authError.message.includes("User already registered")) {
          setEmailError("User with this email already exists");
        } else {
          setEmailError(authError.message);
        }
        
        toast.error(authError.message);
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        toast.success("Account created successfully! Please sign in.");

        // Redirect to login
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.success("Please check your email to confirm your account!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Signup exception:", err);
      setEmailError("An unexpected error occurred. Please try again.");
      toast.error("Failed to create account");
      setIsLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (field === "email") {
      setEmailError(null);
    }
    if (field === "password" || field === "confirmPassword") {
      setPasswordError(null);
    }
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
              <img src={logo} alt="MIKA GLOBAL" className="h-16 mx-auto mb-4" />
              <h1 className="font-display font-bold text-2xl text-foreground">Create Account</h1>
              <p className="text-muted-foreground text-sm mt-1">Join MIKA GLOBAL today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={(e) => update("name", e.target.value)} 
                    placeholder="John Doe" 
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary" 
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => update("email", e.target.value)} 
                    placeholder="you@example.com" 
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${
                      emailError ? 'border-red-500' : 'border-border bg-background'
                    }`} 
                    required 
                    disabled={isLoading}
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
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
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${
                      passwordError ? 'border-red-500' : 'border-border bg-background'
                    }`} 
                    required 
                    minLength={6} 
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

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="password" 
                    value={form.confirmPassword} 
                    onChange={(e) => update("confirmPassword", e.target.value)} 
                    placeholder="••••••••" 
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${
                      passwordError ? 'border-red-500' : 'border-border bg-background'
                    }`} 
                    required 
                    disabled={isLoading}
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}

              <button 
                type="submit" 
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Create Account
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-secondary font-semibold hover:underline">Sign In</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Signup;