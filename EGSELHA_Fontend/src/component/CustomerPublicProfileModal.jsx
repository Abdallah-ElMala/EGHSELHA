import React from 'react'
import {
  X,
  Phone,
  Mail,
  MapPin,
  Car,
  FileText,
  CalendarCheck,
  UserCheck
} from 'lucide-react'

export default function CustomerPublicProfileModal({ customerData, onClose }) {
  if (!customerData) return null

  const name = customerData.customer || customerData.customerName || 'Customer'
  const phone = customerData.phone || customerData.customerPhone || ''
  const email = customerData.customerEmail || ''
  const address = customerData.address || customerData.customerAddress || ''
  const gateNotes = customerData.customerGateNotes || ''
  const totalBookings = customerData.customerTotalBookings ?? 1
  const bookingNumber = customerData.bookingNumber || customerData.id || ''
  const savedAddresses = Array.isArray(customerData.customerSavedAddresses)
    ? customerData.customerSavedAddresses
    : []
  const vehicles = Array.isArray(customerData.customerVehicles)
    ? customerData.customerVehicles
    : []

  const bookedCarName = customerData.car || customerData.vehicleModel || ''
  const bookedPlate = customerData.licensePlate || ''
  const bookedColor = customerData.carColor || ''
  const bookedYear = customerData.carYear || ''
  const bookedSize = customerData.carSizeType || ''

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(6, 12, 24, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(7, 23, 44, 0.35)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 24px',
            background: 'linear-gradient(135deg, #07172c 0%, #0d2847 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '18px',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{name}</h3>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '20px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#7dd3fc',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <UserCheck size={12} /> Customer · Read-Only
                </span>
              </div>
              <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Booking {bookingNumber} {bookedCarName ? `· ${bookedCarName}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#cbd5e1',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
              <small style={{ fontSize: '10px', color: '#0369a1', display: 'block', fontWeight: 700 }}>TOTAL BOOKINGS</small>
              <b style={{ fontSize: '18px', color: '#0c4a6e', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                <CalendarCheck size={16} color="#0284c7" /> {totalBookings} Trips
              </b>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
              <small style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 700 }}>REGISTERED VEHICLES</small>
              <b style={{ fontSize: '18px', color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                <Car size={16} color="#087cf0" /> {vehicles.length || (bookedCarName ? 1 : 0)} Cars
              </b>
            </div>
          </div>

          {/* Contact & Location */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Contact &amp; Location Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="#087cf0" />
                  <span><b>Phone:</b> {phone || 'Not provided'}</span>
                </div>
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="btn outline"
                    style={{ fontSize: '11px', padding: '4px 10px', textDecoration: 'none', borderColor: '#087cf0', color: '#087cf0' }}
                  >
                    <Phone size={12} /> Call Customer
                  </a>
                )}
              </div>
              {email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} color="#087cf0" />
                  <span><b>Email:</b> {email}</span>
                </div>
              )}
              {address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} color="#087cf0" />
                  <span><b>Service Address:</b> {address}</span>
                </div>
              )}
            </div>

            {gateNotes && (
              <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', fontSize: '12px', color: '#92400e', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <FileText size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span><b>Gate / Parking Notes:</b> {gateNotes}</span>
              </div>
            )}

            {savedAddresses.length > 0 && (
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                <small style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>SAVED ADDRESSES</small>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {savedAddresses.map((addr, idx) => (
                    <div key={idx} style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={12} color="#64748b" />
                      <span>{addr}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booked Vehicle & Customer Garage */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Car size={15} color="#087cf0" /> Customer Vehicles
            </h4>

            {vehicles.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                {vehicles.map((v, idx) => {
                  const isBookedCar = bookedPlate && v.licensePlate === bookedPlate
                  return (
                    <div
                      key={idx}
                      style={{
                        background: isBookedCar ? '#f0f9ff' : '#f8fafc',
                        border: isBookedCar ? '1.5px solid #087cf0' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '6px' }}>
                        <b style={{ fontSize: '13px', color: '#0f172a' }}>{v.make} {v.model}</b>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1' }}>
                          {v.sizeType || 'SEDAN'}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {v.year} · Color: {v.color || '—'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#334155', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Plate: <b>{v.licensePlate}</b></span>
                        {isBookedCar && (
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#087cf0', textTransform: 'uppercase' }}>Booked Car</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : bookedCarName ? (
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <b style={{ fontSize: '13px', color: '#0c4a6e' }}>{bookedCarName}</b>
                  {bookedSize && (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1' }}>
                      {bookedSize}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  {bookedYear ? `${bookedYear} · ` : ''}{bookedColor ? `Color: ${bookedColor} · ` : ''}Plate: <b>{bookedPlate || '—'}</b>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>No vehicle details available.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
          <button className="btn outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
