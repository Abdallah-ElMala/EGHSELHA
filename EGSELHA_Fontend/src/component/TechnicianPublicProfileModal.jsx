import React from 'react'
import {
  X,
  Star,
  Phone,
  MapPin,
  Car,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Clock,
  Calendar,
  Wrench,
  Award
} from 'lucide-react'

export default function TechnicianPublicProfileModal({ booking, onClose }) {
  if (!booking || !booking.technicianName) return null

  const initials = booking.technicianName
    .split(' ')
    .filter(Boolean)
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const equipmentFlags = [
    { label: 'High-Pressure Washer', ok: booking.technicianHasPressureWasher !== false },
    { label: 'Vacuum Extractor', ok: booking.technicianHasVacuumExtractor !== false },
    { label: 'Water Tank & Power Generator', ok: booking.technicianHasWaterTankGenerator !== false },
    { label: 'Equipped Mobile Van', ok: booking.technicianHasVehicle !== false }
  ]

  const extraEquipment = Array.isArray(booking.technicianVerifiedEquipment)
    ? booking.technicianVerifiedEquipment
    : []

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
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #087cf0, #38bdf8)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '19px',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 14px rgba(8, 124, 240, 0.4)'
              }}
            >
              {initials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                  {booking.technicianName}
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '20px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#86efac',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ShieldCheck size={12} /> Verified Technician
                </span>
              </div>
              <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Assigned to Booking {booking.bookingNumber} · {booking.technicianServiceArea || 'Cairo'}
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
          {/* Highlights Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
              <small style={{ fontSize: '10px', color: '#b45309', display: 'block', fontWeight: 700 }}>RATING</small>
              <b style={{ fontSize: '17px', color: '#92400e', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <Star size={15} fill="#eab308" color="#eab308" /> {booking.technicianRating ? Number(booking.technicianRating).toFixed(1) : '4.9'}
              </b>
            </div>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
              <small style={{ fontSize: '10px', color: '#0369a1', display: 'block', fontWeight: 700 }}>COMPLETED WASHES</small>
              <b style={{ fontSize: '17px', color: '#0c4a6e', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <Award size={15} color="#0284c7" /> {booking.technicianCompletedJobsCount ?? 0}
              </b>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
              <small style={{ fontSize: '10px', color: '#15803d', display: 'block', fontWeight: 700 }}>STATUS</small>
              <b style={{ fontSize: '13px', color: '#166534', display: 'block', marginTop: '7px' }}>
                {booking.technicianIsOnline ? '● Online & Active' : '● Assigned'}
              </b>
            </div>
          </div>

          {/* Contact & Bio */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Technician Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12px', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} color="#087cf0" />
                <span><b>Phone:</b> {booking.technicianPhone || 'Available on dispatch'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="#087cf0" />
                <span><b>Area:</b> {booking.technicianServiceArea || 'Cairo'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} color="#087cf0" />
                <span><b>Working Days:</b> {booking.technicianWorkingDays || 'Sunday – Thursday'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} color="#087cf0" />
                <span><b>Hours:</b> {booking.technicianWorkingHours || '09:00 AM – 06:00 PM'}</span>
              </div>
            </div>
            {booking.technicianBio && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                <b style={{ color: '#0f172a' }}>About: </b>
                {booking.technicianBio}
              </div>
            )}
          </div>

          {/* Arriving Mobile Unit / Vehicle */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Car size={15} color="#087cf0" /> Arriving Service Vehicle
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '12px 14px', borderRadius: '12px', fontSize: '12px' }}>
              <div>
                <small style={{ color: '#0369a1', display: 'block', fontSize: '10px', fontWeight: 700 }}>VEHICLE TYPE</small>
                <b style={{ color: '#0c4a6e' }}>{booking.technicianVehicleType || 'Mobile Detailing Van'}</b>
              </div>
              <div>
                <small style={{ color: '#0369a1', display: 'block', fontSize: '10px', fontWeight: 700 }}>MODEL / NAME</small>
                <b style={{ color: '#0c4a6e' }}>{booking.technicianVehicleName || 'EGHSELHA Service Van'}</b>
              </div>
              <div>
                <small style={{ color: '#0369a1', display: 'block', fontSize: '10px', fontWeight: 700 }}>LICENSE PLATE</small>
                <b style={{ color: '#0c4a6e' }}>{booking.technicianVehiclePlate || 'Verified Plate'}</b>
              </div>
              {booking.technicianVanLevel && (
                <div>
                  <small style={{ color: '#0369a1', display: 'block', fontSize: '10px', fontWeight: 700 }}>UNIT LEVEL</small>
                  <b style={{ color: '#0284c7' }}>{booking.technicianVanLevel}</b>
                </div>
              )}
            </div>
          </div>

          {/* Equipment On Board */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wrench size={15} color="#087cf0" /> On-Board Detailing Equipment
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {equipmentFlags.map((eq) => (
                <span
                  key={eq.label}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: eq.ok ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${eq.ok ? '#bbf7d0' : '#fecaca'}`,
                    color: eq.ok ? '#166534' : '#991b1b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {eq.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {eq.label}
                </span>
              ))}
              {extraEquipment.map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8'
                  }}
                >
                  ✓ {item}
                </span>
              ))}
            </div>
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
