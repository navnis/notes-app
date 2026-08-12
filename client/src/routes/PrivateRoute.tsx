import { Navigate, Outlet } from "react-router";
import { Loading } from "@/components";
import { useAuth } from "../hooks/useAuth";

export function PrivateRoute() {
  const { isAuthenticated, isSessionRestored } = useAuth();

  if (!isSessionRestored) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
