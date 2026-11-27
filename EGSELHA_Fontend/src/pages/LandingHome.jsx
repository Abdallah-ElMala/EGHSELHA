import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Play, X, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import EghselhaLogo from '../component/EghselhaLogo'
import Reveal from '../component/ui/Reveal'

const PACKAGES = [
  {
    id: 'basic-wash',
    index: '01',
    name: 'Basic Wash',
    subtitle: 'Routine exterior maintenance',
    price: 200,
    duration: '30 min',
    photo: '/car-wash-spray.jpg',
    desc: 'A thorough exterior reset — snow foam pre-soak, pH-neutral hand wash, high-pressure rinse, tire dressing, and streak-free exterior glass.',
    highlights: ['Snow foam pre-soak', 'High-pressure rinse', 'Satin tire dressing', 'Exterior glass finish']
  },
  {
    id: 'premium-wash',
    index: '02',
    name: 'Premium Wash',
    subtitle: 'Full interior & exterior care',
    price: 350,
    duration: '60 min',
    photo: '/washed-car-foam.jpg',
    desc: 'Our most requested visit. Complete cabin vacuuming and trim conditioning paired with a hand snow-foam bath and protective spray wax.',
    highlights: [
      'Deep cabin vacuum & mat care',
      'Dashboard & console conditioning',
      'Hand snow-foam wash',
      'Hydrophobic spray wax sealant',
      'Subtle cabin deodorizer'
    ],
    featured: true
  },
  {
    id: 'deep-clean',
    index: '03',
    name: 'Deep Clean',
    subtitle: 'Steam extraction & leather care',
    price: 500,
    duration: '90 min',
    photo: '/car-wash-detailing.jpg',
    desc: 'Designed for cabins that need a full reset — hot steam upholstery extraction, leather nourishment, antibacterial AC sanitation, and engine bay wipe.',
    highlights: [
      'Hot steam seat & carpet extraction',
      'Matte leather nourishment',
      'Antibacterial AC vent sanitation',
      'Engine bay detailing wipe',
      'Full exterior foam & wax'
    ]
  },
  {
    id: 'ultimate-detail',
    index: '04',
    name: 'Ultimate Detail',
    subtitle: 'Paint correction & 6-month ceramic',
    price: 700,
    duration: '140 min',
    photo: '/wet-luxury-car.jpg',
    desc: 'Showroom-level restoration at your driveway — clay bar paint decontamination, single-stage machine gloss polish, and 6-month ceramic protection.',
    highlights: [
      'Clay bar paint decontamination',
      'Machine gloss enhancement polish',
      '6-month ceramic paint sealant',
      'Complete interior restoration',
      'Headlight clarity treatment'
    ]
  }
]

const CRAFT_PILLARS = [
  {
    num: '01',
    title: 'Pin your spot',
    body: 'Drop a pin on your home driveway or office parking lot and pick a window that fits your day.'
  },
  {
    num: '02',
    title: 'Self-contained arrival',
    body: 'Our mobile detailing unit arrives with its own filtered water, silent power, and pH-neutral products.'
  },
  {
    num: '03',
    title: 'Tracked & photographed',
    body: 'Follow your technician live on the map and review before-and-after inspection photos in the app.'
  },
  {
    num: '04',
    title: 'Settle effortlessly',
    body: 'Pay by card, in-app wallet, or cash only once you inspect the finish in person.'
  }
]

