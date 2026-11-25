import { useMemo, useState } from 'react';
import {
  Wrench,
  Star,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Power,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  Car,
  CreditCard,
  Calendar,
  Clock,
  Briefcase,
  IdCard,
  Wallet
} from 'lucide-react';
import PageTitle from '../../component/PageTitle';
import { useAdmin } from '../../context/AdminContext';
import { adminApi } from '../../services/adminApi';

const STATUS_COLORS = {
  COMPLETED: { bg: '#dcfce7', color: '#15803d' },
  WASHING: { bg: '#e0f2fe', color: '#0369a1' },
  ON_THE_WAY: { bg: '#dbeafe', color: '#1d4ed8' },
  ARRIVED: { bg: '#ede9fe', color: '#6d28d9' },
  DISPATCHED: { bg: '#fef3c7', color: '#b45309' },
  DEPOSIT_PAID: { bg: '#fef3c7', color: '#b45309' },
  PENDING: { bg: '#f1f5f9', color: '#475569' },
  CANCELLED: { bg: '#fee2e2', color: '#b91c1c' }
};

export default function AdminTechnicians() {
  const { technicians, bookings, payouts, notify, refreshAll } = useAdmin();
  const [busyId, setBusyId] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);

  const handleToggleOnline = async (tech) => {
    setBusyId(tech.id);
    try {
      await adminApi.toggleTechnicianAvailability(tech.id, !tech.isOnline);
      notify(`${tech.fullName} is now ${!tech.isOnline ? 'Online' : 'Offline'}.`);
      await refreshAll();
    } catch (err) {
      notify(err.message || 'Failed to update availability.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReviewApp = async (tech, decision) => {
    setBusyId(tech.id);
    try {
      await adminApi.reviewTechnicianApplication(tech.id, decision);
      notify(`${tech.fullName} application marked as ${decision}.`);
      await refreshAll();
    } catch (err) {
      notify(err.message || 'Failed to update application.');
    } finally {
      setBusyId(null);
    }
  };

  const techBookings = useMemo(() => {
    if (!selectedTech) return [];
    return (bookings || []).filter(
      (b) => b.technicianId === selectedTech.id || (b.technicianName && b.technicianName === selectedTech.fullName)
    );
  }, [bookings, selectedTech]);

  const techPayouts = useMemo(() => {
    if (!selectedTech) return [];
    return (payouts || []).filter(
      (p) => p.technicianId === selectedTech.id || (p.technicianName && p.technicianName === selectedTech.fullName)
    );
  }, [payouts, selectedTech]);

  const techTotalRevenue = useMemo(() => {
    if (!selectedTech) return 0;
    if (selectedTech.totalRevenue > 0) return selectedTech.totalRevenue;
    return techBookings
      .filter((b) => String(b.status).toUpperCase() === 'COMPLETED')
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  }, [selectedTech, techBookings]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageTitle
        eyebrow="ADMIN / FLEET & ONBOARDING"
        title="Technicians & Application Verification"
        desc="Manage online availability, inspect technician profiles, verify mobile detailing equipment, and approve or suspend technicians."
      />

      {technicians.length === 0 ? (
        <div className="panel empty-state">
          <Wrench size={36} />
          <h3>No technicians registered</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
          {technicians.map((t) => (
            <div
              key={t.id}
              className="panel"
              style={{ padding: '22px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div
                  onClick={() => setSelectedTech(t)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  title="Click to show profile"
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #087cf0, #1d4ed8)',
                      color: '#fff',
                      fontWeight: 800,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {t.fullName.split(' ').map((x) => x[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <b style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>{t.fullName}</b>
                    <small style={{ fontSize: '11px', color: '#64748b' }}>
                      {t.serviceArea} · {t.phone}
                    </small>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: t.isOnline ? '#dcfce7' : '#f1f5f9',
                    color: t.isOnline ? '#15803d' : '#64748b',
                  }}
                >
                  {t.isOnline ? '● Online' : '○ Offline'}
                </span>
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                <div>
                  <small style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Rating</small>
                  <b style={{ fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={13} fill="#eab308" color="#eab308" /> {t.rating}
                  </b>
                </div>
                <div>
                  <small style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Jobs</small>
                  <b style={{ fontSize: '13px', color: '#0f172a' }}>{t.completedJobsCount} done · {t.activeJobsCount} active</b>
                </div>
                <div>
                  <small style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Balance</small>
                  <b style={{ fontSize: '13px', color: '#16a34a' }}>EGP {t.totalBalance.toLocaleString()}</b>
                </div>
              </div>

              {/* Equipment Checklist */}
              <div>
                <small style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                  VERIFIED EQUIPMENT ({t.applicationStatus})
                </small>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { label: 'Pressure Washer', ok: t.hasPressureWasher },
                    { label: 'Vacuum Extractor', ok: t.hasVacuumExtractor },
                    { label: 'Water & Generator', ok: t.hasWaterTankGenerator },
                    { label: 'Mobile Van', ok: t.hasVehicle },
                  ].map((eq) => (
                    <span
                      key={eq.label}
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: eq.ok ? '#f0fdf4' : '#fef2f2',
                        color: eq.ok ? '#166534' : '#991b1b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {eq.ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {eq.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  className="btn soft"
                  onClick={() => setSelectedTech(t)}
                  style={{ flex: 1 }}
                >
                  <Eye size={14} /> Show Profile
                </button>
                <button
                  className="btn outline"
                  disabled={busyId === t.id}
                  onClick={() => handleToggleOnline(t)}
                  style={{ flex: 1 }}
                >
                  <Power size={14} /> {t.isOnline ? 'Set Offline' : 'Set Online'}
                </button>
                {t.applicationStatus !== 'Approved' ? (
                  <button
                    className="btn success"
                    disabled={busyId === t.id}
                    onClick={() => handleReviewApp(t, 'Approved')}
                  >
                    <ShieldCheck size={14} /> Approve
                  </button>
                ) : (
                  <button
                    className="btn danger"
                    disabled={busyId === t.id}
                    onClick={() => handleReviewApp(t, 'Suspended')}
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Read-Only Technician Profile Modal */}
      {selectedTech && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedTech(null)}
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
              maxWidth: '780px',
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
                padding: '20px 24px',
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
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #087cf0, #38bdf8)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '18px',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                  }}
                >
                  {selectedTech.fullName.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{selectedTech.fullName}</h3>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '20px',
                        background: selectedTech.isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                        color: selectedTech.isOnline ? '#86efac' : '#cbd5e1'
                      }}
                    >
                      {selectedTech.isOnline ? '● Online' : '○ Offline'}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '20px',
                        background: 'rgba(56, 189, 248, 0.2)',
                        color: '#7dd3fc'
                      }}
                    >
                      {selectedTech.applicationStatus} · Read-Only
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    Certified Mobile Detailing Technician · {selectedTech.serviceArea}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTech(null)}
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
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* KPI Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                  <small style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Rating & Acceptance</small>
                  <b style={{ fontSize: '17px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                    <Star size={16} fill="#eab308" color="#eab308" /> {selectedTech.rating || 0} / 5
                  </b>
                  <small style={{ fontSize: '10px', color: '#64748b' }}>Acceptance: {selectedTech.acceptanceRate ?? 100}%</small>
                </div>

                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '14px', padding: '14px' }}>
                  <small style={{ fontSize: '11px', color: '#0369a1', display: 'block' }}>Trips / Jobs</small>
                  <b style={{ fontSize: '17px', color: '#0c4a6e', display: 'block', marginTop: '4px' }}>
                    {selectedTech.completedJobsCount} Completed
                  </b>
                  <small style={{ fontSize: '10px', color: '#0284c7' }}>{selectedTech.activeJobsCount} Active now</small>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '14px' }}>
                  <small style={{ fontSize: '11px', color: '#15803d', display: 'block' }}>Total Revenue</small>
                  <b style={{ fontSize: '17px', color: '#166534', display: 'block', marginTop: '4px' }}>
                    EGP {techTotalRevenue.toLocaleString()}
                  </b>
                  <small style={{ fontSize: '10px', color: '#16a34a' }}>Today: EGP {(selectedTech.todayEarnings || 0).toLocaleString()}</small>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '14px' }}>
                  <small style={{ fontSize: '11px', color: '#b45309', display: 'block' }}>Wallet Balance</small>
                  <b style={{ fontSize: '17px', color: '#92400e', display: 'block', marginTop: '4px' }}>
                    EGP {(selectedTech.totalBalance || 0).toLocaleString()}
                  </b>
                  <small style={{ fontSize: '10px', color: '#d97706' }}>{techPayouts.length} Payout requests</small>
                </div>
              </div>

              {/* Personal & Schedule Details */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Personal & Contact Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <Phone size={14} color="#087cf0" />
                    <span><b>Phone:</b> {selectedTech.phone || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <Mail size={14} color="#087cf0" />
                    <span><b>Email:</b> {selectedTech.email || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <IdCard size={14} color="#087cf0" />
                    <span><b>National ID:</b> {selectedTech.nationalId || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <MapPin size={14} color="#087cf0" />
                    <span><b>Service Area:</b> {selectedTech.serviceArea || 'Cairo'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <Calendar size={14} color="#087cf0" />
                    <span><b>Working Days:</b> {selectedTech.workingDays || 'Sunday – Thursday'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <Clock size={14} color="#087cf0" />
                    <span><b>Working Hours:</b> {selectedTech.workingHours || '09:00 AM – 06:00 PM'}</span>
                  </div>
                </div>
                {selectedTech.shortBio && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                    <b style={{ color: '#0f172a' }}>Bio: </b>{selectedTech.shortBio}
                  </div>
                )}
              </div>

              {/* Vehicle & Equipment Details */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Car size={15} color="#087cf0" /> Mobile Unit & Verified Equipment
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '12px', fontSize: '12px' }}>
                  <div>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>VEHICLE TYPE</small>
                    <b style={{ color: '#0f172a' }}>{selectedTech.vehicleType || 'Mobile Detailing Van'}</b>
                  </div>
                  <div>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>VEHICLE NAME / MODEL</small>
                    <b style={{ color: '#0f172a' }}>{selectedTech.vehicleName || 'Not specified'}</b>
                  </div>
                  <div>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>LICENSE PLATE</small>
                    <b style={{ color: '#0f172a' }}>{selectedTech.vehiclePlate || 'Not specified'}</b>
                  </div>
                  <div>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>VAN LEVEL</small>
                    <b style={{ color: '#087cf0' }}>{selectedTech.vanLevel || 'Standard'}</b>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { label: 'Pressure Washer', ok: selectedTech.hasPressureWasher },
                    { label: 'Vacuum Extractor', ok: selectedTech.hasVacuumExtractor },
                    { label: 'Water Tank & Generator', ok: selectedTech.hasWaterTankGenerator },
                    { label: 'Mobile Van', ok: selectedTech.hasVehicle },
                  ].map((eq) => (
                    <span
                      key={eq.label}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: eq.ok ? '#f0fdf4' : '#fef2f2',
                        color: eq.ok ? '#166534' : '#991b1b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      {eq.ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {eq.label}
                    </span>
                  ))}
                  {(selectedTech.verifiedEquipment || []).map((eqName) => (
                    <span
                      key={eqName}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                      }}
                    >
                      ✓ {eqName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trips / Bookings History */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={15} color="#087cf0" /> Trips & Jobs History ({techBookings.length})
                </h4>
                {techBookings.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>No trips assigned to this technician yet.</p>
                ) : (
                  <div className="table-wrap">
                    <table style={{ width: '100%', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th>BOOKING</th>
                          <th>CUSTOMER</th>
                          <th>SERVICE & CAR</th>
                          <th>AMOUNT</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {techBookings.map((b) => {
                          const st = STATUS_COLORS[String(b.status).toUpperCase()] || STATUS_COLORS.PENDING;
                          return (
                            <tr key={b.id}>
                              <td>
                                <b>{b.bookingNumber}</b>
                                <small style={{ display: 'block', color: '#94a3b8' }}>
                                  {b.scheduledAt ? new Date(b.scheduledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                </small>
                              </td>
                              <td>
                                <b>{b.customerName}</b>
                                <small style={{ display: 'block', color: '#94a3b8' }}>{b.customerPhone}</small>
                              </td>
                              <td>
                                <div>{b.serviceName}</div>
                                <small style={{ color: '#64748b' }}>{b.vehicleName} {b.licensePlate ? `· ${b.licensePlate}` : ''}</small>
                              </td>
                              <td><b style={{ color: '#16a34a' }}>EGP {(b.totalPrice || 0).toLocaleString()}</b></td>
                              <td>
                                <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: st.bg, color: st.color }}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payouts History */}
              {techPayouts.length > 0 && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wallet size={15} color="#16a34a" /> Payout Requests ({techPayouts.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {techPayouts.map((p) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', fontSize: '12px' }}>
                        <div>
                          <b>EGP {(p.amount || 0).toLocaleString()}</b>
                          <small style={{ display: 'block', color: '#64748b' }}>{p.bankAccountOrWallet || p.method || 'Payout'}</small>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', background: p.status === 'Paid' || p.status === 'Approved' ? '#dcfce7' : '#fef3c7', color: p.status === 'Paid' || p.status === 'Approved' ? '#15803d' : '#b45309' }}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
              <button className="btn outline" onClick={() => setSelectedTech(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
