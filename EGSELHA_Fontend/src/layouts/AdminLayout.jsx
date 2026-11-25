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
  RefreshCw,
  CheckCircle2,
  X,
  Menu,
  LogOut,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../component/BrandLogo';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { dashboard, toastMessage, refreshAll } = useAdmin();
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openDisputesCount = dashboard?.openDisputes ?? 0;
  const pendingPayoutsCount = dashboard?.pendingPayoutsCount ?? 0;

  const navItems = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Bookings', to: '/admin/bookings', icon: CalendarCheck },
    { label: 'Technicians', to: '/admin/technicians', icon: Wrench },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Pricing & zones', to: '/admin/catalog', icon: Tags },
    { label: 'Disputes & QA', to: '/admin/disputes', icon: ShieldAlert, badge: openDisputesCount },
    { label: 'Payouts', to: '/admin/payouts', icon: Wallet, badge: pendingPayoutsCount },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
      {/* Obsidian Admin Sidebar */}
      <aside
        style={{
          background: '#0f0f10',
          color: '#ededed',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 16px',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        className={`portal-sidebar admin ${mobileOpen ? 'mobile-open' : ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px 28px 8px' }}>
          <BrandLogo size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ display: 'block', color: '#f4f4f5', fontSize: '15px', fontWeight: 600, letterSpacing: '0.06em', fontFamily: 'Manrope, sans-serif' }}>
              EGHSELHA
            </b>
            <small style={{ display: 'block', fontSize: '11px', color: '#d49b4b', marginTop: '2px', fontWeight: 500 }}>
              Operations console
            </small>
          </div>
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: '#a1a1a6', cursor: 'pointer' }} aria-label="Close menu">
              <X size={18} strokeWidth={1.6} />
            </button>
          )}
        </div>

        <div style={{ fontSize: '11px', color: '#737378', fontWeight: 500, padding: '0 12px 8px' }}>
          Operations
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                  gap: '10px',
                  padding: '9px 12px',
                  minHeight: '36px',
                  borderRadius: '8px',
                  color: isActive ? '#f4f4f5' : '#a1a1a6',
                  backgroundColor: isActive ? '#1e1e21' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? 500 : 400,
                  fontSize: '13px',
                  transition: 'background-color 150ms cubic-bezier(0.22, 1, 0.36, 1), color 150ms cubic-bezier(0.22, 1, 0.36, 1)',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} strokeWidth={1.6} color={isActive ? '#d49b4b' : 'currentColor'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          padding: '1px 7px',
                          borderRadius: '6px',
                          background: 'rgba(212, 155, 75, 0.16)',
                          color: '#e5b56c',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="sidebar-logout-btn"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            <LogOut size={16} strokeWidth={1.6} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="portal-main admin">
        <header
          style={{
            height: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid rgba(23, 23, 23, 0.08)',
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
              <Menu size={18} strokeWidth={1.6} />
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#171717', fontFamily: 'Manrope, sans-serif' }}>
                Operations & dispatch
              </h2>
              <small style={{ fontSize: '12px', color: '#737373' }}>
                Bookings, technicians, pricing, disputes and payouts
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn outline sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={14} strokeWidth={1.6} />
              <span>{refreshing ? 'Syncing…' : 'Sync'}</span>
            </button>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#141415',
                color: '#f4f4f5',
                fontWeight: 600,
                fontSize: '12px',
                display: 'grid',
                placeItems: 'center',
              }}
              title="Admin operations"
            >
              AD
            </div>
          </div>
        </header>

        <main style={{ padding: '24px 32px', flex: 1, maxWidth: '1500px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>

      {toastMessage && (
        <div className="toast">
          <CheckCircle2 size={16} strokeWidth={1.6} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
