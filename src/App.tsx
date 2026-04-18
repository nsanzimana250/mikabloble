import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import RequestQuote from "./pages/RequestQuote";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/request-quote" element={<RequestQuote />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes - User must be logged in */}
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes - User must be logged in AND have admin role */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminProducts />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminOrders />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/contacts" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminContacts />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/bookings" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminBookings />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;