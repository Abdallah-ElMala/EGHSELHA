import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  CalendarCheck,
  Wallet,
  Star,
  User,
  LogOut,
  X,
  Menu,
  CheckCircle2,
  CreditCard
} from 'lucide-react'
import { useCustomer } from '../context/CustomerContext'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../component/BrandLogo'
import PaymentModal from '../component/PaymentModal'

const PAGE_TITLES = {
  '/customer': 'Overview',
  '/customer/book': 'Book a wash',
  '/customer/bookings': 'My bookings',
  '/customer/vehicles': 'Vehicles',
  '/customer/reviews': 'Reviews',
  '/customer/profile': 'Profile'
}

export default function CustomerLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { profile, toastMessage, notify, refreshData } = useCustomer()
  const { user, role, logout, hasRole } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showTopUpPaymentModal, setShowTopUpPaymentModal] = useState(false)

  const customerName = user?.fullName || profile?.fullName || 'Customer'
  const initials = customerName.split(' ').filter(Boolean).map((x) => x[0]).join('').slice(0, 2).toUpperCase()
  const pageTitle = PAGE_TITLES[pathname] || 'Customer portal'

  const navItems = [
    { label: 'Home', to: '/customer', icon: Home, end: true },
    { label: 'My bookings', to: '/customer/bookings', icon: CalendarCheck },
    { label: 'Wallet', action: () => setShowWalletModal(true), icon: Wallet },
    { label: 'Reviews', to: '/customer/reviews', icon: Star },
    { label: 'Profile', to: '/customer/profile', icon: User }
  ]

  return (
    <div className="customer-app-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#fafafa' }}>
      {/* Obsidian Left Sidebar */}
      <aside
        style={{
          background: '#0f0f10',
          color: '#ededed',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 16px',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)'
        }}
        className={`portal-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px 28px 8px' }}>
          <BrandLogo size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ display: 'block', color: '#f4f4f5', fontSize: '15px', fontWeight: 600, letterSpacing: '0.06em', fontFamily: 'Manrope, sans-serif' }}>
              EGHSELHA
            </b>
            <small style={{ display: 'block', fontSize: '11px', color: '#85858b', marginTop: '2px' }}>
              Mobile auto detailing
            </small>
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: 'none', border: 'none', color: '#a1a1a6', cursor: 'pointer' }}
              aria-label="Close menu"
            >
              <X size={18} strokeWidth={1.6} />
            </button>
          )}
        </div>

        <div style={{ fontSize: '11px', color: '#737378', fontWeight: 500, padding: '0 12px 8px' }}>
          Menu
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            if (item.to) {
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `customer-nav-link ${isActive ? 'active' : ''}`}
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
                    transition: 'background-color 150ms cubic-bezier(0.22, 1, 0.36, 1), color 150ms cubic-bezier(0.22, 1, 0.36, 1)'
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={17} strokeWidth={1.6} color={isActive ? '#d49b4b' : 'currentColor'} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              )
            }

            return (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  minHeight: '36px',
                  borderRadius: '8px',
                  color: '#a1a1a6',
                  backgroundColor: 'transparent',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  fontWeight: 400,
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'background-color 150ms cubic-bezier(0.22, 1, 0.36, 1), color 150ms cubic-bezier(0.22, 1, 0.36, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f4f4f5'
                  e.currentTarget.style.backgroundColor = '#18181b'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#a1a1a6'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Icon size={17} strokeWidth={1.6} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Sidebar Bottom (Sign out) */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="sidebar-logout-btn"
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            <LogOut size={16} strokeWidth={1.6} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="portal-main">
        {/* Quiet 64px Top Header */}
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
            zIndex: 30
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
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#171717', fontFamily: 'Manrope, sans-serif' }}>
              {pageTitle}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {(role === 'ADMIN' || hasRole?.('ADMIN')) && (
              <button
                className="btn soft sm"
                onClick={() => navigate('/admin')}
              >
                Admin console
              </button>
            )}

            {/* Quiet Wallet Readout */}
            <button
              type="button"
              onClick={() => setShowWalletModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f4f4f5',
                border: '1px solid rgba(23, 23, 23, 0.08)',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontVariantNumeric: 'tabular-nums'
              }}
              title="View wallet"
            >
              <Wallet size={14} strokeWidth={1.6} color="#525252" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#171717' }}>
                EGP {profile?.walletBalance?.toLocaleString() ?? 650}
              </span>
            </button>

            {/* Quiet Loyalty Points */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fef7ec',
                border: '1px solid rgba(180, 83, 9, 0.16)',
                padding: '6px 10px',
                borderRadius: '8px',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              <Star size={13} strokeWidth={1.8} fill="#b45309" color="#b45309" />
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#92400e' }}>
                {profile?.loyaltyPoints ?? 50} pts
              </span>
            </div>

            {/* Profile Widget */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingLeft: '12px',
                borderLeft: '1px solid rgba(23, 23, 23, 0.08)',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/customer/profile')}
            >
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
                  placeItems: 'center'
                }}
              >
                {initials}
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#171717' }}>{customerName}</span>
                <small style={{ display: 'block', fontSize: '11px', color: '#737373' }}>{role || 'Customer'}</small>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main style={{ padding: '24px 32px', flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h3>Wallet</h3>
                <p>Balance and saved payment method</p>
              </div>
              <button onClick={() => setShowWalletModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#525252' }} aria-label="Close">
                <X size={18} strokeWidth={1.6} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f4f4f5', color: '#171717', display: 'grid', placeItems: 'center', margin: '0 auto 12px', border: '1px solid rgba(23,23,23,0.08)' }}>
                <Wallet size={22} strokeWidth={1.6} />
              </div>
              <span style={{ fontSize: '12px', color: '#737373' }}>Available balance</span>
              <h1 style={{ margin: '6px 0 20px', color: '#171717', fontSize: '32px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                EGP {profile?.walletBalance?.toLocaleString() ?? 650}
              </h1>

              <div style={{ background: '#fafafa', border: '1px solid rgba(23,23,23,0.08)', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#737373' }}>Loyalty points</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', fontVariantNumeric: 'tabular-nums' }}>{profile?.loyaltyPoints ?? 50} pts (EGP 25)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#737373' }}>Saved payment method</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#171717' }}>Visa •••• 4012</span>
                </div>
              </div>

              <button
                className="btn primary full"
                onClick={() => {
                  setShowWalletModal(false)
                  setShowTopUpPaymentModal(true)
                }}
                style={{ minHeight: '42px', fontSize: '13px' }}
              >
                <CreditCard size={16} strokeWidth={1.6} />
                <span>Top up wallet</span>
              </button>
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
          <CheckCircle2 size={16} strokeWidth={1.6} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
