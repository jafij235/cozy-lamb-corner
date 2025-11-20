import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, loading } = useAuth();

  // CRITICAL: Always show loading state while checking authentication
  // Never render protected content until we confirm user is authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // CRITICAL: Redirect to login if not authenticated
  // This must happen BEFORE any children are rendered
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // CRITICAL: Check admin status for admin routes
  // Redirect non-admins away from admin pages
  if (requireAdmin && !isAdmin) {
    console.log('[PROTECTED ROUTE] Access denied to admin route. isAdmin:', isAdmin, 'user email:', user?.email);
    return <Navigate to="/home" replace />;
  }
  
  if (requireAdmin && isAdmin) {
    console.log('[PROTECTED ROUTE] Admin access granted for:', user?.email);
  }

  // Only render children after all authentication checks pass
  return <>{children}</>;
};
