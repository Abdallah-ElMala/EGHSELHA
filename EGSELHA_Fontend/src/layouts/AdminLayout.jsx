import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  Users,
  Tags,
  ShieldAlert,
  Wallet,
  ArrowRightLeft,
  RefreshCw,
  CheckCircle2,
  X,
  Menu,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import BrandLogo from '../component/BrandLogo';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { dashboard, toastMessage, refreshAll } = useAdmin();
  const [refreshing, setRefreshing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openDisputesCount = dashboard?.openDisputes ?? 0;
  const pendingPayoutsCount = dashboard?.pendingPayoutsCount ?? 0;

  const navItems = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'All Bookings', to: '/admin/bookings', icon: CalendarCheck },
    { label: 'Technicians', to: '/admin/technicians', icon: Wrench },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Pricing & Zones', to: '/admin/catalog', icon: Tags },
    { label: 'Disputes & QA', to: '/admin/disputes', icon: ShieldAlert, badge: openDisputesCount },
    { label: 'Payouts', to: '/admin/payouts', icon: Wallet, badge: pendingPayoutsCount },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7fb' }}>
      {/* Dark Navy Admin Sidebar */}
      <aside
        style={{
          background: 'linear-gradient(180deg, #061325 0%, #0b2038 100%)',
          color: '#d9e8f5',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
        }}
        className={`portal-sidebar admin ${mobileOpen ? 'mobile-open' : ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 28px 8px' }}>
          <BrandLogo size={40} variant="purple" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ display: 'block', color: '#fff', fontSize: '15px', letterSpacing: '0.5px', fontFamily: 'Manrope, sans-serif' }}>
              EGHSELHA
            </b>
            <small style={{ display: 'block', fontSize: '9px', color: '#60b4ff', letterSpacing: '0.9px', marginTop: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
              ADMIN CONTROL
            </small>
          </div>
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: '#9fb4c7', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>

        <div style={{ fontSize: '10px', letterSpacing: '1.4px', color: '#68849c', fontWeight: 700, padding: '0 12px 10px' }}>
          OPERATIONS
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  color: isActive ? '#fff' : '#94a9be',
                  backgroundColor: isActive ? '#087cf0' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 6px 16px rgba(8, 124, 240, 0.35)' : 'none',
                })}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '20px',
                      background: '#ef4444',
                      color: '#fff',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => navigate('/customer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(8, 124, 240, 0.15)',
              border: '1px solid rgba(8, 124, 240, 0.3)',
              color: '#60b4ff',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowRightLeft size={14} />
            <span>Customer Portal</span>
          </button>
          <button
            onClick={() => navigate('/technician')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.14)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6ee7b7',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowRightLeft size={14} />
            <span>Technician Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="portal-main admin">
        <header
          style={{
            height: '70px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #e9eef4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="portal-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f2438', fontFamily: 'Manrope, sans-serif' }}>
                EGHSELHA Operations & Dispatch Center
              </h2>
              <small style={{ fontSize: '11px', color: '#64748b' }}>
                Real-time platform monitoring, pricing, technicians, disputes & payouts
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={14} />
              <span>{refreshing ? 'Refreshing...' : 'Sync Data'}</span>
            </button>
            <button className="btn outline" onClick={() => navigate('/customer')}>
              Customer View
            </button>
            <button className="btn outline" onClick={() => navigate('/technician')}>
              Tech View
            </button>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0f172a, #2563eb)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '12px',
                display: 'grid',
                placeItems: 'center',
              }}
              title="Admin Operations"
            >
              AD
            </div>
          </div>
        </header>

        <main style={{ padding: '28px 32px', flex: 1, maxWidth: '1500px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>

      {toastMessage && (
        <div className="toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
