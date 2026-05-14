import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, MessageSquare, LogOut, Menu, ChevronRight, ShoppingBag, Users, Mail, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const navItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Contacts", path: "/admin/contacts", icon: MessageSquare },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, profile } = useAuth();
  const adminEmail = user?.email || profile?.email || localStorage.getItem("adminEmail") || "admin@mika.com";
  const adminName = profile?.name || user?.user_metadata?.name || adminEmail.split("@")[0];
  const initial = (adminName || "A").charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("adminEmail");
      toast.success("Logged out");
      navigate("/admin/login", { replace: true });
    } catch {
      toast.error("Failed to logout");
    }
  };

  const currentPage = navItems.find((i) => i.path === location.pathname)?.name || "Dashboard";

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar - fixed on all screens */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 shrink-0 bg-primary text-primary-foreground flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-primary-foreground/10">
          <Link to="/admin" className="block" aria-label="Admin dashboard home">
            <img src={logo} alt="MIKA GLOBAL" width="180" height="40" className="h-10 brightness-0 invert" />
          </Link>
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/50 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? "bg-primary-foreground text-primary shadow-md" : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"}`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {active && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-primary-foreground/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary-foreground/70 hover:bg-destructive/20 hover:text-red-300 transition-colors">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main - offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 md:px-6 h-16 flex items-center gap-4 shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar menu">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-bold truncate">{currentPage}</h1>
          <div className="ml-auto flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="Admin profile"
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold ring-2 ring-transparent hover:ring-primary/30 transition-all"
                >
                  {initial}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0 overflow-hidden">
                <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary-foreground text-primary flex items-center justify-center text-lg font-bold shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{adminName}</p>
                    <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Administrator
                    </p>
                  </div>
                </div>
                <div className="p-3 space-y-2 text-sm">
                  <div className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-muted/50">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="break-all text-foreground">{adminEmail}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
