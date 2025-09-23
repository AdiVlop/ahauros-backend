import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useProfile } from "../hooks/useProfile";

export default function ProtectedRoute({ children, requiredRole }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { profile, loading: profileLoading } = useProfile(session?.user?.id);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    if (profile?.role === "admin") {
      return <Navigate to="/admin-unified" replace />;
    } else {
      return <Navigate to="/dashboard/overview" replace />;
    }
  }

  return children;
}
