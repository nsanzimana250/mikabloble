import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const Loader = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">{label}</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, profile, loading, authReady } = useAuth();

  if (loading || !authReady) return <Loader label="Loading..." />;
  if (!user) return <Navigate to={requireAdmin ? "/admin/login" : "/login"} replace />;

  if (requireAdmin) {
    // profile may still be loading even though authReady
    if (!profile) return <Loader label="Verifying admin access..." />;
    if (profile.role !== "admin") return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
