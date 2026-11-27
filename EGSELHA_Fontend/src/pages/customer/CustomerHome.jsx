import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Car,
  MapPin,
  ShieldCheck,
  Check,
  ArrowRight,
  Clock,
  Droplets,
  Star,
  Phone,
  Plus,
  X,
  ChevronRight,
  Eye
} from 'lucide-react'
import { useCustomer } from '../../context/CustomerContext'
import { useAuth } from '../../context/AuthContext'
import { customerApi } from '../../services/customerApi'
import TechnicianPublicProfileModal from '../../component/TechnicianPublicProfileModal'
import LiveTrackingMap from '../../component/LiveTrackingMap'

const PACKAGES = [
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
    name: 'Basic Wash',
    badge: 'Exterior Reset',
    basePrice: 200,
    duration: '30 mins',
    desc: 'Exterior pressure wash, snow foam bath, satin tire dressing & streak-free windows.',
    highlights: ['Snow Foam Wash', 'High Pressure Rinse', 'Tire Gloss Dressing', 'Exterior Windows']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    name: 'Premium Wash',
    badge: 'Most Requested',
    isPopular: true,
    basePrice: 350,
    duration: '60 mins',
    desc: 'Full cabin vacuum, dashboard conditioning, hand snow foam bath & hydrophobic spray wax.',
    highlights: ['Interior Cabin Vacuum', 'Dashboard & Trim Care', 'Hand Foam Wash', 'Spray Wax Sealant', 'Subtle Air Freshener']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
    name: 'Deep Clean',
    badge: 'Steam & Leather',
    basePrice: 500,
    duration: '90 mins',
    desc: 'Hot steam upholstery extraction, carpet shampooing, leather feed & AC sanitation.',
    highlights: ['Interior Steam Extraction', 'Carpet & Mat Shampoo', 'Leather Conditioning', 'AC Vent Disinfection', 'Engine Bay Wipe']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004',
    name: 'Ultimate Detail',
    badge: 'Ceramic & Polish',
    basePrice: 700,
    duration: '140 mins',
    desc: 'Clay bar paint decontamination, machine gloss polish & 6-month ceramic protection.',
    highlights: ['Clay Bar Paint Treatment', 'Machine Gloss Polish', '6-Month Ceramic Coat', 'Complete Interior Restore', 'Headlight Clarity']
  }
]

const EXPERIENCE_STEPS = [
  {
    num: '01',
    title: 'Book in 60 seconds',
    body: 'Choose on-demand Fast Track or schedule a dedicated window at your home driveway or office parking.'
  },
  {
    num: '02',
    title: 'Self-contained arrival',
    body: 'Our mobile detailing vans arrive with onboard filtered water tanks, silent power, and studio chemistry.'
  },
  {
    num: '03',
    title: 'Photographed & guaranteed',
    body: 'Before-and-after inspection photos verify every panel. Backed by our quality guarantee.'
  }
]

