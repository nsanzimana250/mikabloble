import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Mail, Lock, Eye, EyeOff, UserPlus, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import logo from "@/assets/logo.png";
import { supabase } from "@/supabase";

const Signup = () => {
  const { t } = useTranslation();
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setEmailError(t("auth.invalidEmail"));
      setIsLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setPasswordError(t("auth.passwordMin"));
      setIsLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setPasswordError(t("auth.passwordMismatch"));
      setIsLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name },
        },
      });

      if (authError) {
        if (authError.message.includes("User already registered")) {
          setEmailError(t("auth.userExists"));
        } else {
          setEmailError(authError.message);
        }
        toast.error(authError.message);
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        toast.success(t("auth.accountCreated"));
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.success(t("auth.checkEmail"));
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err: any) {
      console.error("Signup exception:", err);
      setEmailError(t("auth.unexpected"));
      toast.error(t("auth.failedCreate"));
      setIsLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (field === "email") setEmailError(null);
    if (field === "password" || field === "confirmPassword") setPasswordError(null);
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
              <h1 className="font-display font-bold text-2xl text-foreground">{t("auth.createAccount")}</h1>
              <p className="text-muted-foreground text-sm mt-1">{t("auth.createAccountDesc")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t("auth.fullName")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder={t("auth.namePlaceholder")}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t("auth.email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder={t("auth.emailPlaceholder")}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${emailError ? 'border-red-500' : 'border-border bg-background'}`}
                    required
                    disabled={isLoading}
                  />
                </div>
                {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t("auth.password")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${passwordError ? 'border-red-500' : 'border-border bg-background'}`}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                    aria-label={t("auth.password")}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">{t("auth.confirmPassword")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-secondary ${passwordError ? 'border-red-500' : 'border-border bg-background'}`}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("auth.creatingAccount")}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> {t("auth.signUp")}
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("auth.haveAccount")}{" "}
              <Link to="/login" className="text-secondary font-semibold hover:underline">{t("auth.signIn")}</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Signup;
