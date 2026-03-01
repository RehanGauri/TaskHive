import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  // bypass role checks so the admin dashboard is accessible for demo
  return children;
};

export default AdminRoute;