export default function LandingHome() {
  const navigate = useNavigate()
  const { user, role, logout } = useAuth()
  const [selectedPkgId, setSelectedPkgId] = useState('premium-wash')
  const [showFilm, setShowFilm] = useState(false)

  const activePkg = PACKAGES.find((p) => p.id === selectedPkgId) || PACKAGES[1]

  const handleBookNow = (pkgId = null) => {
    if (user) {
      navigate(pkgId ? `/customer/book?package=${encodeURIComponent(pkgId)}` : '/customer/book')
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
    <div style={{ background: 'var(--alabaster)', color: 'var(--ink-primary)', minHeight: '100vh' }}>
      {/* =================================================================
          1. FULL-BLEED CINEMATIC HERO (100vh — Zero Boxed Frame)
         ================================================================= */}
      <section
        id="home"
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: '#0a0a0c',
          color: 'var(--ivory)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}
      >
        {/* Full-bleed edge-to-edge photography */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/washed-car-foam.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 42%',
            transform: 'scale(1.02)',
            zIndex: 0
          }}
        />
        {/* Quiet Editorial Dark Vignette for Effortless Readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(10,10,12,0.72) 0%, rgba(10,10,12,0.34) 42%, rgba(10,10,12,0.92) 100%)',
            zIndex: 1
          }}
        />

        {/* Minimalist Floating Editorial Navbar */}
        <header style={{ position: 'relative', zIndex: 10 }}>
          <div
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px'
            }}
          >
            <Link to="/" style={{ textDecoration: 'none' }}>
              <EghselhaLogo size={34} showText={true} />
            </Link>

            <nav className="landing-nav" style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
              <a href="#craft" className="lx-nav-link" style={{ color: 'rgba(245,243,238,0.82)', fontSize: '14px' }}>
                The craft
              </a>
              <a href="#services" className="lx-nav-link" style={{ color: 'rgba(245,243,238,0.82)', fontSize: '14px' }}>
                Services
              </a>
              <a href="#how-it-works" className="lx-nav-link" style={{ color: 'rgba(245,243,238,0.82)', fontSize: '14px' }}>
                How it works
              </a>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {user ? (
                <>
                  <button
                    onClick={() => navigate(getDashboardPath())}
                    className="lx-btn lx-glass-btn lx-glass-ivory"
                    style={{
                      borderRadius: '999px',
                      padding: '0 22px',
                      minHeight: '38px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={logout}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(245,243,238,0.72)',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="lx-nav-link"
                    style={{ color: 'rgba(245,243,238,0.88)', fontSize: '14px', fontWeight: 400 }}
                  >
                    Sign in
                  </Link>
                  <button
                    onClick={() => handleBookNow()}
                    className="lx-btn lx-glass-btn lx-glass-ivory"
                    style={{
                      borderRadius: '999px',
                      padding: '0 22px',
                      minHeight: '38px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Reserve</span>
                    <ArrowUpRight size={14} strokeWidth={1.9} className="lx-arrow" />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Bottom-Anchored Editorial Hero Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '1320px',
            width: '100%',
            margin: '0 auto',
            padding: '0 32px 56px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '36px'
            }}
          >
            <div style={{ maxWidth: '760px' }}>
              <p
                className="lx-enter lx-d1"
                style={{
                  fontSize: '13px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--bronze-dark)',
                  margin: '0 0 18px 0',
                  fontWeight: 500
                }}
              >
                Mobile Automotive Atelier
              </p>

              <h1
                className="lx-enter lx-d2"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(52px, 7.2vw, 96px)',
                  fontWeight: 400,
                  lineHeight: 0.98,
                  letterSpacing: '-0.025em',
                  color: 'var(--ivory)',
                  margin: '0 0 24px 0'
                }}
              >
                We come to your driveway.
                <br />
                <span style={{ fontStyle: 'italic', color: 'rgba(245, 243, 238, 0.82)' }}>
                  You keep your morning.
                </span>
              </h1>
            </div>

            <div className="lx-enter lx-d3" style={{ maxWidth: '380px', paddingBottom: '10px' }}>
              <p
                style={{
                  fontSize: '15px',
                  lineHeight: 1.65,
                  color: 'rgba(245, 243, 238, 0.78)',
                  margin: '0 0 24px 0'
                }}
              >
                Private, self-contained detailing vans equipped with filtered water, silent power, and paint-safe studio chemistry — dispatched directly to your car.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleBookNow()}
                  className="lx-btn lx-glass-btn lx-glass-gold"
                  style={{
                    borderRadius: '999px',
                    minHeight: '50px',
                    padding: '0 28px',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Book a detailing</span>
                  <ArrowRight size={16} strokeWidth={1.9} className="lx-arrow" />
                </button>

                <button
                  onClick={() => setShowFilm(true)}
                  className="lx-btn lx-glass-btn lx-glass-crystal"
                  style={{
                    borderRadius: '999px',
                    minHeight: '50px',
                    padding: '0 24px',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Play size={13} fill="var(--ivory)" color="var(--ivory)" className="lx-play-icon" />
                  <span>Watch film</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quiet Bottom Hairline Index */}
          <div
            className="lx-enter lx-d4"
            style={{
              marginTop: '48px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(245, 243, 238, 0.14)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              fontSize: '12px',
              color: 'rgba(245, 243, 238, 0.6)'
            }}
          >
            <span>Self-contained water &amp; power</span>
            <span>Before &amp; after photo inspection</span>
            <span>Live GPS arrival tracking</span>
            <span>No waiting rooms, ever</span>
          </div>
        </div>
      </section>

      {/* =================================================================
          2. EDITORIAL CRAFT SHOWCASE (Asymmetrical 60/40 Magazine Split)
         ================================================================= */}
      <section
        id="craft"
        style={{
          background: 'var(--alabaster)',
          padding: '112px 0',
          borderBottom: '1px solid var(--hairline-light)'
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '0 32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '64px',
            alignItems: 'center'
          }}
        >
          <Reveal>
            <div style={{ maxWidth: '500px' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '12px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--bronze)',
                  fontWeight: 600,
                  marginBottom: '16px'
                }}
              >
                Built for people who care about paint
              </span>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(36px, 4.4vw, 56px)',
                  fontWeight: 400,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: 'var(--ink-primary)',
                  margin: '0 0 24px 0'
                }}
              >
                Not a rushed street wash.
                <br />
                <span style={{ fontStyle: 'italic', color: 'var(--ink-secondary)' }}>
                  A private studio on wheels.
                </span>
              </h2>

              <p
                style={{
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'var(--ink-secondary)',
                  margin: '0 0 32px 0'
                }}
              >
                Every EGHSELHA technician works from a standardized checklist — two-bucket pH-neutral snow foam, fresh microfiber per panel, deionized rinse water, and six documented inspection photos before and after every session.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--hairline-light)'
                }}
              >
                <div>
                  <div className="mono-num" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--ink-primary)' }}>
                    30–140m
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                    Tailored session duration
                  </div>
                </div>
                <div>
                  <div className="mono-num" style={{ fontSize: '26px', fontWeight: 500, color: 'var(--ink-primary)' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                    Self-contained mobile vans
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '16px', alignItems: 'end' }}>
              <div
                className="lx-photo-wrap"
                style={{
                  aspectRatio: '4 / 5',
                  borderRadius: '12px',
                  background: 'var(--charcoal)'
                }}
              >
                <img
                  src="/car-wash-spray.jpg"
                  alt="High-pressure detailing rinse"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div
                className="lx-photo-wrap"
                style={{
                  aspectRatio: '3 / 4',
                  borderRadius: '12px',
                  background: 'var(--charcoal)'
                }}
              >
                <img
                  src="/wet-luxury-car.jpg"
                  alt="Hydrophobic ceramic gloss finish"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =================================================================
          3. INTERACTIVE ATELIER SERVICE MENU (Not 4 SaaS Pricing Boxes!)
         ================================================================= */}
      <section
        id="services"
        style={{
          background: 'var(--alabaster)',
          padding: '112px 0'
        }}
      >
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 32px' }}>
          <Reveal>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '24px',
                marginBottom: '56px'
              }}
            >
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--bronze)',
                    fontWeight: 600,
                    marginBottom: '12px'
                  }}
                >
                  The treatment menu
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(36px, 4.4vw, 56px)',
                    fontWeight: 400,
                    lineHeight: 1.04,
                    letterSpacing: '-0.02em',
                    margin: 0
                  }}
                >
                  Select your level of care
                </h2>
              </div>
              <p style={{ fontSize: '15px', color: 'var(--ink-secondary)', maxWidth: '380px', margin: 0, lineHeight: 1.6 }}>
                Select any treatment below to inspect every included step and reserve immediately.
              </p>
            </div>
          </Reveal>

          {/* Editorial Split: Left Hairline Ledger + Right Live Detail Panel */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '48px',
              alignItems: 'start'
            }}
          >
            {/* Left: Interactive Architectural Menu Rows */}
            <div style={{ borderTop: '1px solid var(--hairline-light-strong)' }}>
              {PACKAGES.map((pkg) => {
                const isSelected = pkg.id === activePkg.id
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPkgId(pkg.id)}
                    onMouseEnter={() => setSelectedPkgId(pkg.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: isSelected ? 'var(--surface-white)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--hairline-light-strong)',
                      padding: '26px 20px',
                      cursor: 'pointer',
                      display: 'grid',
                      gridTemplateColumns: '44px 1fr auto',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'background-color 220ms var(--ease-luxury), padding-left 220ms var(--ease-luxury)',
                      paddingLeft: isSelected ? '24px' : '12px'
                    }}
                  >
                    <span
                      className="mono-num"
                      style={{
                        fontSize: '13px',
                        color: isSelected ? 'var(--bronze)' : 'var(--ink-muted)',
                        fontWeight: 500
                      }}
                    >
                      {pkg.index}
                    </span>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '28px',
                            lineHeight: 1.1,
                            color: 'var(--ink-primary)'
                          }}
                        >
                          {pkg.name}
                        </span>
                        {pkg.featured && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 500,
                              color: 'var(--bronze)',
                              background: 'var(--bronze-soft)',
                              padding: '3px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            Most requested
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--ink-muted)', marginTop: '4px' }}>
                        {pkg.subtitle} · {pkg.duration}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        className="mono-num"
                        style={{
                          fontSize: '18px',
                          fontWeight: 500,
                          color: 'var(--ink-primary)',
                          display: 'block'
                        }}
                      >
                        EGP {pkg.price}
                      </span>
                      <span style={{ fontSize: '11px', color: isSelected ? 'var(--bronze)' : 'var(--ink-muted)' }}>
                        {isSelected ? 'Selected' : 'Inspect'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right: Live Selected Treatment Editorial Dossier */}
            <div
              style={{
                background: 'var(--surface-white)',
                border: '1px solid var(--hairline-light)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <div className="lx-photo-wrap" style={{ width: '100%', aspectRatio: '16 / 10', background: 'var(--charcoal)' }}>
                <img
                  key={activePkg.photo}
                  src={activePkg.photo}
                  alt={activePkg.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '32px',
                      fontWeight: 400,
                      margin: 0,
                      color: 'var(--ink-primary)'
                    }}
                  >
                    {activePkg.name}
                  </h3>
                  <span className="mono-num" style={{ fontSize: '18px', fontWeight: 500, color: 'var(--bronze)' }}>
                    EGP {activePkg.price}
                  </span>
                </div>

                <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'var(--ink-secondary)', margin: '0 0 22px 0' }}>
                  {activePkg.desc}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gap: '10px',
                    paddingTop: '18px',
                    paddingBottom: '24px',
                    borderTop: '1px solid var(--hairline-light)'
                  }}
                >
                  {activePkg.highlights.map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--ink-primary)' }}>
                      <Check size={15} strokeWidth={1.8} color="var(--bronze)" style={{ flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleBookNow(activePkg.id)}
                  className="lx-btn lx-glass-btn lx-glass-obsidian"
                  style={{
                    width: '100%',
                    minHeight: '50px',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Reserve {activePkg.name}</span>
                  <ArrowRight size={15} strokeWidth={1.9} className="lx-arrow" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          4. ARCHITECTURAL PROCESS STRIP (Open Hairline Grid — No Boxes)
         ================================================================= */}
      <section
        id="how-it-works"
        style={{
          background: 'var(--alabaster-raised)',
          padding: '104px 0',
          borderTop: '1px solid var(--hairline-light)'
        }}
      >
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 32px' }}>
          <Reveal>
            <span
              style={{
                display: 'block',
                fontSize: '12px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--bronze)',
                fontWeight: 600,
                marginBottom: '12px'
              }}
            >
              The experience
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 4.4vw, 54px)',
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                margin: '0 0 56px 0',
                maxWidth: '580px'
              }}
            >
              Effortless from reservation to final inspection
            </h2>
          </Reveal>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '32px'
            }}
          >
            {CRAFT_PILLARS.map((item, idx) => (
              <Reveal key={item.num} delay={idx * 70}>
                <div style={{ paddingTop: '24px', borderTop: '1px solid var(--hairline-light-strong)' }}>
                  <span
                    className="mono-num"
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      color: 'var(--bronze)',
                      marginBottom: '18px'
                    }}
                  >
                    {item.num}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--ink-primary)',
                      margin: '0 0 10px 0'
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'var(--ink-secondary)', margin: 0 }}>
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================
          5. FULL-BLEED AMBIENT VIDEO CLOSING BAND
         ================================================================= */}
      <section
        style={{
          position: 'relative',
          background: '#0a0a0c',
          color: 'var(--ivory)',
          padding: '120px 32px',
          overflow: 'hidden'
        }}
      >
        <video
          src="/eghselha-demo.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.34,
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(10,10,12,0.72) 0%, rgba(10,10,12,0.58) 50%, rgba(10,10,12,0.88) 100%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 5.4vw, 68px)',
                fontWeight: 400,
                lineHeight: 1.04,
                letterSpacing: '-0.02em',
                margin: '0 0 20px 0',
                color: 'var(--ivory)'
              }}
            >
              Your car deserves a quiet hour.
            </h2>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.65,
                color: 'rgba(245, 243, 238, 0.76)',
                margin: '0 auto 36px',
                maxWidth: '480px'
              }}
            >
              Book your next detailing session directly from your phone — at home, at the office, or wherever you park.
            </p>
            <button
              onClick={() => handleBookNow()}
              className="lx-btn lx-glass-btn lx-glass-ivory"
              style={{
                borderRadius: '999px',
                minHeight: '52px',
                padding: '0 32px',
                fontSize: '14px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Schedule a visit</span>
              <ArrowRight size={16} strokeWidth={1.9} className="lx-arrow" />
            </button>
          </Reveal>
        </div>
      </section>

      {/* =================================================================
          6. EDITORIAL FOOTER
         ================================================================= */}
      <footer
        style={{
          background: '#0a0a0c',
          borderTop: '1px solid var(--hairline-dark)',
          padding: '36px 32px',
          color: 'var(--ivory-muted)',
          fontSize: '13px'
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <EghselhaLogo size={30} showText={true} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            <a href="#craft" style={{ color: 'var(--ivory-secondary)', textDecoration: 'none' }}>The craft</a>
            <a href="#services" style={{ color: 'var(--ivory-secondary)', textDecoration: 'none' }}>Services</a>
            <a href="#how-it-works" style={{ color: 'var(--ivory-secondary)', textDecoration: 'none' }}>How it works</a>
            <Link to="/login" style={{ color: 'var(--ivory-secondary)', textDecoration: 'none' }}>Sign in</Link>
            <Link to="/register" style={{ color: 'var(--ivory-secondary)', textDecoration: 'none' }}>Create account</Link>
          </div>
          <span>© 2026 EGHSELHA</span>
        </div>
      </footer>

      {/* =================================================================
          7. FILM MODAL (Muted)
         ================================================================= */}
      {showFilm && (
        <div
          onClick={() => setShowFilm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(10, 10, 12, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '820px',
              background: '#141416',
              borderRadius: '16px',
              border: '1px solid var(--hairline-dark-strong)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 22px',
                borderBottom: '1px solid var(--hairline-dark)'
              }}
            >
              <span style={{ color: 'var(--ivory)', fontSize: '14px', fontWeight: 500 }}>
                EGHSELHA · Mobile Automotive Atelier
              </span>
              <button
                onClick={() => setShowFilm(false)}
                aria-label="Close"
                style={{ background: 'none', border: 'none', color: 'var(--ivory-secondary)', cursor: 'pointer' }}
              >
                <X size={18} strokeWidth={1.6} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ aspectRatio: '16 / 9', borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
                <video
                  src="/eghselha-demo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
