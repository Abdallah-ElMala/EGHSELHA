import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  RefreshCw,
  CheckCircle2,
  X,
  Menu,
  LogOut,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import EghselhaLogo from '../component/EghselhaLogo';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { dashboard, toastMessage, refreshAll } = useAdmin();
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRefs = useRef({});
  const [navPill, setNavPill] = useState({ left: 0, width: 0, ready: false });

  const openDisputesCount = dashboard?.openDisputes ?? 0;
  const pendingPayoutsCount = dashboard?.pendingPayoutsCount ?? 0;

  const navItems = [
    { label: 'Overview', to: '/admin', end: true },
    { label: 'Bookings', to: '/admin/bookings' },
    { label: 'Technicians', to: '/admin/technicians' },
    { label: 'Customers', to: '/admin/customers' },
    { label: 'Pricing', to: '/admin/catalog' },
    { label: 'Disputes', to: '/admin/disputes', badge: openDisputesCount },
    { label: 'Payouts', to: '/admin/payouts', badge: pendingPayoutsCount },
  ];

  const activeNavKey =
    navItems.find((item) =>
      item.end
        ? pathname === item.to
        : pathname === item.to || pathname.startsWith(`${item.to}/`)
    )?.to || '/admin';

  useEffect(() => {
    const syncPill = () => {
      const el = navRefs.current[activeNavKey];
      if (el) {
        setNavPill({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
      }
    };
    syncPill();
    window.addEventListener('resize', syncPill);
    return () => window.removeEventListener('resize', syncPill);
  }, [activeNavKey, openDisputesCount, pendingPayoutsCount]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAll(true);
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--alabaster)',
        color: 'var(--ink-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* FLOATING OBSIDIAN ADMIN TOP NAVIGATION WITH GLIDING PILL */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(14, 14, 16, 0.94)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid var(--hairline-dark)',
          color: 'var(--ivory)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 28px',
            height: '62px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Left: Brand Logo + Admin Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <button
              className="portal-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              style={{ color: 'var(--ivory)' }}
            >
              <Menu size={20} strokeWidth={1.6} />
            </button>
            <Link to="/admin" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <EghselhaLogo size={30} showText={true} />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--bronze-dark)',
                  background: 'rgba(198, 146, 73, 0.14)',
                  border: '1px solid rgba(198, 146, 73, 0.28)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                Admin
              </span>
            </Link>
          </div>

          {/* Center: Gliding Pill Navigation */}
          <nav
            className="landing-nav"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              padding: '4px',
              borderRadius: '999px',
            }}
          >
            {navPill.ready && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '4px',
                  bottom: '4px',
                  left: 0,
                  width: `${navPill.width}px`,
                  transform: `translateX(${navPill.left}px)`,
                  borderRadius: '999px',
                  background: 'rgba(245, 243, 238, 0.12)',
                  border: '1px solid rgba(198, 146, 73, 0.42)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 4px 16px rgba(0, 0, 0, 0.28)',
                  transition: 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1), width 360ms cubic-bezier(0.22, 1, 0.36, 1)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
            )}

            {navItems.map((item) => {
              const isActive = activeNavKey === item.to;
              return (
                <NavLink
                  key={item.to}
                  ref={(el) => { navRefs.current[item.to] = el; }}
                  to={item.to}
                  end={item.end}
                  className={`lx-topbar-link ${isActive ? 'is-active' : ''}`}
                  style={{ padding: '7px 13px', fontSize: '13px', gap: '6px' }}
                >
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      className="mono-num"
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        background: 'var(--bronze-dark)',
                        color: '#0e0e10',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Sync, Admin Avatar, Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="lx-btn lx-glass-btn lx-glass-crystal"
              style={{
                minHeight: '34px',
                padding: '0 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw
                size={13}
                strokeWidth={1.7}
                style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}
              />
              <span>{refreshing ? 'Syncing…' : 'Sync'}</span>
            </button>

            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '999px',
                background: 'var(--ivory)',
                color: '#0e0e10',
                fontWeight: 700,
                fontSize: '11.5px',
                display: 'grid',
                placeItems: 'center',
              }}
              title="Admin operations"
            >
              AD
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '999px',
                background: 'transparent',
                border: '1px solid rgba(245, 243, 238, 0.14)',
                color: 'rgba(245, 243, 238, 0.72)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <LogOut size={15} strokeWidth={1.7} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(10, 10, 12, 0.72)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '270px',
              height: '100%',
              background: 'var(--obsidian)',
              color: 'var(--ivory)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <EghselhaLogo size={28} showText={true} />
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ivory-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    padding: '11px 15px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--ivory)' : 'var(--ivory-secondary)',
                    background: isActive ? 'rgba(245, 243, 238, 0.08)' : 'transparent',
                    textDecoration: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="mono-num" style={{ fontSize: '11px', background: 'var(--bronze-dark)', color: '#0e0e10', padding: '1px 7px', borderRadius: '999px', fontWeight: 700 }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                marginTop: 'auto',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.24)',
                color: '#fca5a5',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* FULL-BREATHING-ROOM CENTERED ADMIN CANVAS */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '24px 28px 56px',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </main>

      {toastMessage && (
        <div className="toast">
          <CheckCircle2 size={16} strokeWidth={1.6} color="var(--bronze-dark)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
