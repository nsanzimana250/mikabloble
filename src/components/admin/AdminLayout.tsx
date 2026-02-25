import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, MessageSquare, CalendarCheck, LogOut, Menu, X, ChevronRight } from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Contacts", path: "/admin/contacts", icon: MessageSquare },
  { name: "Bookings", path: "/admin/bookings", icon: CalendarCheck },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

  const currentPage = navItems.find((i) => i.path === location.pathname)?.name || "Dashboard";

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:relative lg:translate-x-0 top-0 left-0 z-50 h-screen lg:h-auto lg:min-h-screen w-64 shrink-0 bg-sidebar-background text-sidebar-foreground flex flex-col transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/admin" className="block">
            <img src={logo} alt="MIKA GLOBLE" className="h-10 brightness-0 invert" />
          </Link>
          <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {active && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 md:px-6 h-16 flex items-center gap-4 shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold truncate">{currentPage}</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">A</div>
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
