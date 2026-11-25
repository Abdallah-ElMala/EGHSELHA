import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Calendar,
  UserCheck,
  ShieldCheck,
  Play,
  ArrowRight,
  Sparkles,
  Droplets,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  X,
  Menu,
  Award,
  Zap,
  Check
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import EghselhaLogo from '../component/EghselhaLogo'

const CAR_BACKGROUNDS = [
  { id: 'foam', label: 'Snow Foam', src: '/washed-car-foam.jpg' },
  { id: 'wet', label: 'Hydrophobic Gloss', src: '/wet-luxury-car.jpg' },
  { id: 'spray', label: 'High-Pressure Rinse', src: '/car-wash-spray.jpg' }
]

const PACKAGES = [
  {
    id: 'basic-wash',
    name: 'Basic Wash',
    badge: 'Exterior',
    price: 200,
    duration: '30 min',
    desc: 'Exterior pressure wash, snow foam bath, tire dressing and streak-free windows.',
    highlights: ['Snow foam wash', 'High-pressure rinse', 'Tire gloss dressing', 'Exterior glass'],
    isPopular: false
  },
  {
    id: 'premium-wash',
    name: 'Premium Wash',
    badge: 'Most selected',
    price: 350,
    duration: '60 min',
    desc: 'Full cabin vacuum, dashboard dressing, snow foam bath and spray wax sealant.',
    highlights: [
      'Interior cabin vacuum',
      'Dashboard & trim care',
      'Hand foam wash',
      'Spray wax sealant',
      'Cabin deodorizer'
    ],
    isPopular: true
  },
  {
    id: 'deep-clean',
    name: 'Deep Clean',
    badge: 'Full detailing',
    price: 500,
    duration: '90 min',
    desc: 'Steam upholstery detailing, carpet extraction and AC antibacterial sanitation.',
    highlights: [
      'Interior steam extraction',
      'Carpet & mat shampoo',
      'Leather conditioning',
      'AC vent disinfection',
      'Engine bay wipe'
    ],
    isPopular: false
  },
  {
    id: 'ultimate-detail',
    name: 'Ultimate Detail',
    badge: 'Ceramic & polish',
    price: 700,
    duration: '140 min',
    desc: 'Clay bar paint decontamination, machine polish and 6-month ceramic protection.',
    highlights: [
      'Clay bar paint treatment',
      'Machine gloss polish',
      '6-month ceramic coat',
      'Complete interior restore',
      'Headlight clarity'
    ],
    isPopular: false
  }
]

const STEPS = [
  {
    step: '01',
    title: 'Choose Service & Vehicle',
    desc: 'Select from our quick wash or full detailing packages tailored to your car type.'
  },
  {
    step: '02',
    title: 'Pick Date & Location',
    desc: 'Choose on-demand immediate arrival or schedule a convenient slot at your home or office.'
  },
  {
    step: '03',
    title: 'Technician Arrives',
    desc: 'Our certified mobile van arrives fully equipped with its own clean water and power.'
  },
  {
    step: '04',
    title: 'Inspect & Drive Happy',
    desc: 'Enjoy your showroom-clean car. Pay seamlessly via card, digital wallet, or cash.'
  }
]

