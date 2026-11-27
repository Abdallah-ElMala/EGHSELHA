import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Wallet,
  Star,
  LogOut,
  X,
  Menu,
  CheckCircle2,
  CreditCard,
  Plus
} from 'lucide-react'
import { useCustomer } from '../context/CustomerContext'
import { useAuth } from '../context/AuthContext'
import EghselhaLogo from '../component/EghselhaLogo'
import PaymentModal from '../component/PaymentModal'

export default function CustomerLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { profile, toastMessage, notify, refreshData } = useCustomer()
  const { user, role, logout, hasRole } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showTopUpPaymentModal, setShowTopUpPaymentModal] = useState(false)
  const navRefs = useRef({})
  const [navPill, setNavPill] = useState({ left: 0, width: 0, ready: false })

  const customerName = user?.fullName || profile?.fullName || 'Customer'
  const initials = customerName.split(' ').filter(Boolean).map((x) => x[0]).join('').slice(0, 2).toUpperCase()

  const navItems = [
    { label: 'Overview', to: '/customer', end: true },
    { label: 'Book a wash', to: '/customer/book' },
    { label: 'Reservations', to: '/customer/bookings' },
    { label: 'Reviews', to: '/customer/reviews' },
    { label: 'Profile', to: '/customer/profile' }
  ]

  const activeNavKey =
    navItems.find((item) =>
      item.end
        ? pathname === item.to
        : pathname === item.to || pathname.startsWith(`${item.to}/`)
    )?.to || '/customer'

  useEffect(() => {
    const syncPill = () => {
      const el = navRefs.current[activeNavKey]
      if (el) {
        setNavPill({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
      }
    }
    syncPill()
    window.addEventListener('resize', syncPill)
    return () => window.removeEventListener('resize', syncPill)
  }, [activeNavKey])

  const handleSignOut = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div
      className="customer-app-wrapper"
      style={{
        minHeight: '100vh',
        background: 'var(--alabaster)',
        color: 'var(--ink-primary)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* FULL-WIDTH FLOATING EDITORIAL TOP NAVIGATION (Blacklane / Porsche Consumer Architecture) */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(14, 14, 16, 0.94)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid var(--hairline-dark)',
          color: 'var(--ivory)'
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '0 32px',
            height: '62px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px'
          }}
        >
          {/* Left: Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              className="portal-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              style={{ color: 'var(--ivory)' }}
            >
              <Menu size={20} strokeWidth={1.6} />
            </button>
            <Link to="/customer" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              <EghselhaLogo size={32} showText={true} />
            </Link>
          </div>

          {/* Center: Clean Horizontal Navigation with Smooth Gliding Pill */}
          <nav
            className="landing-nav"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px',
              borderRadius: '999px'
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
                  zIndex: 0
                }}
              />
            )}

            {navItems.map((item) => {
              const isActive = activeNavKey === item.to
              return (
                <NavLink
                  key={item.to}
                  ref={(el) => { navRefs.current[item.to] = el }}
                  to={item.to}
                  end={item.end}
                  className={`lx-topbar-link ${isActive ? 'is-active' : ''}`}
                >
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          {/* Right: Wallet, Loyalty, Account, Sign out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {(role === 'ADMIN' || hasRole?.('ADMIN')) && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="lx-btn lx-glass-btn lx-glass-crystal"
                style={{
                  borderRadius: '999px',
                  minHeight: '36px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                Admin
              </button>
            )}

            {/* Wallet Pill */}
            <button
              type="button"
              onClick={() => setShowWalletModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                background: 'rgba(245, 243, 238, 0.08)',
                border: '1px solid rgba(245, 243, 238, 0.14)',
                color: 'var(--ivory)',
                padding: '7px 14px',
                borderRadius: '999px',
                cursor: 'pointer',
                transition: 'border-color 180ms var(--ease-luxury), background-color 180ms var(--ease-luxury)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(198, 146, 73, 0.5)'
                e.currentTarget.style.background = 'rgba(245, 243, 238, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245, 243, 238, 0.14)'
                e.currentTarget.style.background = 'rgba(245, 243, 238, 0.08)'
              }}
              title="Open wallet"
            >
              <Wallet size={14} strokeWidth={1.6} color="var(--bronze-dark)" />
              <span className="mono-num" style={{ fontSize: '12px', fontWeight: 600 }}>
                EGP {profile?.walletBalance?.toLocaleString() ?? 650}
              </span>
            </button>

            {/* Loyalty Points (Clickable — opens Wallet & Rewards Hub) */}
            <button
              type="button"
              onClick={() => setShowWalletModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(198, 146, 73, 0.14)',
                border: '1px solid rgba(198, 146, 73, 0.28)',
                padding: '7px 12px',
                borderRadius: '999px',
                cursor: 'pointer'
              }}
              title="View loyalty stars & discounts"
            >
              <Star size={12} strokeWidth={1.8} fill="var(--bronze-dark)" color="var(--bronze-dark)" />
              <span className="mono-num" style={{ fontSize: '12px', fontWeight: 600, color: '#f3d299' }}>
                {profile?.loyaltyPoints ?? 0} Stars
              </span>
            </button>

            {/* Profile Avatar */}
            <button
              type="button"
              onClick={() => navigate('/customer/profile')}
              title={customerName}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '999px',
                background: 'var(--ivory)',
                color: '#0e0e10',
                border: 'none',
                fontWeight: 700,
                fontSize: '12px',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer'
              }}
            >
              {initials}
            </button>

            {/* Sign out icon button */}
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '999px',
                background: 'transparent',
                border: '1px solid rgba(245, 243, 238, 0.14)',
                color: 'rgba(245, 243, 238, 0.72)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                transition: 'color 180ms ease, border-color 180ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fca5a5'
                e.currentTarget.style.borderColor = 'rgba(252, 165, 165, 0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(245, 243, 238, 0.72)'
                e.currentTarget.style.borderColor = 'rgba(245, 243, 238, 0.14)'
              }}
            >
              <LogOut size={15} strokeWidth={1.7} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(10, 10, 12, 0.72)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '280px',
              height: '100%',
              background: 'var(--obsidian)',
              color: 'var(--ivory)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              borderRight: '1px solid var(--hairline-dark)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <EghselhaLogo size={30} showText={true} />
              <button
                onClick={() => setMobileOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--ivory-secondary)', cursor: 'pointer' }}
              >
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
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--ivory)' : 'var(--ivory-secondary)',
                    background: isActive ? 'rgba(245, 243, 238, 0.08)' : 'transparent',
                    textDecoration: 'none'
                  })}
                >
                  {item.label}
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
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* FULL-BREATHING-ROOM CENTERED PAGE CANVAS */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '24px 28px 48px',
          boxSizing: 'border-box'
        }}
      >
        <Outlet />
      </main>

      {/* Wallet & Rewards Hub Modal */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div>
                <h3>Wallet &amp; Rewards</h3>
                <p>Top up, pay deposits instantly, and unlock VIP discounts</p>
              </div>
              <button onClick={() => setShowWalletModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-secondary)' }} aria-label="Close">
                <X size={18} strokeWidth={1.6} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Balance & Stars Split */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#ffffff', border: '1px solid var(--hairline-light)', borderRadius: '14px', padding: '16px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--ink-muted)', display: 'block', marginBottom: '4px' }}>Wallet Balance</span>
                  <strong className="mono-num" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                    EGP {profile?.walletBalance?.toLocaleString() ?? 0}
                  </strong>
                </div>
                <div style={{ background: 'var(--bronze-soft)', border: '1px solid rgba(166, 124, 55, 0.25)', borderRadius: '14px', padding: '16px' }}>
                  <span style={{ fontSize: '11px', color: '#7a571e', display: 'block', marginBottom: '4px' }}>Loyalty Stars</span>
                  <strong className="mono-num" style={{ fontSize: '24px', fontWeight: 600, color: '#7a571e', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Star size={18} fill="var(--bronze)" color="var(--bronze)" />
                    {profile?.loyaltyPoints ?? 0}
                  </strong>
                </div>
              </div>

              {/* Wallet Perks Tier List */}
              <div style={{ background: '#ffffff', border: '1px solid var(--hairline-light)', borderRadius: '14px', padding: '14px 16px', display: 'grid', gap: '9px', fontSize: '12.5px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                  Top-up perks &amp; discounts
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-secondary)' }}>Top up EGP 500</span>
                  <b style={{ color: 'var(--bronze)' }}>+35 ★ Bonus Stars</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-secondary)' }}>Top up EGP 1,000</span>
                  <b style={{ color: 'var(--bronze)' }}>+80 ★ &amp; 5% off next wash</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-secondary)' }}>Top up EGP 2,000</span>
                  <b style={{ color: 'var(--bronze)' }}>+180 ★ &amp; 10% VIP discount</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--hairline-light)' }}>
                  <span style={{ color: 'var(--ink-secondary)' }}>Pay deposit with Wallet</span>
                  <b style={{ color: 'var(--semantic-positive)' }}>+25 ★ every booking</b>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  className="lx-btn lx-glass-btn lx-glass-obsidian"
                  onClick={() => {
                    setShowWalletModal(false)
                    setShowTopUpPaymentModal(true)
                  }}
                  style={{
                    minHeight: '44px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px'
                  }}
                >
                  <CreditCard size={15} strokeWidth={1.7} />
                  <span>Top up wallet</span>
                </button>
                <button
                  className="btn outline"
                  onClick={() => {
                    setShowWalletModal(false)
                    navigate('/customer/book')
                  }}
                  style={{ minHeight: '44px', fontSize: '13px' }}
                >
                  Book &amp; pay with wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal for Wallet Topup */}
      <PaymentModal
        isOpen={showTopUpPaymentModal}
        onClose={() => setShowTopUpPaymentModal(false)}
        mode="topup"
        currentBalance={profile?.walletBalance ?? 0}
        onSuccess={async () => {
          await refreshData()
        }}
        notify={notify}
      />

      {/* Global Toast */}
      {toastMessage && (
        <div className="toast">
          <CheckCircle2 size={16} strokeWidth={1.6} color="var(--bronze-dark)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
