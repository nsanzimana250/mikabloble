import AdminLayout from "@/components/admin/AdminLayout";
import {
  Package,
  DollarSign,
  Users as UsersIcon,
  ShoppingCart,
  TrendingUp,
  Loader2,
  Mail,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Bell,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabase";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  delivered: "bg-green-500/10 text-green-600",
  processing: "bg-secondary/10 text-secondary",
  shipped: "bg-primary/10 text-primary",
  pending: "bg-yellow-500/10 text-yellow-600",
  cancelled: "bg-red-500/10 text-red-500",
  paid: "bg-green-500/10 text-green-600",
  failed: "bg-red-500/10 text-red-500",
};

const fmtRWF = (n: number) => `RWF ${Number(n || 0).toLocaleString()}`;
const PALETTE = [
  "hsl(224, 76%, 33%)",
  "hsl(25, 95%, 53%)",
  "hsl(142, 76%, 36%)",
  "hsl(280, 65%, 50%)",
  "hsl(340, 82%, 52%)",
  "hsl(199, 89%, 48%)",
  "hsl(45, 93%, 47%)",
];

const useDashboardData = () =>
  useQuery({
    queryKey: ["admin-dashboard-full"],
    queryFn: async () => {
      const [orders, products, users, items, contacts, categories] = await Promise.all([
        supabase
          .from("mika_orders")
          .select("id,total,order_status,payment_status,created_at,first_name,last_name,order_number,email")
          .order("created_at", { ascending: false }),
        supabase.from("mika_products").select("*"),
        supabase.from("mika_users").select("*").order("created_at", { ascending: false }),
        supabase.from("mika_order_items").select("product_name,quantity,total"),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("mika_categories").select("id,name"),
      ]);

      const ordersData = orders.data || [];
      const productsData = products.data || [];
      const usersData = users.data || [];
      const contactsData = contacts.data || [];
      const categoriesData = categories.data || [];

      const totalRevenue = ordersData
        .filter((o: any) => o.order_status !== "cancelled")
        .reduce((s, o: any) => s + Number(o.total || 0), 0);
      const paidRevenue = ordersData
        .filter((o: any) => o.payment_status === "paid")
        .reduce((s, o: any) => s + Number(o.total || 0), 0);
      const aov = ordersData.length ? totalRevenue / ordersData.length : 0;

      // Monthly revenue (last 12 months)
      const months: Record<string, { revenue: number; orders: number }> = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months[d.toLocaleString("en", { month: "short" })] = { revenue: 0, orders: 0 };
      }
      ordersData.forEach((o: any) => {
        const d = new Date(o.created_at);
        const key = d.toLocaleString("en", { month: "short" });
        if (key in months) {
          months[key].revenue += Number(o.total || 0);
          months[key].orders += 1;
        }
      });
      const monthlyRevenue = Object.entries(months).map(([month, v]) => ({ month, ...v }));

      // Daily orders (last 30 days)
      const days: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days[d.toISOString().slice(5, 10)] = 0;
      }
      ordersData.forEach((o: any) => {
        const k = new Date(o.created_at).toISOString().slice(5, 10);
        if (k in days) days[k] += 1;
      });
      const dailyOrders = Object.entries(days).map(([day, count]) => ({ day, count }));

      // User growth (last 12 months)
      const userMonths: Record<string, number> = {};
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        userMonths[d.toLocaleString("en", { month: "short" })] = 0;
      }
      usersData.forEach((u: any) => {
        const d = new Date(u.created_at);
        const k = d.toLocaleString("en", { month: "short" });
        if (k in userMonths) userMonths[k] += 1;
      });
      const userGrowth = Object.entries(userMonths).map(([month, count]) => ({ month, count }));

      // Order status breakdown
      const statusMap: Record<string, number> = {};
      ordersData.forEach((o: any) => {
        const k = o.order_status || "pending";
        statusMap[k] = (statusMap[k] || 0) + 1;
      });
      const orderStatusData = Object.entries(statusMap).map(([name, value], i) => ({
        name,
        value,
        color: PALETTE[i % PALETTE.length],
      }));

      // Payment status
      const payMap: Record<string, number> = {};
      ordersData.forEach((o: any) => {
        const k = o.payment_status || "pending";
        payMap[k] = (payMap[k] || 0) + 1;
      });
      const paymentStatusData = Object.entries(payMap).map(([name, value], i) => ({
        name,
        value,
        color: PALETTE[(i + 2) % PALETTE.length],
      }));

      // Top selling
      const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
      (items.data || []).forEach((it: any) => {
        if (!productSales[it.product_name])
          productSales[it.product_name] = { name: it.product_name, qty: 0, revenue: 0 };
        productSales[it.product_name].qty += it.quantity;
        productSales[it.product_name].revenue += Number(it.total || 0);
      });
      const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

      // Categories
      const catNames: Record<string, string> = {};
      categoriesData.forEach((c: any) => (catNames[c.id] = c.name));
      const catCount: Record<string, number> = {};
      productsData.forEach((p: any) => {
        const k = p.category_id || "other";
        catCount[k] = (catCount[k] || 0) + 1;
      });
      const categoryData = Object.entries(catCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id, value], i) => ({
          name: catNames[id] || "Other",
          value,
          color: PALETTE[i % PALETTE.length],
        }));

      // Inventory health
      const lowStock = productsData.filter((p: any) => {
        const s = Number(p.stock ?? p.quantity ?? 0);
        return s > 0 && s <= 5;
      });
      const outOfStock = productsData.filter((p: any) => {
        if (p.in_stock === false) return true;
        const s = Number(p.stock ?? p.quantity ?? 0);
        return s === 0 && p.stock !== null && p.stock !== undefined;
      });

      const pendingOrders = ordersData.filter((o: any) => o.order_status === "pending").length;
      const unreadContacts = contactsData.filter((c: any) => c.status !== "read" && !c.is_read).length;

      return {
        stats: {
          totalRevenue,
          paidRevenue,
          aov,
          totalOrders: ordersData.length,
          totalProducts: productsData.length,
          totalUsers: usersData.length,
          totalContacts: contactsData.length,
          pendingOrders,
          unreadContacts,
          lowStockCount: lowStock.length,
          outOfStockCount: outOfStock.length,
        },
        monthlyRevenue,
        dailyOrders,
        userGrowth,
        orderStatusData,
        paymentStatusData,
        topProducts,
        categoryData,
        recentOrders: ordersData.slice(0, 6),
        recentUsers: usersData.slice(0, 5),
        recentContacts: contactsData.slice(0, 5),
        lowStockProducts: lowStock.slice(0, 5),
      };
    },
    staleTime: 60_000,
  });

