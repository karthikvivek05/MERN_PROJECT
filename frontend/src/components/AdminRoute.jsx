import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "./LoadingState.jsx";

const AdminRoute = ({ children }) => {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Checking admin access" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
