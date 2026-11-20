// src/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">جاري التحقق من الصلاحيات...</p>
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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4" dir="rtl">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-center shadow-xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">عذراً، غير مصرح لك بالدخول!</h2>
            <p className="text-sm text-slate-400 mb-6">
              حسابك مسجل بدور <span className="text-emerald-400 font-semibold">{role}</span>، وهذه الصفحة مخصصة فقط للأدوار: {allowedRoles.join(' / ')}.
            </p>
            <a
              href={targetPortal}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition"
            >
              الذهاب إلى لوحة التحكم الخاصة بك
              <ArrowRight className="w-4 h-4 rotate-180" />
            </a>
          </div>
        </div>
      );
    }
  }

  return children;
}
