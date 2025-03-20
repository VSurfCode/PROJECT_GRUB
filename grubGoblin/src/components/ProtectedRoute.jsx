import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, loading } = useAuth(); // Add isAdmin

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) { // Use isAdmin instead of user.isAdmin
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;