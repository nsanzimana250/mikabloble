import AdminLayout from "@/components/admin/AdminLayout";
import { Package, DollarSign, Users, ShoppingCart, TrendingUp, TrendingDown, Eye, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const stats = [
  { title: "Total Revenue", value: "RWF 48,295,000", change: "+12.5%", up: true, icon: DollarSign, color: "bg-green-500/10 text-green-600" },
  { title: "Total Orders", value: "1,284", change: "+8.2%", up: true, icon: ShoppingCart, color: "bg-secondary/10 text-secondary" },
  { title: "Products", value: "356", change: "+3", up: true, icon: Package, color: "bg-primary/10 text-primary" },
  { title: "Visitors", value: "12,847", change: "-2.1%", up: false, icon: Eye, color: "bg-purple-500/10 text-purple-600" },
];

const monthlyRevenue = [
  { month: "Jan", revenue: 4200000 }, { month: "Feb", revenue: 3800000 }, { month: "Mar", revenue: 5100000 },
  { month: "Apr", revenue: 4700000 }, { month: "May", revenue: 5800000 }, { month: "Jun", revenue: 6200000 },
  { month: "Jul", revenue: 5900000 }, { month: "Aug", revenue: 7100000 }, { month: "Sep", revenue: 6800000 },
  { month: "Oct", revenue: 7500000 }, { month: "Nov", revenue: 8200000 }, { month: "Dec", revenue: 9100000 },
];

const ordersByDay = [
  { day: "Mon", orders: 24 }, { day: "Tue", orders: 18 }, { day: "Wed", orders: 32 },
  { day: "Thu", orders: 28 }, { day: "Fri", orders: 45 }, { day: "Sat", orders: 38 }, { day: "Sun", orders: 15 },
];

const categoryData = [
  { name: "Engine", value: 35, color: "hsl(224, 76%, 33%)" },
  { name: "Brake", value: 25, color: "hsl(25, 95%, 53%)" },
  { name: "Electrical", value: 20, color: "hsl(142, 76%, 36%)" },
  { name: "Body", value: 12, color: "hsl(280, 65%, 50%)" },
  { name: "Other", value: 8, color: "hsl(220, 14%, 70%)" },
];

const recentOrders = [
  { id: "MG-7A2F", customer: "Jean Mugabo", amount: "RWF 245,000", status: "Delivered", date: "2026-02-25" },
  { id: "MG-8B3C", customer: "Alice Uwase", amount: "RWF 189,500", status: "Processing", date: "2026-02-24" },
  { id: "MG-9D4E", customer: "Patrick Nkusi", amount: "RWF 324,000", status: "Shipped", date: "2026-02-24" },
  { id: "MG-1F5G", customer: "Grace Muhire", amount: "RWF 78,990", status: "Pending", date: "2026-02-23" },
  { id: "MG-2H6J", customer: "Eric Habimana", amount: "RWF 512,000", status: "Delivered", date: "2026-02-23" },
];

const statusColors: Record<string, string> = {
  Delivered: "bg-green-500/10 text-green-600",
  Processing: "bg-secondary/10 text-secondary",
  Shipped: "bg-primary/10 text-primary",
  Pending: "bg-yellow-500/10 text-yellow-600",
};

const Dashboard = () => (
  <AdminLayout>
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.title}</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
            </div>
            <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${s.up ? "text-green-600" : "text-red-500"}`}>
              {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {s.change} from last month
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border shadow-sm">
          <h3 className="font-bold mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 87%)" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v: number) => [`RWF ${v.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="hsl(224, 76%, 33%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <h3 className="font-bold mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                {categoryData.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />{d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <h3 className="font-bold mb-4">Orders This Week</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ordersByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 87%)" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="hsl(25, 95%, 53%)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <h3 className="font-bold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{o.customer}</p>
                  <p className="text-xs text-muted-foreground">{o.id} · {o.date}</p>
                </div>
                <span className="font-semibold text-xs md:text-sm">{o.amount}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
);

export default Dashboard;
