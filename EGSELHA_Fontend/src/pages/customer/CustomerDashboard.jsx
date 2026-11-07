import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Star,
  Phone,
  AlertCircle,
  Check,
  X,
  CreditCard,
  ShieldAlert,
  Car
} from 'lucide-react'
import { useCustomer } from '../../context/CustomerContext'
import { customerApi } from '../../services/customerApi'

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const { profile, bookings, notify, refreshData } = useCustomer()

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showLiveTracking, setShowLiveTracking] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [activeDepositBooking, setActiveDepositBooking] = useState(null)
  const [depositLoading, setDepositLoading] = useState(false)

  // Derived or fallback data matching screenshot exactly
  const totalBookingsCount = bookings.length > 0 ? bookings.length : 5
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'Completed').length || 4
  const pendingCount = bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'Completed').length || 1

  // Active / next booking
  const nextWash = bookings.find(
    (b) => b.status === 'ON_THE_WAY' || b.status === 'DISPATCHED' || b.status === 'IN_PROGRESS' || b.status === 'CONFIRMED'
  ) || {
    id: 'b1',
    bookingNumber: '#BK-00124',
    packageName: 'Premium Wash',
    scheduledDate: '25 Apr 2025 - 10:00 AM',
    totalPrice: 300,
    status: 'On The Way',
    technicianName: 'Mohamed Ali',
    technicianRating: '4.8 (120 reviews)',
    vehicleName: 'BMW 320i (White)'
  }

  // Sample or live bookings for recent table
  const defaultRecent = [
    {
      id: 'b1',
      bookingNumber: '#BK-00124',
      packageName: 'Premium Wash',
      date: '25 Apr 2025',
      price: 'EGP 300',
      status: 'On The Way',
      statusType: 'on-the-way'
    },
    {
      id: 'b2',
      bookingNumber: '#BK-00123',
      packageName: 'Deep Clean',
      date: '22 Apr 2025',
      price: 'EGP 500',
      status: 'Completed',
      statusType: 'completed'
    },
    {
      id: 'b3',
      bookingNumber: '#BK-00122',
      packageName: 'Basic Wash',
      date: '18 Apr 2025',
      price: 'EGP 200',
      status: 'Completed',
      statusType: 'completed'
    }
  ]

  const displayBookings = bookings.length >= 3
    ? bookings.slice(0, 5).map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber || `#BK-${b.id?.slice(0, 5)}`,
        packageName: b.packageName || 'Premium Wash',
        date: new Date(b.scheduledDate || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        price: `EGP ${b.totalPrice || 300}`,
        status: b.status === 'COMPLETED' ? 'Completed' : b.status === 'ON_THE_WAY' ? 'On The Way' : b.status || 'Pending',
        statusType: b.status === 'COMPLETED' ? 'completed' : 'on-the-way',
        raw: b
      }))
    : defaultRecent

  const pendingUpsellBooking = bookings.find((b) => b.hasPendingUpsell)

  const handleApproveUpsell = async (upsellId, decision) => {
    try {
      await customerApi.approveUpsell(upsellId, decision)
      notify(decision ? 'Inspection Upsell approved! Extra fee added.' : 'Inspection Upsell declined.')
      refreshData()
    } catch (e) {
      console.error(e)
      notify('Failed to respond to upsell.')
    }
  }

  const handlePayDeposit = async () => {
    if (!activeDepositBooking) return
    setDepositLoading(true)
    try {
      await customerApi.payDeposit(activeDepositBooking.id, 200, 'CARD')
      notify('Deposit of EGP 200 paid successfully! Booking confirmed.')
      setShowDepositModal(false)
      setActiveDepositBooking(null)
      refreshData()
    } catch (e) {
      console.error(e)
      notify('Deposit payment failed.')
    } finally {
      setDepositLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Pending Inspection Upsell Alert Banner (if any) */}
      {pendingUpsellBooking && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: '2px solid #f97316',
            boxShadow: '0 8px 20px -4px rgba(249, 115, 22, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                background: '#f97316',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
            >
              <AlertCircle size={22} />
            </div>
            <div>
              <b style={{ color: '#9a3412', fontSize: '14px', display: 'block' }}>
                On-Site Extra Cleaning Requested for Booking {pendingUpsellBooking.bookingNumber}
              </b>
              <p style={{ margin: '3px 0 0', color: '#c2410c', fontSize: '12px' }}>
                Technician found heavy mud / stains requiring extra detail (+EGP {pendingUpsellBooking.pendingUpsellPrice || 150}).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn outline"
              style={{ borderColor: '#ea580c', color: '#9a3412', padding: '8px 14px', fontSize: '11px' }}
              onClick={() => handleApproveUpsell(pendingUpsellBooking.pendingUpsellId, false)}
            >
              Decline Extra
            </button>
            <button
              className="btn primary"
              style={{ backgroundColor: '#f97316', borderColor: '#ea580c', padding: '8px 14px', fontSize: '11px' }}
              onClick={() => handleApproveUpsell(pendingUpsellBooking.pendingUpsellId, true)}
            >
              <Check size={14} /> Approve (+EGP {pendingUpsellBooking.pendingUpsellPrice || 150})
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column (Hero + Stats + Recent) & Right Column (Your Next Wash) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(320px, 1fr)', gap: '24px', alignItems: 'start' }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* 1. Hero Banner matching design */}
          <div
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              minHeight: '190px',
              background: 'radial-gradient(circle at 80% 50%, #0d2847 0%, #071526 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              padding: '32px 36px',
              boxShadow: '0 10px 25px rgba(7, 21, 38, 0.15)'
            }}
          >
            {/* Background glowing car illustration */}
            <div
              style={{
                position: 'absolute',
                right: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '380px',
                height: '100%',
                backgroundImage: 'url("https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                maskImage: 'linear-gradient(to right, transparent 0%, black 45%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 45%)',
                opacity: 0.85,
                pointerEvents: 'none'
              }}
            />

            {/* Left Content */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '340px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.25, fontFamily: 'Manrope, sans-serif' }}>
                Keep your car<br />in top shape!
              </h2>

              <button
                onClick={() => navigate('/customer/book')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#087cf0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '24px',
                  padding: '10px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(8, 124, 240, 0.4)',
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
                <span>Book a new wash</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* 2. Three Summary Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* Card 1: Total Bookings */}
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1px solid #edf2f7',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#eaf4ff',
                  color: '#087cf0',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                <Calendar size={22} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#8090a2', fontWeight: 600, display: 'block' }}>Total Bookings</span>
                <strong style={{ fontSize: '22px', fontWeight: 800, color: '#102a40', fontFamily: 'Manrope, sans-serif' }}>
                  {totalBookingsCount}
                </strong>
              </div>
            </div>

            {/* Card 2: Completed */}
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1px solid #edf2f7',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#eafbf2',
                  color: '#1da46f',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#8090a2', fontWeight: 600, display: 'block' }}>Completed</span>
                <strong style={{ fontSize: '22px', fontWeight: 800, color: '#102a40', fontFamily: 'Manrope, sans-serif' }}>
                  {completedCount}
                </strong>
              </div>
            </div>

            {/* Card 3: Pending */}
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '18px 20px',
                border: '1px solid #edf2f7',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#fff8eb',
                  color: '#d97706',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                <Clock size={22} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#8090a2', fontWeight: 600, display: 'block' }}>Pending</span>
                <strong style={{ fontSize: '22px', fontWeight: 800, color: '#102a40', fontFamily: 'Manrope, sans-serif' }}>
                  {pendingCount}
                </strong>
              </div>
            </div>
          </div>

          {/* 3. Recent Bookings Table Card */}
          <div
            style={{
              background: '#fff',
              borderRadius: '18px',
              padding: '24px',
              border: '1px solid #edf2f7',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#102a40', fontFamily: 'Manrope, sans-serif' }}>
                Recent Bookings
              </h3>
              <button
                onClick={() => navigate('/customer/bookings')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#087cf0',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                View All Bookings
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <tbody>
                  {displayBookings.map((b, i) => (
                    <tr
                      key={b.id || i}
                      style={{
                        borderBottom: i === displayBookings.length - 1 ? 'none' : '1px solid #f1f5f9',
                        transition: 'background 0.2s'
                      }}
                    >
                      {/* Booking ID */}
                      <td style={{ padding: '14px 10px', fontSize: '12px', fontWeight: 700, color: '#102a40' }}>
                        {b.bookingNumber}
                      </td>

                      {/* Package Name */}
                      <td style={{ padding: '14px 10px', fontSize: '12px', color: '#334155' }}>
                        {b.packageName}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 10px', fontSize: '11px', color: '#64748b' }}>
                        {b.date}
                      </td>

                      {/* Price */}
                      <td style={{ padding: '14px 10px', fontSize: '12px', fontWeight: 700, color: '#102a40' }}>
                        {b.price}
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: '14px 10px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            display: 'inline-block',
                            backgroundColor: b.statusType === 'completed' ? '#eafbf2' : '#eaf4ff',
                            color: b.statusType === 'completed' ? '#1da46f' : '#087cf0'
                          }}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            if (b.raw) {
                              setSelectedBooking(b.raw)
                            } else {
                              setSelectedBooking({
                                id: b.id,
                                bookingNumber: b.bookingNumber,
                                packageName: b.packageName,
                                scheduledDate: b.date,
                                totalPrice: parseInt(b.price.replace(/\D/g, '')) || 300,
                                status: b.status.toUpperCase().replace(/\s+/g, '_')
                              })
                            }
                          }}
                          style={{
                            background: '#fff',
                            border: '1px solid #dce6ef',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            color: '#087cf0',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#087cf0'
                            e.currentTarget.style.background = '#f0f7ff'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#dce6ef'
                            e.currentTarget.style.background = '#fff'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: "Your Next Wash" */}
        <div
          style={{
            background: '#fff',
            borderRadius: '18px',
            padding: '24px',
            border: '1px solid #edf2f7',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {/* Header */}
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#102a40', fontFamily: 'Manrope, sans-serif' }}>
            Your Next Wash
          </h3>

          {/* Next Wash Info Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#07172c',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
            >
              <Car size={24} color="#60b4ff" />
            </div>
            <div>
              <b style={{ display: 'block', fontSize: '13px', color: '#102a40' }}>{nextWash.packageName}</b>
              <small style={{ display: 'block', fontSize: '11px', color: '#8493a2', marginTop: '2px' }}>
                {nextWash.scheduledDate}
              </small>
            </div>
          </div>

          {/* Track Live Button */}
          <button
            onClick={() => setShowLiveTracking(true)}
            style={{
              width: '100%',
              background: '#087cf0',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(8, 124, 240, 0.25)',
              transition: 'background 0.2s'
            }}
          >
            Track Live
          </button>

          {/* Interactive Mini Map Preview */}
          <div
            style={{
              height: '160px',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#e5ece5',
              backgroundImage: `
                radial-gradient(#d3e0d2 1.5px, transparent 1.5px),
                linear-gradient(45deg, #f7f9f7 25%, transparent 25%),
                linear-gradient(-45deg, #f7f9f7 25%, transparent 25%)
              `,
              backgroundSize: '16px 16px, 60px 60px, 60px 60px',
              border: '1px solid #dce6dc',
              cursor: 'pointer'
            }}
            onClick={() => setShowLiveTracking(true)}
            title="Click to view full live tracking"
          >
            {/* Road lines simulation */}
            <div style={{ position: 'absolute', width: '130%', height: '14px', background: '#fff', transform: 'rotate(-20deg)', top: '50px', left: '-15%', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
            <div style={{ position: 'absolute', width: '14px', height: '100%', background: '#fff', top: 0, left: '55%', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
            <div style={{ position: 'absolute', width: '90px', height: '10px', background: '#fff', top: '105px', left: '10%' }} />

            {/* Glowing Map Pin */}
            <div
              style={{
                position: 'absolute',
                top: '46%',
                left: '52%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(8, 124, 240, 0.2)',
                  display: 'grid',
                  placeItems: 'center',
                  animation: 'pulse 2s infinite'
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#087cf0',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  <MapPin size={12} />
                </div>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(255,255,255,0.92)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '9px',
                fontWeight: 700,
                color: '#475569'
              }}
            >
              New Cairo, Zone B
            </div>
          </div>

          {/* Technician Box */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <span
              style={{
                display: 'inline-block',
                background: '#eff6ff',
                color: '#2563eb',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
                marginBottom: '12px'
              }}
            >
              Technician
            </span>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Technician"
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <b style={{ display: 'block', fontSize: '12px', color: '#102a40' }}>{nextWash.technicianName}</b>
                  <small style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                    <Star size={11} fill="#eab308" color="#eab308" />
                    <span>{nextWash.technicianRating}</span>
                  </small>
                </div>
              </div>

              <button
                onClick={() => notify(`Calling ${nextWash.technicianName}... (+20 101 234 5678)`)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#087cf0',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                title="Call Technician"
              >
                <Phone size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3>Booking Details: {selectedBooking.bookingNumber || `#BK-${selectedBooking.id?.slice(0, 5)}`}</h3>
                <p>Status: {selectedBooking.status}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Package</span>
                  <b style={{ display: 'block', fontSize: '13px', color: '#1e293b' }}>{selectedBooking.packageName || 'Premium Wash'}</b>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Scheduled Date</span>
                  <b style={{ display: 'block', fontSize: '13px', color: '#1e293b' }}>{selectedBooking.scheduledDate || '25 Apr 2025'}</b>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Total Price</span>
                  <b style={{ display: 'block', fontSize: '13px', color: '#087cf0' }}>EGP {selectedBooking.totalPrice || 300}</b>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Deposit Status</span>
                  <b style={{ display: 'block', fontSize: '13px', color: selectedBooking.isDepositPaid ? '#1da46f' : '#d97706' }}>
                    {selectedBooking.isDepositPaid ? 'Paid (200 EGP)' : 'Unpaid'}
                  </b>
                </div>
              </div>

              {/* Deposit Payment trigger if unpaid */}
              {!selectedBooking.isDepositPaid && selectedBooking.status !== 'COMPLETED' && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <b style={{ fontSize: '12px', color: '#92400e', display: 'block' }}>Deposit Required (200 EGP)</b>
                    <small style={{ fontSize: '10px', color: '#b45309' }}>Pay deposit to dispatch a certified technician</small>
                  </div>
                  <button
                    className="btn primary"
                    style={{ fontSize: '11px', padding: '8px 14px' }}
                    onClick={() => {
                      setActiveDepositBooking(selectedBooking)
                      setShowDepositModal(true)
                    }}
                  >
                    <CreditCard size={14} /> Pay Now
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn outline" onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Deposit Modal */}
      {showDepositModal && activeDepositBooking && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h3>Pay Deposit for {activeDepositBooking.bookingNumber}</h3>
                <p>Standard mandatory deposit of EGP 200</p>
              </div>
              <button onClick={() => setShowDepositModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eaf4ff', color: '#087cf0', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <CreditCard size={28} />
              </div>
              <span style={{ fontSize: '11px', color: '#6d8294' }}>Deposit Amount</span>
              <h1 style={{ margin: '4px 0 16px', color: '#087cf0', fontSize: '32px', fontWeight: 800 }}>EGP 200.00</h1>
              <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                This deposit reserves your technician and will be deducted from your final wash bill upon completion.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn outline" onClick={() => setShowDepositModal(false)}>Cancel</button>
              <button className="btn primary" onClick={handlePayDeposit} disabled={depositLoading}>
                {depositLoading ? 'Processing...' : 'Confirm & Pay EGP 200'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Tracking Modal */}
      {showLiveTracking && (
        <div className="modal-overlay" onClick={() => setShowLiveTracking(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3>Live Wash Tracking: {nextWash.bookingNumber}</h3>
                <p>Technician {nextWash.technicianName} is en route to your address</p>
              </div>
              <button onClick={() => setShowLiveTracking(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', position: 'relative', background: '#dce8dc', border: '1px solid #c8d8c8', marginBottom: '16px' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(8, 124, 240, 0.25)', display: 'grid', placeItems: 'center', animation: 'pulse 1.5s infinite' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#087cf0', color: '#fff', display: 'grid', placeItems: 'center' }}>
                      <MapPin size={16} />
                    </div>
                  </div>
                  <b style={{ fontSize: '11px', background: '#fff', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', color: '#1e293b' }}>
                    Technician Van: 6 mins away (2.4 km)
                  </b>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Technician"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <b style={{ fontSize: '12px', color: '#102a40' }}>{nextWash.technicianName}</b>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>ETA: 10:06 AM</span>
                  </div>
                </div>

                <button
                  className="btn primary"
                  style={{ fontSize: '11px', padding: '8px 14px' }}
                  onClick={() => notify(`Calling ${nextWash.technicianName}... (+20 101 234 5678)`)}
                >
                  <Phone size={13} /> Call Tech
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn outline" onClick={() => setShowLiveTracking(false)}>Close Tracking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
