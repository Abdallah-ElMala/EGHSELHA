import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Home,
  CalendarCheck,
  Wallet,
  Star,
  User,
  LogOut,
  ArrowRightLeft,
  X,
  Menu,
  CheckCircle2
} from 'lucide-react'
import { useCustomer } from '../context/CustomerContext'
import { customerApi } from '../services/customerApi'
import BrandLogo from '../component/BrandLogo'

export default function CustomerLayout() {
  const navigate = useNavigate()
  const { profile, toastMessage, notify, refreshData } = useCustomer()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [toppingUp, setToppingUp] = useState(false)

  const customerName = profile?.fullName || 'Ahmed Raouf'
  const initials = customerName.split(' ').map((x) => x[0]).join('').slice(0, 2)

  const navItems = [
    { label: 'Home', to: '/customer', icon: Home, end: true },
    { label: 'My Bookings', to: '/customer/bookings', icon: CalendarCheck },
    { label: 'Wallet', action: () => setShowWalletModal(true), icon: Wallet },
    { label: 'Reviews', to: '/customer/reviews', icon: Star },
    { label: 'Profile', to: '/customer/profile', icon: User }
  ]

  return (
    <div className="customer-app-wrapper" style={{ display: 'flex', minHeight: '100vh', background: '#f4f7fb' }}>
      {/* Dark Left Sidebar matching Figma wireframe */}
      <aside
        style={{
          background: 'linear-gradient(180deg, #07172c 0%, #0c233d 100%)',
          color: '#d9e8f5',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)'
        }}
        className={`portal-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 32px 8px' }}>
          <BrandLogo size={40} variant="blue" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ display: 'block', color: '#fff', fontSize: '16px', letterSpacing: '0.5px', fontFamily: 'Manrope, sans-serif' }}>
              EGHSELHA
            </b>
            <small style={{ display: 'block', fontSize: '9px', color: '#8da8be', letterSpacing: '0.8px', marginTop: '2px', textTransform: 'uppercase' }}>
              CAR WASH ON DEMAND
            </small>
          </div>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: 'none', border: 'none', color: '#9fb4c7', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    color: isActive ? '#fff' : '#94a9be',
                    backgroundColor: isActive ? '#087cf0' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 6px 16px rgba(8, 124, 240, 0.35)' : 'none'
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
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
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  color: '#94a9be',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94a9be'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Sidebar Bottom (Switch to Tech & Logout) */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => navigate('/technician')}
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
              transition: 'all 0.2s'
            }}
          >
            <ArrowRightLeft size={14} />
            <span>Switch to Tech Portal</span>
          </button>

          <button
            onClick={() => navigate('/admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.16)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              color: '#c4b5fd',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ArrowRightLeft size={14} />
            <span>Admin Control Portal</span>
          </button>

          <button
            onClick={() => notify('Demo mode active')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              color: '#8da8be',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ff6b6b'
              e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#8da8be'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="portal-main">
        {/* Top Header matching mockup */}
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
            zIndex: 30
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
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f2438', fontFamily: 'Manrope, sans-serif' }}>
              Welcome back, {customerName.split(' ')[0]}!
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => navigate('/technician')}
              className="btn outline"
              style={{ fontSize: '11px', padding: '7px 12px', borderColor: '#087cf0', color: '#087cf0' }}
              title="Open Technician Portal"
            >
              <ArrowRightLeft size={14} />
              <span>Technician Portal</span>
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="btn outline"
              style={{ fontSize: '11px', padding: '7px 12px', borderColor: '#7c3aed', color: '#7c3aed' }}
              title="Open Admin Portal"
            >
              <ArrowRightLeft size={14} />
              <span>Admin Portal</span>
            </button>

            {/* Quick Wallet pill */}
            <div
              onClick={() => setShowWalletModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '6px 14px',
                borderRadius: '20px',
                cursor: 'pointer'
              }}
              title="Click to view Wallet"
            >
              <Wallet size={14} color="#16a34a" />
              <b style={{ fontSize: '12px', color: '#15803d' }}>EGP {profile?.walletBalance?.toLocaleString() ?? 650}</b>
            </div>

            {/* Loyalty Points */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                padding: '6px 12px',
                borderRadius: '20px'
              }}
            >
              <Star size={13} fill="#d97706" color="#d97706" />
              <b style={{ fontSize: '11px', color: '#b45309' }}>{profile?.loyaltyPoints ?? 50} Pts</b>
            </div>

            {/* Profile widget in Top Right */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingLeft: '14px',
                borderLeft: '1px solid #e9eef4',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/customer/profile')}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {initials}
              </div>
              <div style={{ textAlign: 'left' }}>
                <b style={{ display: 'block', fontSize: '12px', color: '#102a40' }}>{customerName}</b>
                <small style={{ display: 'block', fontSize: '10px', color: '#8493a2' }}>Customer</small>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main style={{ padding: '28px 36px', flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h3>Customer Wallet</h3>
                <p>Manage your EGHSELHA balance & payments</p>
              </div>
              <button onClick={() => setShowWalletModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#eaf4ff', color: '#087cf0', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <Wallet size={30} />
              </div>
              <span style={{ fontSize: '12px', color: '#6d8294' }}>Available Balance</span>
              <h1 style={{ margin: '6px 0 20px', color: '#102a40', fontSize: '32px', fontWeight: 800 }}>
                EGP {profile?.walletBalance?.toLocaleString() ?? 650}
              </h1>

              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Loyalty Points</span>
                  <b style={{ fontSize: '12px', color: '#b45309' }}>{profile?.loyaltyPoints ?? 50} Pts (Value: EGP 25)</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Saved Payment Method</span>
                  <b style={{ fontSize: '12px', color: '#1e293b' }}>Instapay / Visa •••• 4012</b>
                </div>
              </div>

              <button
                className="btn primary full"
                disabled={toppingUp}
                onClick={async () => {
                  setToppingUp(true)
                  try {
                    await customerApi.topUpWallet(500)
                    await refreshData()
                    notify('Wallet topped up (+EGP 500 saved to your account)!')
                    setShowWalletModal(false)
                  } catch (err) {
                    notify(err?.message || 'Failed to top up wallet.')
                  } finally {
                    setToppingUp(false)
                  }
                }}
              >
                {toppingUp ? 'Processing...' : 'Top-up Wallet +EGP 500'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toastMessage && (
        <div className="toast" style={{ animation: 'slideUp 0.3s ease' }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
