import AdminLayout from "@/components/admin/AdminLayout";
import { Package, DollarSign, Users as UsersIcon, ShoppingCart, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/supabase";

const statusColors: Record<string, string> = {
  delivered: "bg-green-500/10 text-green-600",
  processing: "bg-secondary/10 text-secondary",
  shipped: "bg-primary/10 text-primary",
  pending: "bg-yellow-500/10 text-yellow-600",
  cancelled: "bg-red-500/10 text-red-500",
};

const fmtRWF = (n: number) => `RWF ${Number(n || 0).toLocaleString()}`;

const useDashboardData = () =>
  useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [orders, products, users, items] = await Promise.all([
        supabase.from("mika_orders").select("id,total,order_status,created_at,first_name,last_name,order_number").order("created_at", { ascending: false }),
        supabase.from("mika_products").select("id,name,category_id", { count: "exact", head: false }),
        supabase.from("mika_users").select("id", { count: "exact", head: true }),
        supabase.from("mika_order_items").select("product_name,quantity,total"),
      ]);

      const ordersData = orders.data || [];
      const productsData = products.data || [];
      const totalRevenue = ordersData.reduce((s, o: any) => s + Number(o.total || 0), 0);

      // Monthly revenue (last 12 months)
      const months: Record<string, number> = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months[d.toLocaleString("en", { month: "short" })] = 0;
      }
      ordersData.forEach((o: any) => {
        const d = new Date(o.created_at);
        const key = d.toLocaleString("en", { month: "short" });
        if (key in months) months[key] += Number(o.total || 0);
      });
      const monthlyRevenue = Object.entries(months).map(([month, revenue]) => ({ month, revenue }));

      // Top selling products
      const productSales: Record<string, { name: string; qty: number }> = {};
      (items.data || []).forEach((it: any) => {
        if (!productSales[it.product_name]) productSales[it.product_name] = { name: it.product_name, qty: 0 };
        productSales[it.product_name].qty += it.quantity;
      });
      const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

      // Category breakdown
      const colors = ["hsl(224, 76%, 33%)", "hsl(25, 95%, 53%)", "hsl(142, 76%, 36%)", "hsl(280, 65%, 50%)", "hsl(220, 14%, 50%)"];
      const catCount: Record<string, number> = {};
      productsData.forEach((p: any) => {
        const k = p.category_id || "other";
        catCount[k] = (catCount[k] || 0) + 1;
      });
      const categoryData = Object.entries(catCount).slice(0, 5).map(([id, value], i) => ({ name: `Cat ${i + 1}`, value, color: colors[i] }));

      return {
        stats: {
          totalRevenue,
          totalOrders: ordersData.length,
          totalProducts: productsData.length,
          totalUsers: users.count || 0,
        },
        monthlyRevenue,
        topProducts,
        categoryData,
        recentOrders: ordersData.slice(0, 5),
      };
    },
    staleTime: 60_000,
  });

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

  const stats = [
    { title: "Total Revenue", value: fmtRWF(data.stats.totalRevenue), icon: DollarSign, color: "bg-green-500/10 text-green-600" },
    { title: "Total Orders", value: data.stats.totalOrders.toLocaleString(), icon: ShoppingCart, color: "bg-secondary/10 text-secondary" },
    { title: "Products", value: data.stats.totalProducts.toLocaleString(), icon: Package, color: "bg-primary/10 text-primary" },
    { title: "Users", value: data.stats.totalUsers.toLocaleString(), icon: UsersIcon, color: "bg-purple-500/10 text-purple-600" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-card rounded-xl p-5 border border-border shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.title}</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 truncate">{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl shrink-0 ${s.color}`}><s.icon className="h-5 w-5" /></div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs font-medium text-green-600">
                <TrendingUp className="h-3 w-3" /> Live data from database
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="font-bold mb-4">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 87%)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [fmtRWF(v), "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(224, 76%, 33%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="font-bold mb-4">Products by Category</h3>
            {data.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                    {data.categoryData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No data yet</p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="font-bold mb-4">Top Selling Products</h3>
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sales yet</p>
            ) : (
              <div className="space-y-2">
                {data.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <span className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <p className="flex-1 text-sm font-medium truncate">{p.name}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{p.qty} sold</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="font-bold mb-4">Recent Orders</h3>
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
