import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user || !requireAdmin) {
        setIsAdmin(null);
        return;
      }

      setCheckingAdmin(true);

      // Create a promise that resolves after 1 second to ensure minimum loading time
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 1000));

      try {
        // Race the database query against a 1-second timeout
        const queryPromise = supabase
          .from("mika_users")
          .select("role")
          .eq("id", user.id)
          .single();

        const result = await Promise.race([queryPromise, timeoutPromise.then(() => ({ timedOut: true }))]);

        if (result.timedOut) {
          console.log("Admin role check timed out after 1 second");
          setIsAdmin(false);
          return;
        }

        const { data: userProfile, error } = result;

        if (error) throw error;

        const isUserAdmin = userProfile?.role === "admin";
        console.log("ProtectedRoute - checking admin role:", userProfile?.role, "isAdmin:", isUserAdmin);
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminRole();
  }, [user, requireAdmin]);

  // Show loading for initial auth check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin access is required and still checking, show loading
  if (requireAdmin && checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If admin access is required but user is not admin, redirect to home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;