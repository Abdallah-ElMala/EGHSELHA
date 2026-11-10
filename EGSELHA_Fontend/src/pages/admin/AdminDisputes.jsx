import { useMemo, useState } from 'react';
import {
  ShieldAlert,
  RotateCcw,
  RefreshCw,
  XCircle,
  Camera,
  CheckCircle2,
  Eye,
  Clock,
  AlertTriangle,
  MapPin,
  X,
  Timer,
} from 'lucide-react';
import PageTitle from '../../component/PageTitle';
import { useAdmin } from '../../context/AdminContext';
import { adminApi } from '../../services/adminApi';
import { resolveAssetUrl } from '../../services/apiClient';

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return '—';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'}`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export default function AdminDisputes() {
  const { disputes, notify, refreshAll } = useAdmin();
  const [notesById, setNotesById] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);

  const handleResolve = async (dispute, action) => {
    setBusyId(dispute.id);
    try {
      await adminApi.resolveDispute(dispute.id, {
        action,
        adminNotes: notesById[dispute.id] || undefined,
      });
      notify(`Dispute ${dispute.bookingNumber} marked as ${action}.`);
      await refreshAll();
    } catch (err) {
      notify(err.message || 'Failed to resolve dispute.');
    } finally {
      setBusyId(null);
    }
  };

  const selectedPhotos = useMemo(() => {
    const all = selectedDispute?.photos || [];
    return {
      before: all.filter((p) => String(p.photoType).toUpperCase() === 'BEFORE'),
      after: all.filter((p) => String(p.photoType).toUpperCase() === 'AFTER'),
    };
  }, [selectedDispute]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageTitle
        eyebrow="ADMIN / QUALITY & DISPUTES"
        title="Customer Disputes & PhotoQA Audit"
        desc="Investigate customer quality complaints against technician PhotoQA records and issue refunds or free re-washes."
      />

      {disputes.length === 0 ? (
        <div className="panel empty-state" style={{ padding: '48px 24px' }}>
          <CheckCircle2 size={38} color="#16a34a" />
          <h3>No disputes filed</h3>
          <p>All completed washes are currently dispute-free.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {disputes.map((d) => {
            const isOpen = d.status === 'OPEN' || d.status === 'UNDER_REVIEW';
            return (
              <div
                key={d.id}
                className="panel"
                style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert size={22} color={isOpen ? '#dc2626' : '#16a34a'} />
                    <div>
                      <b style={{ fontSize: '15px', color: '#0f172a' }}>
                        {d.bookingNumber} · {d.serviceName} (EGP {d.TotalPrice ?? d.totalPrice})
                      </b>
                      <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>
                        Customer: <b>{d.customerName}</b> · Technician: <b>{d.technicianName || 'Unassigned'}</b> · Filed: {new Date(d.filedAt).toLocaleString('en-GB')}
                      </small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Camera size={12} /> {d.photoQACount} QA Photos
                    </span>
                    <button
                      type="button"
                      className="btn outline"
                      onClick={() => setSelectedDispute(d)}
                      style={{
                        padding: '5px 12px',
                        fontSize: '11px',
                        borderColor: '#087cf0',
                        color: '#087cf0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Eye size={13} /> More Details
                    </button>
                    <span className={`payment-status ${isOpen ? 'pending' : 'paid'}`}>
                      {d.status}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '12px', color: '#991b1b' }}>
                  <b>Customer Complaint:</b> {d.reason}
                </div>

                {d.adminNotes && (
                  <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#334155' }}>
                    <b>Admin Resolution Notes:</b> {d.adminNotes}
                  </div>
                )}

                {isOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <input
                      placeholder="Add investigation / PhotoQA notes..."
                      value={notesById[d.id] ?? ''}
                      onChange={(e) => setNotesById({ ...notesById, [d.id]: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className="btn primary"
                        disabled={busyId === d.id}
                        style={{ background: '#16a34a', borderColor: '#16a34a' }}
                        onClick={() => handleResolve(d, 'REFUNDED')}
                      >
                        <RotateCcw size={14} /> Issue Wallet Refund (EGP {d.totalPrice})
                      </button>
                      <button
                        className="btn primary"
                        disabled={busyId === d.id}
                        onClick={() => handleResolve(d, 'REWASH_DISPATCHED')}
                      >
                        <RefreshCw size={14} /> Dispatch Free Re-Wash
                      </button>
                      <button
                        className="btn outline"
                        disabled={busyId === d.id}
                        onClick={() => handleResolve(d, 'UNDER_REVIEW')}
                      >
                        Mark Under Review
                      </button>
                      <button
                        className="btn outline"
                        disabled={busyId === d.id}
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                        onClick={() => handleResolve(d, 'REJECTED')}
                      >
                        <XCircle size={14} /> Reject Dispute
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dispute More Details Modal */}
      {selectedDispute && (
        <div
          onClick={() => setSelectedDispute(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '18px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#fff',
              borderRadius: '18px',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.35)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 22px',
              borderBottom: '1px solid #e2e8f0',
              position: 'sticky',
              top: 0,
              background: '#fff',
              zIndex: 5,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    Dispute Investigation · {selectedDispute.bookingNumber}
                  </h2>
                  <span className={`payment-status ${selectedDispute.status === 'OPEN' || selectedDispute.status === 'UNDER_REVIEW' ? 'pending' : 'paid'}`}>
                    Dispute: {selectedDispute.status}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 800,
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                  }}>
                    Booking Status: {selectedDispute.bookingStatus}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  {selectedDispute.serviceName} · {selectedDispute.vehicleName} · Customer: <b>{selectedDispute.customerName}</b> ({selectedDispute.customerPhone || '—'}) · Technician: <b>{selectedDispute.technicianName || 'Unassigned'}</b>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 1. Problem / Complaint & Location */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <small style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Customer Issue / Complaint
                  </small>
                  <b style={{ fontSize: '13px', color: '#7f1d1d', display: 'block' }}>{selectedDispute.reason}</b>
                  <small style={{ display: 'block', fontSize: '11px', color: '#b91c1c', marginTop: '6px' }}>
                    Filed: {formatDateTime(selectedDispute.filedAt)}
                    {selectedDispute.resolvedAt ? ` · Resolved: ${formatDateTime(selectedDispute.resolvedAt)}` : ''}
                  </small>
                  {selectedDispute.adminNotes && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #fca5a5', fontSize: '11px', color: '#334155' }}>
                      <b>Admin Notes:</b> {selectedDispute.adminNotes}
                    </div>
                  )}
                </div>

                <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <small style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                    <MapPin size={12} color="#087cf0" /> Service Location &amp; Booking
                  </small>
                  <b style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>
                    {selectedDispute.address || 'No address recorded'}
                  </b>
                  <small style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                    Package Price: <b>EGP {selectedDispute.totalPrice}</b> · Vehicle: <b>{selectedDispute.vehicleName}</b>
                  </small>
                </div>
              </div>

              {/* 2. Delay & Schedule Compliance Check */}
              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Timer size={15} color="#087cf0" /> Time &amp; Delay Audit
                </h3>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: selectedDispute.isDelayed ? '#fff7ed' : '#ecfdf5',
                  border: `1px solid ${selectedDispute.isDelayed ? '#fdba74' : '#86efac'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginBottom: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedDispute.isDelayed
                      ? <AlertTriangle size={18} color="#ea580c" />
                      : <CheckCircle2 size={18} color="#16a34a" />}
                    <div>
                      <b style={{ fontSize: '13px', color: selectedDispute.isDelayed ? '#9a3412' : '#166534', display: 'block' }}>
                        {selectedDispute.isDelayed ? `DELAY DETECTED (${selectedDispute.delayMinutes} mins)` : 'ON SCHEDULE'}
                      </b>
                      <small style={{ fontSize: '11px', color: selectedDispute.isDelayed ? '#c2410c' : '#15803d' }}>
                        {selectedDispute.delaySummary}
                      </small>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                    Expected service: {selectedDispute.expectedDurationMinutes || 45} mins
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', fontSize: '11px' }}>
                  <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <small style={{ color: '#64748b', display: 'block' }}>Scheduled Time</small>
                    <b style={{ color: '#0f172a' }}>{formatDateTime(selectedDispute.scheduledAt)}</b>
                  </div>
                  <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <small style={{ color: '#64748b', display: 'block' }}>Technician Arrived</small>
                    <b style={{ color: '#0f172a' }}>{formatDateTime(selectedDispute.arrivedAt)}</b>
                    <small style={{ display: 'block', color: '#0369a1' }}>Travel: {formatDuration(selectedDispute.travelDurationMinutes)}</small>
                  </div>
                  <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <small style={{ color: '#64748b', display: 'block' }}>Work Started</small>
                    <b style={{ color: '#0f172a' }}>{formatDateTime(selectedDispute.washingStartedAt)}</b>
                  </div>
                  <div style={{ padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <small style={{ color: '#64748b', display: 'block' }}>Work Finished</small>
                    <b style={{ color: '#0f172a' }}>{formatDateTime(selectedDispute.completedAt)}</b>
                    <small style={{ display: 'block', color: '#15803d' }}>Duration: {formatDuration(selectedDispute.workDurationMinutes)}</small>
                  </div>
                </div>
              </div>

              {/* 3. Customer Evidence Photos if submitted */}
              {selectedDispute.evidenceUrls && selectedDispute.evidenceUrls.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    Customer Uploaded Evidence ({selectedDispute.evidenceUrls.length})
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                    {selectedDispute.evidenceUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={resolveAssetUrl(url)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'block', borderRadius: '10px', overflow: 'hidden', border: '1px solid #fecaca' }}
                      >
                        <img src={resolveAssetUrl(url)} alt={`Evidence ${idx + 1}`} style={{ width: '100%', height: '86px', objectFit: 'cover', display: 'block' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Old (Before) vs New (After) Technician QA Photos */}
              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={15} color="#087cf0" /> Technician Photos Audit (Before vs After Wash)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                  {[
                    {
                      title: `Old Photos · Before Wash (${selectedPhotos.before.length})`,
                      badgeBg: '#fff7ed',
                      badgeBorder: '#fed7aa',
                      items: selectedPhotos.before,
                    },
                    {
                      title: `New Photos · After Wash (${selectedPhotos.after.length})`,
                      badgeBg: '#f0fdf4',
                      badgeBorder: '#bbf7d0',
                      items: selectedPhotos.after,
                    },
                  ].map((col) => (
                    <div
                      key={col.title}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        background: col.badgeBg,
                        border: `1px solid ${col.badgeBorder}`,
                      }}
                    >
                      <b style={{ display: 'block', fontSize: '12px', color: '#0f172a', marginBottom: '10px' }}>
                        {col.title}
                      </b>
                      {col.items.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>No photos uploaded for this stage.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '8px' }}>
                          {col.items.map((p) => (
                            <a
                              key={p.id}
                              href={resolveAssetUrl(p.imageUrl)}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'block',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid #cbd5e1',
                                background: '#fff',
                                textDecoration: 'none',
                              }}
                            >
                              <img
                                src={resolveAssetUrl(p.imageUrl)}
                                alt={`${p.photoType} ${p.category}`}
                                style={{ width: '100%', height: '76px', objectFit: 'cover', display: 'block' }}
                              />
                              <div style={{ padding: '4px 6px', fontSize: '9px', color: '#334155' }}>
                                <b style={{ display: 'block' }}>{p.category}</b>
                                <span style={{ color: '#94a3b8' }}>{formatDateTime(p.timestamp)}</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