export default function CustomerHome() {
  const navigate = useNavigate()
  const { profile, vehicles, bookings, notify } = useCustomer()
  const { user } = useAuth()
  const [packages, setPackages] = useState(PACKAGES)

  useEffect(() => {
    customerApi.getCatalog()
      .then((cat) => {
        if (cat?.packages?.length) {
          setPackages((prev) =>
            cat.packages.map((dbPkg) => {
              const local = prev.find((p) => p.id.toLowerCase() === dbPkg.id.toLowerCase()) || prev[1]
              return {
                ...local,
                id: dbPkg.id.toLowerCase(),
                name: dbPkg.name,
                basePrice: dbPkg.basePrice,
                duration: `${dbPkg.durationMinutes} mins`
              }
            })
          )
        }
      })
      .catch(console.error)
  }, [])

  const customerFirstName = (user?.fullName || profile?.fullName || 'Guest').split(' ')[0]

  const activeWash = bookings.find(
    (b) => b.status === 'ON_THE_WAY' || b.status === 'ARRIVED' || b.status === 'WASHING' || b.status === 'DISPATCHED'
  )

  const [showLiveTracking, setShowLiveTracking] = useState(false)
  const [showTechProfile, setShowTechProfile] = useState(false)

  const handleHeroQuickBook = () => navigate('/customer/book')
  const handleBookPackage = (pkgId) => navigate(`/customer/book?package=${encodeURIComponent(pkgId)}`)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* 1. ACTIVE WASH TRACKER BANNER */}
      {activeWash && (
        <div
          className="lx-enter lx-d1"
          style={{
            background: 'var(--obsidian)',
            borderRadius: '18px',
            padding: '22px 28px',
            color: 'var(--ivory)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            border: '1px solid rgba(198, 146, 73, 0.3)',
            boxShadow: '0 14px 34px rgba(14, 14, 16, 0.16)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(198, 146, 73, 0.14)',
                border: '1px solid rgba(198, 146, 73, 0.32)',
                color: 'var(--bronze-dark)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
            >
              <Car size={22} strokeWidth={1.7} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span
                  style={{
                    background: 'rgba(198, 146, 73, 0.18)',
                    color: 'var(--bronze-dark)',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  Live · {activeWash.status}
                </span>
                <span className="mono-num" style={{ fontSize: '12px', color: 'var(--ivory-secondary)' }}>
                  {activeWash.bookingNumber}
                </span>
              </div>
              <b style={{ fontSize: '16px', fontWeight: 500, color: 'var(--ivory)', display: 'block' }}>
                {activeWash.serviceName || activeWash.packageName || 'Premium Wash'} in progress
              </b>
              <small style={{ fontSize: '12px', color: 'var(--ivory-secondary)' }}>
                Technician:{' '}
                <b
                  onClick={() => activeWash.technicianName && setShowTechProfile(true)}
                  style={{
                    cursor: activeWash.technicianName ? 'pointer' : 'default',
                    textDecoration: activeWash.technicianName ? 'underline' : 'none',
                    color: 'var(--bronze-dark)'
                  }}
                >
                  {activeWash.technicianName || 'Assigned Technician'}
                </b>
                {' '}· Live GPS active
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {activeWash.technicianName && (
              <button
                onClick={() => setShowTechProfile(true)}
                className="lx-btn lx-glass-btn lx-glass-crystal"
                style={{
                  borderRadius: '999px',
                  minHeight: '38px',
                  padding: '0 16px',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Eye size={14} strokeWidth={1.7} />
                <span>Technician</span>
              </button>
            )}
            <button
              onClick={() => notify(`Calling technician... (${activeWash.technicianPhone || '+20 101 234 5678'})`)}
              className="lx-btn lx-glass-btn lx-glass-crystal"
              style={{
                borderRadius: '999px',
                minHeight: '38px',
                padding: '0 16px',
                fontSize: '12px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Phone size={14} strokeWidth={1.7} />
              <span>Call</span>
            </button>
            <button
              onClick={() => setShowLiveTracking(true)}
              className="lx-btn lx-glass-btn lx-glass-gold"
              style={{
                borderRadius: '999px',
                minHeight: '38px',
                padding: '0 18px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MapPin size={14} strokeWidth={1.8} />
              <span>Track live</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. EDITORIAL HERO BANNER */}
      <section
        className="lx-enter lx-d1"
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          background: '#0a0a0c',
          border: '1px solid var(--hairline-dark)',
          color: 'var(--ivory)',
          padding: '48px 48px 40px',
          position: 'relative',
          boxShadow: '0 16px 40px rgba(14, 14, 16, 0.14)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '58%',
            minWidth: '340px',
            backgroundImage: 'url("/wet-luxury-car.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.88) 46%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.88) 46%, black 100%)',
            opacity: 0.9,
            pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '540px' }}>
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--bronze-dark)',
              fontWeight: 600,
              marginBottom: '12px'
            }}
          >
            Welcome back, {customerFirstName}
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 4vw, 52px)',
              fontWeight: 400,
              margin: '0 0 14px 0',
              lineHeight: 1.04,
              letterSpacing: '-0.02em',
              color: 'var(--ivory)'
            }}
          >
            Mobile auto detailing,
            <br />
            <span style={{ fontStyle: 'italic', color: 'rgba(245, 243, 238, 0.8)' }}>at your doorstep.</span>
          </h1>

          <p style={{ fontSize: '14px', color: 'rgba(245, 243, 238, 0.72)', lineHeight: 1.65, margin: '0 0 28px 0', maxWidth: '440px' }}>
            Certified mobile detailers arrive directly at your home or office with filtered water, silent power, and paint-safe studio chemistry.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleHeroQuickBook}
              className="lx-btn lx-glass-btn lx-glass-gold"
              style={{
                borderRadius: '999px',
                padding: '0 26px',
                minHeight: '46px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Book a detailing</span>
              <ArrowRight size={15} strokeWidth={1.9} className="lx-arrow" />
            </button>

            <button
              onClick={() => navigate('/customer/bookings')}
              className="lx-btn lx-glass-btn lx-glass-crystal"
              style={{
                borderRadius: '999px',
                padding: '0 22px',
                minHeight: '46px',
                fontSize: '13px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>View my bookings</span>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              marginTop: '32px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(245, 243, 238, 0.14)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'rgba(245, 243, 238, 0.66)' }}>
              <Droplets size={14} strokeWidth={1.6} color="var(--bronze-dark)" /> Self-contained water &amp; power
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'rgba(245, 243, 238, 0.66)' }}>
              <ShieldCheck size={14} strokeWidth={1.6} color="var(--bronze-dark)" /> Photo-verified finish
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'rgba(245, 243, 238, 0.66)' }}>
              <Star size={14} strokeWidth={1.6} fill="var(--bronze-dark)" color="var(--bronze-dark)" /> Certified detailers
            </div>
          </div>
        </div>
      </section>

      {/* 3. MY GARAGE QUICK SELECTOR */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '18px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>My Garage</span>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 400, color: 'var(--ink-primary)', fontFamily: 'var(--font-display)' }}>
              Select a vehicle for one-click booking
            </h2>
          </div>
          <button
            onClick={() => navigate('/customer/profile')}
            className="lx-nav-link"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink-primary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0
            }}
          >
            <span>Manage vehicles &amp; addresses</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {vehicles.map((v) => (
            <div
              key={v.id}
              onClick={() => navigate(`/customer/book?vehicle=${encodeURIComponent(v.id)}`)}
              className="lx-card"
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1px solid var(--hairline-light)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'var(--obsidian)',
                    color: 'var(--bronze-dark)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                  }}
                >
                  <Car size={20} strokeWidth={1.7} />
                </div>
                <div>
                  <b style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-primary)', display: 'block' }}>
                    {v.make} {v.model}
                  </b>
                  <small className="mono-num" style={{ color: 'var(--ink-muted)', fontSize: '12px' }}>
                    {v.licensePlate} · {v.color}
                  </small>
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bronze-soft)',
                  color: 'var(--bronze)',
                  borderRadius: '999px',
                  width: '34px',
                  height: '34px',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                <ArrowRight size={15} strokeWidth={1.8} />
              </div>
            </div>
          ))}

          {/* Add car card */}
          <div
            onClick={() => navigate('/customer/profile')}
            style={{
              background: 'var(--alabaster-raised)',
              borderRadius: '16px',
              padding: '18px 20px',
              border: '1px dashed var(--hairline-light-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: 'var(--ink-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'border-color 180ms var(--ease-luxury), color 180ms var(--ease-luxury)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--bronze)'
              e.currentTarget.style.color = 'var(--ink-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--hairline-light-strong)'
              e.currentTarget.style.color = 'var(--ink-secondary)'
            }}
          >
            <Plus size={16} strokeWidth={1.8} />
            <span>Add vehicle to garage</span>
          </div>
        </div>
      </section>

      {/* 4. TREATMENT PACKAGES */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Treatment Menu</span>
            <h2 style={{ margin: 0, fontSize: '30px', fontWeight: 400, color: 'var(--ink-primary)', fontFamily: 'var(--font-display)' }}>
              Our detailing packages
            </h2>
          </div>
          <button
            onClick={() => navigate('/customer/book')}
            className="lx-nav-link"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--ink-primary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0
            }}
          >
            <span>Customise with add-ons</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))', gap: '18px' }}>
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="lx-card"
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '24px',
                border: pkg.isPopular ? '1.5px solid var(--bronze)' : '1px solid var(--hairline-light)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {pkg.isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-11px',
                    left: '22px',
                    background: 'var(--obsidian)',
                    color: 'var(--bronze-dark)',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '999px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                >
                  Most requested
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <b style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 400, color: 'var(--ink-primary)' }}>
                    {pkg.name}
                  </b>
                  <span style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {pkg.duration}
                  </span>
                </div>

                <div style={{ margin: '6px 0 14px' }}>
                  <span className="mono-num" style={{ fontSize: '24px', fontWeight: 500, color: 'var(--ink-primary)' }}>
                    EGP {pkg.basePrice}
                  </span>
                  <small style={{ fontSize: '12px', color: 'var(--ink-muted)', marginLeft: '6px' }}>base rate</small>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: '0 0 18px' }}>
                  {pkg.desc}
                </p>

                <div style={{ borderTop: '1px solid var(--hairline-light)', paddingTop: '14px', marginBottom: '22px' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pkg.highlights.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink-primary)' }}>
                        <Check size={14} strokeWidth={1.9} color="var(--bronze)" style={{ flexShrink: 0 }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleBookPackage(pkg.id)}
                className={pkg.isPopular ? 'lx-btn lx-glass-btn lx-glass-obsidian' : 'btn outline full'}
                style={{
                  width: '100%',
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
                <span>Reserve {pkg.name}</span>
                <ArrowRight size={14} strokeWidth={1.8} className="lx-arrow" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ARCHITECTURAL 3-STEP EXPERIENCE STRIP */}
      <section
        style={{
          background: 'var(--alabaster-raised)',
          borderRadius: '20px',
          padding: '36px 38px',
          border: '1px solid var(--hairline-light)'
        }}
      >
        <div style={{ marginBottom: '28px' }}>
          <span className="eyebrow" style={{ display: 'block', marginBottom: '6px' }}>The standard</span>
          <h2 style={{ margin: 0, fontSize: '30px', fontWeight: 400, color: 'var(--ink-primary)', fontFamily: 'var(--font-display)' }}>
            Effortless from reservation to final inspection
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '28px' }}>
          {EXPERIENCE_STEPS.map((step) => (
            <div key={step.num} style={{ paddingTop: '18px', borderTop: '1px solid var(--hairline-light-strong)' }}>
              <span className="mono-num" style={{ display: 'block', fontSize: '12px', color: 'var(--bronze)', marginBottom: '12px' }}>
                {step.num}
              </span>
              <b style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink-primary)', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                {step.title}
              </b>
              <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', lineHeight: 1.6, margin: 0 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. RECURRING SUBSCRIPTIONS EDITORIAL BANNER */}
      <section
        style={{
          borderRadius: '20px',
          background: 'var(--obsidian)',
          color: 'var(--ivory)',
          padding: '36px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          border: '1px solid var(--hairline-dark)'
        }}
      >
        <div>
          <span
            style={{
              color: 'var(--bronze-dark)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '8px'
            }}
          >
            Weekly &amp; Monthly Care Plans
          </span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, margin: '0 0 8px 0', color: 'var(--ivory)' }}>
            Save up to 15% with recurring detailing
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--ivory-secondary)', margin: 0, maxWidth: '520px', lineHeight: 1.6 }}>
            Automate your vehicle care. Pick your preferred recurring day and keep your car spotless every week or month.
          </p>
        </div>

        <button
          onClick={() => navigate('/customer/book')}
          className="lx-btn lx-glass-btn lx-glass-ivory"
          style={{
            borderRadius: '999px',
            minHeight: '46px',
            padding: '0 26px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Explore care plans</span>
          <ArrowRight size={15} strokeWidth={1.8} className="lx-arrow" />
        </button>
      </section>

      {/* LIVE TRACKING MODAL */}
      {showLiveTracking && activeWash && (
        <div className="modal-overlay" onClick={() => setShowLiveTracking(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div>
                <h3>Live detailing tracker</h3>
                <p>Booking {activeWash.bookingNumber} · {activeWash.status}</p>
              </div>
              <button onClick={() => setShowLiveTracking(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <LiveTrackingMap booking={activeWash} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#ffffff', border: '1px solid var(--hairline-light)', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '999px', background: 'var(--bronze-soft)', color: 'var(--bronze)', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: '13px' }}>
                    {(activeWash.technicianName || 'Tech').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <b style={{ fontSize: '14px', color: 'var(--ink-primary)' }}>{activeWash.technicianName || 'Assigned Technician'}</b>
                    <small style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'block' }}>
                      {activeWash.technicianPhone || 'Technician assigned · On the way'}
                    </small>
                  </div>
                </div>

                {activeWash.technicianPhone ? (
                  <a
                    href={`tel:${activeWash.technicianPhone.replace(/\s+/g, '')}`}
                    className="btn primary sm"
                    style={{ textDecoration: 'none' }}
                  >
                    <Phone size={13} /> Call tech
                  </a>
                ) : (
                  <button
                    className="btn outline sm"
                    onClick={() => notify('Awaiting technician assignment before calling.')}
                  >
                    <Phone size={13} /> Pending tech
                  </button>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {activeWash.technicianName && (
                <button
                  className="btn soft sm"
                  onClick={() => {
                    setShowLiveTracking(false)
                    setShowTechProfile(true)
                  }}
                >
                  <Eye size={14} /> Show tech profile
                </button>
              )}
              <button className="btn outline sm" onClick={() => setShowLiveTracking(false)}>Close tracker</button>
            </div>
          </div>
        </div>
      )}

      {/* Read-Only Technician Public Profile Modal */}
      <TechnicianPublicProfileModal
        booking={showTechProfile ? activeWash : null}
        onClose={() => setShowTechProfile(false)}
      />
    </div>
  )
}
