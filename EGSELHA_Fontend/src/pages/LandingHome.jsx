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
  { id: 'foam', label: 'رغوة غسيل كثيفة', icon: '🫧', src: '/washed-car-foam.jpg' },
  { id: 'wet', label: 'مياه وقطرات لمعان', icon: '💧', src: '/wet-luxury-car.jpg' },
  { id: 'spray', label: 'رش عالي الضغط', icon: '⚡', src: '/car-wash-spray.jpg' }
]

const PACKAGES = [
  {
    id: 'basic-wash',
    name: 'Basic Wash',
    badge: 'Quick & Clean',
    price: 200,
    duration: '30 mins',
    desc: 'Exterior pressure wash, snow foam bath, tire gloss & streak-free windows.',
    highlights: ['Snow Foam Wash', 'High Pressure Rinse', 'Tire Gloss Dressing', 'Exterior Windows'],
    isPopular: false
  },
  {
    id: 'premium-wash',
    name: 'Premium Wash',
    badge: 'Most Popular ⭐',
    price: 350,
    duration: '60 mins',
    desc: 'Full cabin vacuum, dashboard dressing, snow foam bath & spray wax shine.',
    highlights: [
      'Interior Cabin Vacuum',
      'Dashboard & Trim Care',
      'Hand Foam Wash',
      'Spray Wax Sealant',
      'Air Freshener'
    ],
    isPopular: true
  },
  {
    id: 'deep-clean',
    name: 'Deep Clean',
    badge: 'Full Detailing',
    price: 500,
    duration: '90 mins',
    desc: 'Steam upholstery detailing, carpet extraction & AC antibacterial sanitation.',
    highlights: [
      'Interior Steam Extraction',
      'Carpet & Mat Shampoo',
      'Leather Conditioning',
      'AC Vent Disinfection',
      'Engine Bay Wipe'
    ],
    isPopular: false
  },
  {
    id: 'ultimate-detail',
    name: 'Ultimate Detail',
    badge: 'Ceramic & Polish',
    price: 700,
    duration: '140 mins',
    desc: 'Clay bar paint decontamination, machine polish & 6-month ceramic protection.',
    highlights: [
      'Clay Bar Paint Treatment',
      'Machine Gloss Polish',
      '6-Month Ceramic Coat',
      'Complete Interior Restore',
      'Headlight Clarity'
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
            <a
              href="#about"
              onClick={() => setActiveNav('about')}
              className={`landing-nav-link ${activeNav === 'about' ? 'active' : ''}`}
            >
              About
            </a>
            <a
              href="#contact"
              onClick={() => setActiveNav('contact')}
              className={`landing-nav-link ${activeNav === 'contact' ? 'active' : ''}`}
            >
              Contact
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
                    <span>{bg.icon}</span>
                    <span>{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. BOOKING PROCESS (Step by Step)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: '80px 24px',
          background: '#070e1b',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                background: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '14px'
              }}
            >
              <Zap size={14} />
              <span>Simple & Convenient</span>
            </div>
            <h2
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '36px',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 12px'
              }}
            >
              3. Booking Process (Step by Step)
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
              We bring the complete detailing shop right to your driveway. No lines, no wasted time, zero hassle.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px'
            }}
          >
            {STEPS.map((s, idx) => (
              <div
                key={s.step}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '28px 24px',
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
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '32px',
                        fontWeight: 900,
                        color: 'rgba(56, 189, 248, 0.5)'
                      }}
                    >
                      {s.step}
                    </span>
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(14, 165, 233, 0.15)',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 800
                      }}
                    >
                      ✓
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: '0 0 8px'
                    }}
                  >
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#38bdf8'
                  }}
                >
                  <span>Step {idx + 1} of 4</span>
                  <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. SERVICES & PACKAGES
      ───────────────────────────────────────────────────────────── */}
      <section
        id="services"
        style={{
          padding: '80px 24px',
          background: '#050a14',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                background: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '14px'
              }}
            >
              <Sparkles size={14} />
              <span>Tailored Care Packages</span>
            </div>
            <h2
              style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '36px',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 12px'
              }}
            >
              Our Wash Packages & Detailing
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
              From swift weekly maintenance to deep interior steam extraction and ceramic coat protection.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px'
            }}
          >
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  padding: '30px 26px',
                  background: pkg.isPopular
                    ? 'linear-gradient(180deg, #0d2a52 0%, #07172e 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: pkg.isPopular
                    ? '2px solid #38bdf8'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: pkg.isPopular ? '0 12px 35px rgba(14, 165, 233, 0.2)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {pkg.isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-13px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#0ea5e9',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 14px',
                      borderRadius: '9999px',
                      boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px'
                    }}
                  >
                    Most Popular ⭐
                  </div>
                )}

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#38bdf8',
                        background: 'rgba(14, 165, 233, 0.15)',
                        padding: '4px 10px',
                        borderRadius: '9999px'
                      }}
                    >
                      {pkg.badge}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Clock size={13} />
                      {pkg.duration}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'Manrope, sans-serif',
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: '0 0 6px'
                    }}
                  >
                    {pkg.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      lineHeight: 1.5,
                      margin: '0 0 20px',
                      minHeight: '36px'
                    }}
                  >
                    {pkg.desc}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '22px' }}>
                    <span
                      style={{
                        fontFamily: 'Manrope, sans-serif',
                        fontSize: '34px',
                        fontWeight: 900,
                        color: '#ffffff'
                      }}
                    >
                      {pkg.price}
                    </span>
                    <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>EGP</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      paddingTop: '18px',
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
                          fontSize: '12px',
                          color: '#cbd5e1'
                        }}
                      >
                        <Check size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '30px' }}>
                  <button
                    onClick={() => handleBookNow(pkg.id)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: pkg.isPopular ? '#0ea5e9' : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      boxShadow: pkg.isPopular ? '0 6px 18px rgba(14, 165, 233, 0.35)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>Book {pkg.name}</span>
                    <ArrowRight size={14} />
                  </button>
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
          background: '#030712',
          padding: '40px 24px',
          color: '#64748b',
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
              background: '#091528',
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
                background: '#071122'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={16} fill="#38bdf8" color="#38bdf8" />
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
                      color: '#38bdf8',
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
