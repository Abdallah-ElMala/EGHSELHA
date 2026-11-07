import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Car,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Droplets,
  Zap,
  Star,
  Award,
  Phone,
  Plus,
  X,
  CreditCard,
  ThumbsUp,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import { useCustomer } from '../../context/CustomerContext'
import { customerApi } from '../../services/customerApi'

const PACKAGES = [
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
    name: 'Basic Wash',
    badge: 'Quick & Clean',
    basePrice: 200,
    duration: '30 mins',
    desc: 'Exterior pressure wash, snow foam bath, tire gloss & streak-free windows.',
    highlights: ['Snow Foam Wash', 'High Pressure Rinse', 'Tire Gloss Dressing', 'Exterior Windows']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    name: 'Premium Wash',
    badge: 'Most Popular ⭐',
    isPopular: true,
    basePrice: 350,
    duration: '60 mins',
    desc: 'Full cabin vacuum, dashboard dressing, snow foam bath & spray wax shine.',
    highlights: ['Interior Cabin Vacuum', 'Dashboard & Trim Care', 'Hand Foam Wash', 'Spray Wax Sealant', 'Air Freshener']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
    name: 'Deep Clean',
    badge: 'Full Detailing',
    basePrice: 500,
    duration: '90 mins',
    desc: 'Steam upholstery detailing, carpet extraction & AC antibacterial sanitation.',
    highlights: ['Interior Steam Extraction', 'Carpet & Mat Shampoo', 'Leather Conditioning', 'AC Vent Disinfection', 'Engine Bay Wipe']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004',
    name: 'Ultimate Detail',
    badge: 'Ceramic & Polish',
    basePrice: 700,
    duration: '140 mins',
    desc: 'Clay bar paint decontamination, machine polish & 6-month ceramic protection.',
    highlights: ['Clay Bar Paint Treatment', 'Machine Gloss Polish', '6-Month Ceramic Coat', 'Complete Interior Restore', 'Headlight Clarity']
  }
]