export default function LandingHome() {
  const navigate = useNavigate()
  const { user, role, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [activeNav, setActiveNav] = useState('home')
  const [activeBg, setActiveBg] = useState(CAR_BACKGROUNDS[0])

  const handleBookNow = (pkgId = null) => {
    if (user) {
      if (pkgId) {
        navigate(`/customer/book?package=${encodeURIComponent(pkgId)}`)
      } else {
        navigate('/customer/book')
      }
    } else {
      navigate('/login?redirect=/customer/book')
    }
  }

  const getDashboardPath = () => {
    const r = (role || user?.role || '').toUpperCase()
    if (r === 'ADMIN') return '/admin'
    if (r === 'TECHNICIAN') return '/technician'
    return '/customer'
  }

  return (
    <div className="landing-root">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVBAR (Matches reference photo)
      ───────────────────────────────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-header-inner">
          {/* Left Brand Logo */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <EghselhaLogo size={42} showText={true} />
          </Link>

          {/* Center Links */}
          <nav className="landing-nav">
            <a
              href="#home"
              onClick={() => setActiveNav('home')}
              className={`landing-nav-link ${activeNav === 'home' ? 'active' : ''}`}
            >
              Home
            </a>
            <a
              href="#services"
              onClick={() => setActiveNav('services')}
              className={`landing-nav-link ${activeNav === 'services' ? 'active' : ''}`}
            >
              Services
            </a>
            <a
              href="#how-it-works"
              onClick={() => setActiveNav('how-it-works')}
              className={`landing-nav-link ${activeNav === 'how-it-works' ? 'active' : ''}`}
            >
              How It Works
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="landing-auth-group">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#cbd5e1' }} className="hidden lg:inline">
                  Welcome, <b>{user.fullName?.split(' ')[0]}</b>
                </span>
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="landing-btn-signup"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="landing-btn-login">
                  Login
                </Link>
                <Link to="/register" className="landing-btn-signup">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION (Seamless Right-Side Car Backdrop)
      ───────────────────────────────────────────────────────────── */}
      <section id="home" className="landing-hero">
        <div className="landing-hero-glow" />


        <div className="landing-hero-container">
          {/* Left Column: Headlines & Call to Actions (Protected) */}
          <div className="landing-hero-text-col">
            <h1 className="landing-hero-title">
              <span className="text-white">Your Car</span>
              <span className="text-accent">Our Care</span>
            </h1>

            <p className="landing-hero-subtitle">
              Professional car wash service at your location.
              <br />
              Fast, easy, and reliable.
            </p>

            {/* 3 Value Feature Badges */}
            <div className="landing-badges-row">
              <div className="landing-badge-card">
                <div className="landing-badge-icon">
                  <Calendar size={18} />
                </div>
                <div className="landing-badge-text">
                  <b>Book Online</b>
                  <small>in Minutes</small>
                </div>
              </div>

              <div className="landing-badge-card">
                <div className="landing-badge-icon">
                  <UserCheck size={18} />
                </div>
                <div className="landing-badge-text">
                  <b>Expert</b>
                  <small>Technicians</small>
                </div>
              </div>

              <div className="landing-badge-card">
                <div className="landing-badge-icon">
                  <ShieldCheck size={18} />
                </div>
                <div className="landing-badge-text">
                  <b>Eco-Friendly</b>
                  <small>Products</small>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="landing-cta-row">
              <button onClick={() => handleBookNow()} className="landing-btn-book">
                <span>Book Now</span>
                <ArrowRight size={18} />
              </button>

              <button onClick={() => setShowVideoModal(true)} className="landing-btn-video">
                <div className="landing-play-circle">
                  <Play size={12} fill="#ffffff" color="#ffffff" style={{ marginLeft: '1px' }} />
                </div>
                <span>Watch Video</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dedicated Car Wash Visual Area (Never Overlaps Text) */}
          <div className="landing-hero-car-col">
            <div className="landing-car-frame">
              <img
                src={activeBg.src}
                alt="Real Luxury Car washed with water droplets and foam"
                className="landing-car-img"
              />
              <div className="landing-car-gradient-overlay" />

              {/* Signature handwritten cursive tagline floating over the washed car */}
              <div className="landing-cursive-tagline">
                <span className="line1">Clean Cars</span>
                <span className="line2">Happier Days</span>
              </div>
            </div>

            {/* Live background switcher */}
            <div className="landing-switcher-wrap">
              <div className="landing-bg-switcher">
                {CAR_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setActiveBg(bg)}
                    className={`landing-switcher-btn ${activeBg.id === bg.id ? 'active' : ''}`}
                  >
                    <span>{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SERVICES & PACKAGES
      ───────────────────────────────────────────────────────────── */}
      <section
        id="services"
        style={{
          padding: '80px 24px',
          background: '#141415',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ maxWidth: '640px', margin: '0 0 48px' }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#d49b4b', marginBottom: '8px' }}>
              Service tiers
            </span>
            <h2
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '32px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: '#f4f4f5',
                margin: '0 0 12px'
              }}
            >
              Wash packages &amp; detailing
            </h2>
            <p style={{ color: '#a1a1a6', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
              From routine exterior washes to steam interior extraction and ceramic paint protection.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px'
            }}
          >
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                style={{
                  position: 'relative',
                  borderRadius: '14px',
                  padding: '24px',
                  background: pkg.isPopular ? '#1c1c1f' : '#19191b',
                  border: pkg.isPopular
                    ? '1px solid rgba(212, 155, 75, 0.45)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: pkg.isPopular ? '#e5b56c' : '#a1a1a6',
                        background: pkg.isPopular ? 'rgba(212, 155, 75, 0.14)' : '#232325',
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}
                    >
                      {pkg.badge}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#85858b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      <Clock size={13} strokeWidth={1.6} />
                      {pkg.duration}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#f4f4f5',
                      margin: '0 0 8px'
                    }}
                  >
                    {pkg.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#a1a1a6',
                      lineHeight: 1.55,
                      margin: '0 0 20px',
                      minHeight: '40px'
                    }}
                  >
                    {pkg.desc}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '20px' }}>
                    <span
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '32px',
                        fontWeight: 500,
                        color: '#f4f4f5',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {pkg.price}
                    </span>
                    <span style={{ fontSize: '13px', color: '#85858b', fontWeight: 500 }}>EGP</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    {pkg.highlights.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          color: '#d4d4d8'
                        }}
                      >
                        <Check size={14} strokeWidth={1.8} color="#d49b4b" style={{ flexShrink: 0 }} />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button
                    onClick={() => handleBookNow(pkg.id)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      minHeight: '40px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '13px',
                      border: pkg.isPopular ? '1px solid #f4f4f5' : '1px solid rgba(255, 255, 255, 0.14)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: pkg.isPopular ? '#f4f4f5' : '#232325',
                      color: pkg.isPopular ? '#141415' : '#ededed',
                      transition: 'background-color 150ms cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  >
                    <span>Book {pkg.name}</span>
                    <ArrowRight size={14} strokeWidth={1.6} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. BOOKING PROCESS
      ───────────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: '80px 24px',
          background: '#141415',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ maxWidth: '640px', margin: '0 0 48px' }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#d49b4b', marginBottom: '8px' }}>
              How it works
            </span>
            <h2
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '32px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: '#f4f4f5',
                margin: '0 0 12px'
              }}
            >
              Booking process
            </h2>
            <p style={{ color: '#a1a1a6', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
              Certified technicians arrive at your home or office with self-contained water and power.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px'
            }}
          >
            {STEPS.map((s, idx) => (
              <div
                key={s.step}
                style={{
                  background: '#19191b',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <span
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '24px',
                        fontWeight: 500,
                        color: '#d49b4b',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {s.step}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#f4f4f5',
                      margin: '0 0 8px'
                    }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#a1a1a6', lineHeight: 1.6, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '14px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#85858b',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  Step {idx + 1} of 4
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0f0f10',
          padding: '36px 24px',
          color: '#737378',
          fontSize: '13px'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <EghselhaLogo size={34} showText={true} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="#home" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Home
            </a>
            <a href="#services" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Services
            </a>
            <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              How It Works
            </a>
            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register" style={{ color: '#94a3b8', textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>

          <div>
            <span>© 2026 EGHSELHA. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          6. VIDEO DEMO MODAL
      ───────────────────────────────────────────────────────────── */}
      {showVideoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              background: '#141415',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: '#0f0f10'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={16} fill="#d49b4b" color="#d49b4b" />
                <b style={{ color: '#ffffff', fontSize: '14px' }}>
                  EGHSELHA Doorstep Detailing Experience
                </b>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: '#000'
                }}
              >
                <img
                  src="/washed-car-foam.jpg"
                  alt="Car wash demonstration"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '24px'
                  }}
                >
                  <span
                    style={{
                      color: '#d49b4b',
                      fontWeight: 800,
                      fontSize: '11px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '4px'
                    }}
                  >
                    Mobile Unit in Action
                  </span>
                  <h4
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: 0
                    }}
                  >
                    Snow Foam Bath · High-Pressure Wash · Showroom Finish
                  </h4>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '6px 0 0' }}>
                    Certified technicians bring mobile clean-water tanks and power generators directly to your door.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '20px'
                }}
              >
                <button
                  onClick={() => setShowVideoModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    color: '#ffffff',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowVideoModal(false)
                    handleBookNow()
                  }}
                  className="landing-btn-signup"
                  style={{ fontSize: '13px' }}
                >
                  Book This Service
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
