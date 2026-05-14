import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoLoader from "../ui/LogoLoader";

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#030305] flex items-center justify-center">
        <LogoLoader minHeight={0} />
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