export default function CustomerHome() {
  const navigate = useNavigate()
  const { profile, vehicles, bookings, notify } = useCustomer()

  const customerFirstName = profile?.fullName ? profile.fullName.split(' ')[0] : 'Ahmed'

  // Quick Book Selector state inside Hero
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '')
  const [selectedAddress, setSelectedAddress] = useState(
    profile?.savedAddresses?.[0] || 'New Cairo, 5th Settlement'
  )

  // Check for active wash in progress
  const activeWash = bookings.find(
    (b) => b.status === 'ON_THE_WAY' || b.status === 'ARRIVED' || b.status === 'WASHING' || b.status === 'DISPATCHED'
  )

  // Live tracking modal
  const [showLiveTracking, setShowLiveTracking] = useState(false)

  const handleHeroQuickBook = () => {
    navigate('/customer/book')
  }

  const handleBookPackage = (pkgId) => {
    navigate(`/customer/book?package=${encodeURIComponent(pkgId)}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* 1. ACTIVE WASH TRACKER BANNER (Shows only if there's an ongoing job) */}
      {activeWash && (
        <div
          style={{
            background: 'linear-gradient(135deg, #07172c 0%, #0d2847 100%)',
            borderRadius: '20px',
            padding: '20px 28px',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 8px 25px rgba(7, 23, 44, 0.25)',
            border: '1px solid rgba(8, 124, 240, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(8, 124, 240, 0.25)',
                color: '#60b4ff',
                display: 'grid',
                placeItems: 'center',
                animation: 'pulse 2s infinite',
                flexShrink: 0
              }}
            >
              <Car size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    background: '#087cf0',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    letterSpacing: '0.5px'
                  }}
                >
                  LIVE SERVICE · {activeWash.status}
                </span>
                <span style={{ fontSize: '12px', color: '#93c5fd' }}>{activeWash.bookingNumber}</span>
              </div>
              <b style={{ fontSize: '15px', color: '#fff', display: 'block' }}>
                {activeWash.serviceName || activeWash.packageName || 'Premium Wash'} in progress
              </b>
              <small style={{ fontSize: '11px', color: '#cbd5e1' }}>
                Technician: <b>{activeWash.technicianName || 'Mohamed Ali'}</b> · ETA: ~8 mins away
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => notify(`Calling technician... (+20 101 234 5678)`)}
              className="btn outline"
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '11px',
                padding: '9px 14px'
              }}
            >
              <Phone size={14} /> Call Tech
            </button>
            <button
              onClick={() => setShowLiveTracking(true)}
              className="btn primary"
              style={{ fontSize: '11px', padding: '9px 18px', background: '#087cf0' }}
            >
              <MapPin size={14} /> Track Live On Map
            </button>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION: Doorstep Car Wash Welcome */}
      <section
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'radial-gradient(circle at 75% 30%, #113359 0%, #07172c 60%, #050f1d 100%)',
          color: '#fff',
          padding: '44px 44px 38px 44px',
          position: 'relative',
          boxShadow: '0 12px 30px rgba(7, 23, 44, 0.12)'
        }}
      >
        {/* Background Car Graphic */}
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            bottom: '0',
            width: '460px',
            height: '100%',
            backgroundImage: 'url("https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
            opacity: 0.75,
            pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(8, 124, 240, 0.2)',
              border: '1px solid rgba(8, 124, 240, 0.4)',
              borderRadius: '20px',
              padding: '5px 14px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#60b4ff',
              marginBottom: '16px'
            }}
          >
            <Sparkles size={13} />
            <span>Doorstep Car Detailing Across Cairo</span>
          </div>

          <h1
            style={{
              fontSize: '34px',
              fontWeight: 800,
              margin: '0 0 12px 0',
              lineHeight: 1.2,
              fontFamily: 'Manrope, sans-serif'
            }}
          >
            Welcome back, {customerFirstName}!<br />
            Keep your car showroom clean.
          </h1>

          <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 24px 0', maxWidth: '480px' }}>
            Certified mobile detailers come directly to your home, office, or driveway. We bring our own water, power, and professional equipment.
          </p>

          {/* Quick Book Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={handleHeroQuickBook}
              style={{
                background: '#087cf0',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px 28px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(8, 124, 240, 0.4)',
                transition: 'transform 0.2s, background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.background = '#006bd5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = '#087cf0'
              }}
            >
              <span>Book a Mobile Wash Now</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate('/customer/bookings')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '13px 22px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              View My Bookings
            </button>
          </div>

          {/* Value highlights underneath */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '28px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}>
              <Droplets size={14} color="#60b4ff" /> 100% Mobile Water & Power
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}>
              <ShieldCheck size={14} color="#4ade80" /> 100% Guarantee
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}>
              <Star size={14} fill="#facc15" color="#facc15" /> 4.9/5 Certified Techs
            </div>
          </div>
        </div>
      </section>

      {/* 3. MY GARAGE QUICK SELECTOR (Quick car selection) */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#102a40', fontFamily: 'Manrope, sans-serif' }}>
              My Garage
            </h2>
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Select a vehicle to book a wash in 1 click
            </small>
          </div>
          <button
            onClick={() => navigate('/customer/profile')}
            style={{ background: 'none', border: 'none', color: '#087cf0', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Manage Vehicles & Addresses</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {vehicles.map((v) => (
            <div
              key={v.id}
              onClick={() => navigate(`/customer/book?vehicle=${encodeURIComponent(v.id)}`)}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1.5px solid #edf2f7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#087cf0'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#edf2f7'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#07172c',
                    color: '#60b4ff',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                  }}
                >
                  <Car size={22} />
                </div>
                <div>
                  <b style={{ fontSize: '14px', color: '#102a40', display: 'block' }}>{v.make} {v.model}</b>
                  <small style={{ color: '#64748b', fontSize: '11px' }}>
                    {v.licensePlate} · {v.color}
                  </small>
                </div>
              </div>

              <div
                style={{
                  background: '#f0f7ff',
                  color: '#087cf0',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                <ArrowRight size={15} />
              </div>
            </div>
          ))}

          {/* Add car card */}
          <div
            onClick={() => navigate('/customer/profile')}
            style={{
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '18px 20px',
              border: '1.5px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: '#087cf0',
              fontWeight: 700,
              fontSize: '12px',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={16} />
            <span>Add Another Car to Garage</span>
          </div>
        </div>
      </section>

      {/* 4. OUR SERVICE PACKAGES (Visual 4-Tier Grid) */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#102a40', fontFamily: 'Manrope, sans-serif' }}>
              Our Detailing Packages
            </h2>
            <small style={{ color: '#64748b', fontSize: '12px' }}>
              Eco-friendly pressure wash with mobile water and electricity
            </small>
          </div>
          <button
            onClick={() => navigate('/customer/book')}
            style={{ background: 'none', border: 'none', color: '#087cf0', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Customise & Add-Ons</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              style={{
                background: '#fff',
                borderRadius: '18px',
                padding: '24px',
                border: pkg.isPopular ? '2px solid #087cf0' : '1px solid #edf2f7',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: pkg.isPopular ? '0 8px 24px rgba(8, 124, 240, 0.12)' : '0 2px 10px rgba(0,0,0,0.02)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {pkg.isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-11px',
                    left: '20px',
                    background: '#087cf0',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '3px 12px',
                    borderRadius: '20px',
                    letterSpacing: '0.5px'
                  }}
                >
                  MOST POPULAR
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <b style={{ fontSize: '16px', color: '#102a40' }}>{pkg.name}</b>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} /> {pkg.duration}
                  </span>
                </div>

                <div style={{ margin: '8px 0 14px' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#102a40' }}>EGP {pkg.basePrice}</span>
                  <small style={{ fontSize: '11px', color: '#8493a2', marginLeft: '6px' }}>base rate</small>
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px' }}>{pkg.desc}</p>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '8px' }}>
                    Included Services
                  </span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pkg.highlights.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: '#334155' }}>
                        <CheckCircle2 size={13} color="#16a34a" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleBookPackage(pkg.id)}
                style={{
                  width: '100%',
                  background: pkg.isPopular ? '#087cf0' : '#f0f7ff',
                  color: pkg.isPopular ? '#fff' : '#087cf0',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background 0.2s'
                }}
              >
                <span>Book This Package</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW EGHSELHA WORKS (3 Simple Steps) */}
      <section
        style={{
          background: '#fff',
          borderRadius: '22px',
          padding: '36px',
          border: '1px solid #edf2f7',
          boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '520px', margin: '0 auto 32px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 800, color: '#102a40', fontFamily: 'Manrope, sans-serif' }}>
            Car Washing Made Effortless
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Enjoy your day while certified detailing specialists make your vehicle spotless right where it is parked.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: '#eaf4ff',
                color: '#087cf0',
                display: 'grid',
                placeItems: 'center',
                marginBottom: '16px'
              }}
            >
              <Calendar size={28} />
            </div>
            <b style={{ fontSize: '15px', color: '#102a40', display: 'block', marginBottom: '6px' }}>1. Book in 60 Seconds</b>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Choose on-demand Fast Track (under 5 km) or schedule a specific time at your home or office parking.
            </p>
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'grid',
                placeItems: 'center',
                marginBottom: '16px'
              }}
            >
              <Droplets size={28} />
            </div>
            <b style={{ fontSize: '15px', color: '#102a40', display: 'block', marginBottom: '6px' }}>2. We Bring Water & Power</b>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              Our mobile detailing vans are 100% self-sufficient with onboard water tanks and electricity generators.
            </p>
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: '#f0fdf4',
                color: '#16a34a',
                display: 'grid',
                placeItems: 'center',
                marginBottom: '16px'
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <b style={{ fontSize: '15px', color: '#102a40', display: 'block', marginBottom: '6px' }}>3. Guaranteed Quality</b>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              8 mandatory Quality Assurance photos verify every angle. 100% money-back or free re-wash guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* 6. SUBSCRIPTION & RECURRING SAVINGS PROMO BANNER */}
      <section
        style={{
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)',
          color: '#fff',
          padding: '32px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 8px 24px rgba(3, 105, 161, 0.2)'
        }}
      >
        <div>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '20px',
              display: 'inline-block',
              marginBottom: '10px'
            }}
          >
            WEEKLY & MONTHLY WASH PLANS
          </span>
          <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', fontFamily: 'Manrope, sans-serif' }}>
            Save up to 15% with Recurring Subscriptions
          </h3>
          <p style={{ fontSize: '12px', color: '#e0f2fe', margin: 0, maxWidth: '520px', lineHeight: 1.5 }}>
            Automate your car care. Pick your preferred recurring day, and we'll keep your vehicle sparkling clean every week or month.
          </p>
        </div>

        <button
          onClick={() => navigate('/customer/book')}
          style={{
            background: '#fff',
            color: '#0369a1',
            border: 'none',
            borderRadius: '12px',
            padding: '13px 24px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          View Subscription Plans
        </button>
      </section>

      {/* LIVE TRACKING MODAL */}
      {showLiveTracking && activeWash && (
        <div className="modal-overlay" onClick={() => setShowLiveTracking(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div>
                <h3>Live Detailing Tracker</h3>
                <p>Booking {activeWash.bookingNumber} · {activeWash.status}</p>
              </div>
              <button onClick={() => setShowLiveTracking(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ height: '230px', borderRadius: '12px', overflow: 'hidden', position: 'relative', background: '#dce8dc', border: '1px solid #c8d8c8', marginBottom: '16px' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(8, 124, 240, 0.25)', display: 'grid', placeItems: 'center', animation: 'pulse 1.5s infinite' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#087cf0', color: '#fff', display: 'grid', placeItems: 'center' }}>
                      <MapPin size={16} />
                    </div>
                  </div>
                  <b style={{ fontSize: '11px', background: '#fff', padding: '3px 10px', borderRadius: '6px', marginTop: '6px', color: '#1e293b', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    Technician Van: ~8 mins away (3.1 km)
                  </b>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Technician"
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <b style={{ fontSize: '13px', color: '#102a40' }}>{activeWash.technicianName || 'Mohamed Ali'}</b>
                    <small style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Verified Specialist · ★ 4.9 (120 washes)</small>
                  </div>
                </div>

                <button
                  className="btn primary"
                  style={{ fontSize: '11px', padding: '8px 14px' }}
                  onClick={() => notify(`Calling ${activeWash.technicianName || 'Mohamed Ali'}... (+20 101 234 5678)`)}
                >
                  <Phone size={13} /> Call Tech
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn outline" onClick={() => setShowLiveTracking(false)}>Close Tracker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