const StatCard = ({ title, value, icon: Icon, color, sub, delay = 0, link }: any) => {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow h-full"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
          <p className="text-xl md:text-2xl font-bold mt-1 truncate">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {sub && <div className="flex items-center gap-1 mt-3 text-xs font-medium text-muted-foreground">{sub}</div>}
    </motion.div>
  );
  return link ? <Link to={link}>{inner}</Link> : inner;
};

const Dashboard = () => {
  const { data, isLoading } = useDashboardData();

  if (isLoading || !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const s = data.stats;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Website Activity Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Live analytics across orders, products, users and messages
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full font-medium">
            <Activity className="h-3.5 w-3.5" /> Live
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={fmtRWF(s.totalRevenue)} icon={DollarSign} color="bg-green-500/10 text-green-600" sub={<><TrendingUp className="h-3 w-3" /> Paid: {fmtRWF(s.paidRevenue)}</>} delay={0} />
          <StatCard title="Total Orders" value={s.totalOrders.toLocaleString()} icon={ShoppingCart} color="bg-secondary/10 text-secondary" sub={<>AOV: {fmtRWF(s.aov)}</>} delay={0.05} link="/admin/orders" />
          <StatCard title="Products" value={s.totalProducts.toLocaleString()} icon={Package} color="bg-primary/10 text-primary" delay={0.1} link="/admin/products" />
          <StatCard title="Users" value={s.totalUsers.toLocaleString()} icon={UsersIcon} color="bg-purple-500/10 text-purple-600" delay={0.15} link="/admin/users" />
        </div>

        {/* Alerts row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pending Orders" value={s.pendingOrders} icon={Clock} color="bg-yellow-500/10 text-yellow-600" delay={0.2} link="/admin/orders" />
          <StatCard title="Unread Messages" value={s.unreadContacts} icon={Mail} color="bg-blue-500/10 text-blue-600" delay={0.25} link="/admin/contacts" />
          <StatCard title="Low Stock" value={s.lowStockCount} icon={AlertTriangle} color="bg-orange-500/10 text-orange-600" delay={0.3} link="/admin/products" />
          <StatCard title="Out of Stock" value={s.outOfStockCount} icon={XCircle} color="bg-red-500/10 text-red-600" delay={0.35} link="/admin/products" />
        </div>

        {/* Revenue + Category */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="font-bold mb-4">Monthly Revenue & Orders</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 87%)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip formatter={(v: number, name: string) => name === "revenue" ? [fmtRWF(v), "Revenue"] : [v, "Orders"]} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="hsl(224, 76%, 33%)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="orders" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="font-bold mb-4">Products by Category</h3>
            {data.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={3}>
                    {data.categoryData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No data yet</p>
            )}
          </div>
        </div>

        {/* Daily orders + User growth */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="font-bold mb-4">Orders — Last 30 Days</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.dailyOrders}>
                <defs>
                  <linearGradient id="ord" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(224, 76%, 33%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(224, 76%, 33%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 87%)" />
                <XAxis dataKey="day" fontSize={10} interval={4} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="hsl(224, 76%, 33%)" fill="url(#ord)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="font-bold mb-4">New Users — Last 12 Months</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 87%)" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(280, 65%, 50%)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status pies */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="font-bold mb-4">Order Status</h3>
            {data.orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.orderStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}>
                    {data.orderStatusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No orders yet</p>
            )}
          </div>
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="font-bold mb-4">Payment Status</h3>
            {data.paymentStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={data.paymentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}>
                    {data.paymentStatusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No payments yet</p>
            )}
          </div>
        </div>

        {/* Activity lists */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Top Selling Products</h3>
              <Link to="/admin/products" className="text-xs text-primary font-medium">View all</Link>
            </div>
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sales yet</p>
            ) : (
              <div className="space-y-2">
                {data.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <span className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{fmtRWF(p.revenue)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{p.qty} sold</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs text-primary font-medium">View all</Link>
            </div>
            {data.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentOrders.map((o: any) => (
                  <div key={o.id} className="flex items-center gap-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{o.first_name} {o.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{o.order_number}</p>
                    </div>
                    <span className="font-semibold text-xs md:text-sm shrink-0">{fmtRWF(o.total)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize shrink-0 ${statusColors[o.order_status] || "bg-muted"}`}>{o.order_status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Recent Users</h3>
              <Link to="/admin/users" className="text-xs text-primary font-medium">View all</Link>
            </div>
            {data.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No users yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentUsers.map((u: any) => (
                  <div key={u.id} className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {(u.name || u.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{u.name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Recent Messages</h3>
              <Link to="/admin/contacts" className="text-xs text-primary font-medium">View all</Link>
            </div>
            {data.recentContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentContacts.map((c: any) => (
                  <div key={c.id} className="flex items-start gap-3 text-sm">
                    <Mail className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{c.name || c.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.subject || c.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low stock alert */}
        {data.lowStockProducts.length > 0 && (
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="font-bold text-orange-700">Low Stock Alert</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {data.lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between bg-card rounded-lg px-3 py-2 text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="text-orange-600 font-bold text-xs ml-2 shrink-0">
                    {p.stock ?? p.quantity ?? 0} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
