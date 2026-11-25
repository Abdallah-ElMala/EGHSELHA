// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, LogOut } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize allowed roles check
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedUserRole = (role || '').toUpperCase();
    const isAllowed = allowedRoles.some((r) => r.toUpperCase() === normalizedUserRole);

    if (!isAllowed) {
      const targetPortal =
        normalizedUserRole === 'CUSTOMER' ? '/customer' :
        normalizedUserRole === 'TECHNICIAN' ? '/technician' :
        normalizedUserRole === 'ADMIN' ? '/admin' : '/login';

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-center shadow-xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
            <p className="text-sm text-slate-400 mb-6">
              Your account role is <span className="text-emerald-400 font-semibold">{role}</span>, which does not have access to this page. Required roles: {allowedRoles.join(', ')}.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={targetPortal}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition"
              >
                Go to your dashboard ({role})
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/login', { replace: true });
                }}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-xl border border-slate-700 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log out and switch account
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}
