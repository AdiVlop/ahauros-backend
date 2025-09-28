import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Deactivated login protection - allow direct access to dashboard
  return children;
}

