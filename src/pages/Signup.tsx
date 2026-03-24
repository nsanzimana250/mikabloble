import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Mail, Lock, Eye, EyeOff, UserPlus, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const { signUp, error, clearError, loading } = useAuth();
  const navigate = useNavigate();

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     clearError();
     setPasswordError(null);
     setEmailError(null);

     // Email validation
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(form.email)) {
       setEmailError("Please enter a valid email address");
       return;
     }

     // Password validation
     if (form.password.length < 6) {
       setPasswordError("Password must be at least 6 characters");
       return;
     }

     if (form.password !== form.confirmPassword) {
       setPasswordError("Passwords do not match!");
       return;
     }

     await signUp(form.email, form.password, form.name);
     if (error) {
       // error is set by the auth context, so we return and let the error display section show it
       return;
     }
     toast.success("Account created successfully! Please check your email to confirm your account.");
     navigate("/login");
   };

   // Display error from auth context (use effect to avoid state updates during render)
   useEffect(() => {
     if (error) {
       toast.error(error);
       clearError();
     }
   }, [error, clearError]);

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (field === "email") {
      setEmailError(null);
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
              <img src={logo} alt="MIKA GLOBLE" className="h-16 mx-auto mb-4" />
              <h1 className="font-display font-bold text-2xl text-foreground">Create Account</h1>
              <p className="text-muted-foreground text-sm mt-1">Join MIKA GLOBLE today</p>
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
                    value={form.password} 
                    onChange={(e) => update("password", e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary" 
                    required 
                    minLength={6} 
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

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="password" 
                    value={form.confirmPassword} 
                    onChange={(e) => update("confirmPassword", e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary" 
                    required 
                  />
                </div>
              </div>

              {/* Display password validation errors */}
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}

               <button 
                 type="submit" 
                 disabled={loading}
                 className="btn-primary w-full flex items-center justify-center gap-2"
               >
                 {loading ? (
                   <>
                     <UserPlus className="h-4 w-4" />
                     Creating account...
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