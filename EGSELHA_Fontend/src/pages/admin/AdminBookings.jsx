import { useMemo, useState } from 'react';
import {
  Search,
  CalendarCheck,
  CarFront,
  MapPin,
  Eye,
  Clock,
  Navigation,
  CheckCircle2,
  Camera,
  X,
  Timer,
  ExternalLink,
} from 'lucide-react';
import PageTitle from '../../component/PageTitle';
import { useAdmin } from '../../context/AdminContext';
import { resolveAssetUrl } from '../../services/apiClient';

const STATUS_OPTIONS = [
  'All',
  'PENDING',
  'DEPOSIT_PAID',
  'DISPATCHED',
  'ON_THE_WAY',
  'ARRIVED',
  'WASHING',
  'COMPLETED',
  'CANCELLED',
];

const CANCELLED_SUBFILTERS = [
  { key: 'ALL', label: 'All Cancelled' },
  { key: 'CUSTOMER', label: 'Cancelled by Customer' },
  { key: 'TECHNICIAN', label: 'Cancelled by Technician' },
];

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

function getStatusBadgeMeta(booking) {
  const s = booking.status;
  if (s === 'COMPLETED') {
    return { text: 'COMPLETED', bg: '#ecfdf5', color: '#15803d', border: '#86efac' };
  }
  if (s === 'CANCELLED') {
    if (booking.cancelledBy === 'TECHNICIAN') {
      return { text: 'CANCELLED BY TECHNICIAN', bg: '#fff7ed', color: '#c2410c', border: '#fdba74' };
    }
    if (booking.cancelledBy === 'CUSTOMER') {
      return { text: 'CANCELLED BY CUSTOMER', bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' };
    }
    return { text: 'CANCELLED', bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' };
  }
  if (s === 'WASHING') {
    return { text: 'IN PROGRESS', bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' };
  }
  if (s === 'ARRIVED') {
    return { text: 'ARRIVED', bg: '#f0f9ff', color: '#0369a1', border: '#7dd3fc' };
  }
  if (s === 'ON_THE_WAY') {
    return { text: 'ON_THE_WAY', bg: '#f5f3ff', color: '#6d28d9', border: '#c4b5fd' };
  }
  if (s === 'DISPATCHED') {
    return { text: 'DISPATCHED', bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc' };
  }
  if (s === 'DEPOSIT_PAID') {
    return { text: 'DEPOSIT_PAID', bg: '#fefce8', color: '#a16207', border: '#fde047' };
  }
  return { text: s || 'PENDING', bg: '#f8fafc', color: '#475569', border: '#cbd5e1' };
}

export default function AdminBookings() {
  const { bookings } = useAdmin();
  const [statusFilter, setStatusFilter] = useState('All');
  const [cancelledFilter, setCancelledFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const statusCounts = useMemo(() => {
    const counts = { All: bookings.length };
    for (const opt of STATUS_OPTIONS) {
      if (opt !== 'All') counts[opt] = 0;
    }
    for (const b of bookings) {
      if (counts[b.status] !== undefined) counts[b.status] += 1;
    }
    return counts;
  }, [bookings]);

  const cancelledSubCounts = useMemo(() => {
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED');
    return {
      ALL: cancelled.length,
      CUSTOMER: cancelled.filter((b) => b.cancelledBy === 'CUSTOMER').length,
      TECHNICIAN: cancelled.filter((b) => b.cancelledBy === 'TECHNICIAN').length,
    };
  }, [bookings]);

  const visibleBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      const matchCancelledSource =
        statusFilter !== 'CANCELLED' ||
        cancelledFilter === 'ALL' ||
        (cancelledFilter === 'CUSTOMER' && b.cancelledBy === 'CUSTOMER') ||
        (cancelledFilter === 'TECHNICIAN' && b.cancelledBy === 'TECHNICIAN');

      const matchSearch =
        !q ||
        b.bookingNumber?.toLowerCase().includes(q) ||
        b.customerName?.toLowerCase().includes(q) ||
        b.technicianName?.toLowerCase().includes(q) ||
        b.serviceName?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q);

      return matchStatus && matchCancelledSource && matchSearch;
    });
  }, [bookings, statusFilter, cancelledFilter, searchQuery]);

  const selectedPhotos = useMemo(() => {
    const all = selectedBooking?.photos || [];
    return {
      before: all.filter((p) => String(p.photoType).toUpperCase() === 'BEFORE'),
      after: all.filter((p) => String(p.photoType).toUpperCase() === 'AFTER'),
    };
  }, [selectedBooking]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageTitle
        eyebrow="ADMIN / BOOKINGS MANAGEMENT"
        title="All Bookings & Dispatch Control"
        desc="Monitor live booking statuses, assigned technicians, QA photos, locations, and trip durations."
      />

      <div className="panel" style={{ padding: '20px' }}>
        {/* Status Filter Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: statusFilter === 'CANCELLED' ? '12px' : '18px' }}>
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              className={statusFilter === st ? 'filter active-filter' : 'filter'}
              onClick={() => {
                setStatusFilter(st);
                if (st !== 'CANCELLED') setCancelledFilter('ALL');
              }}
            >
              {st} <span style={{ opacity: 0.75, marginLeft: '3px' }}>({statusCounts[st] ?? 0})</span>
            </button>
          ))}
          <div className="filter-search" style={{ marginLeft: 'auto', minWidth: '240px' }}>
            <Search size={15} />
            <input
              placeholder="Search #BK, customer, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Cancelled Source Subfilter (Customer vs Technician) */}
        {statusFilter === 'CANCELLED' && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            padding: '10px 14px',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            marginBottom: '18px',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', marginRight: '6px' }}>
              Cancellation Source:
            </span>
            {CANCELLED_SUBFILTERS.map((sub) => (
              <button
                key={sub.key}
                type="button"
                onClick={() => setCancelledFilter(sub.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: cancelledFilter === sub.key ? '1px solid #dc2626' : '1px solid #fca5a5',
                  background: cancelledFilter === sub.key ? '#dc2626' : '#fff',
                  color: cancelledFilter === sub.key ? '#fff' : '#991b1b',
                }}
              >
                {sub.label} ({cancelledSubCounts[sub.key] ?? 0})
              </button>
            ))}
          </div>
        )}

        {visibleBookings.length === 0 ? (
          <div className="empty-state">
            <CalendarCheck size={36} />
            <h3>No bookings in {statusFilter === 'All' ? 'list' : statusFilter}</h3>
            <p>
              {statusFilter === 'All'
                ? 'Try a different search keyword.'
                : `There are currently 0 bookings with status ${statusFilter}.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {visibleBookings.map((b) => {
              const badge = getStatusBadgeMeta(b);
              return (
                <div
                  key={b.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '18px',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Card Top Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#087cf0', display: 'grid', placeItems: 'center' }}>
                        <CarFront size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <b style={{ fontSize: '14px', color: '#0f172a' }}>{b.bookingNumber}</b>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#087cf0' }}>{b.serviceName}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>· {b.vehicleName} ({b.licensePlate || 'No plate'})</span>
                        </div>
                        <small style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                          <span>Customer: <b>{b.customerName}</b></span>
                          <span>·</span>
                          <span>
                            Technician: <b>{b.technicianName || 'Unassigned'}</b>
                          </span>
                          <span>·</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={12} /> {b.address}
                          </span>
                          <span>· {formatDateTime(b.scheduledAt)}</span>
                        </small>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <b style={{ fontSize: '18px', color: '#0f172a' }}>EGP {b.totalPrice}</b>
                      <small style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                        Deposit: EGP {b.depositAmount} · Rem: EGP {b.remainingBalance}
                      </small>
                    </div>
                  </div>

                  {/* Card Footer: Price Breakdown & Read-Only Technician on Left | Details Button + Status Always Bottom Right */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '12px',
                  }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', fontSize: '10px', color: '#475569' }}>
                      <span style={{ padding: '4px 9px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        Base: EGP {b.basePackagePrice} × {b.vehicleMultiplier}
                      </span>
                      {b.addOnsSubtotal > 0 && (
                        <span style={{ padding: '4px 9px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
                          Add-Ons: +EGP {b.addOnsSubtotal} {b.addOnNames?.length ? `(${b.addOnNames.join(', ')})` : ''}
                        </span>
                      )}
                      {b.distanceSurcharge > 0 && (
                        <span style={{ padding: '4px 9px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          Distance: +EGP {b.distanceSurcharge}
                        </span>
                      )}
                      {b.upsellTotal > 0 && (
                        <span style={{ padding: '4px 9px', background: '#fff7ed', borderRadius: '6px', border: '1px solid #fdba74', color: '#c2410c' }}>
                          Upsell: +EGP {b.upsellTotal}
                        </span>
                      )}
                    </div>

                    {/* Right-aligned Details Button & Read-Only Status Badge (Always Bottom Right) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                      <button
                        type="button"
                        className="btn outline"
                        onClick={() => setSelectedBooking(b)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          borderColor: '#087cf0',
                          color: '#087cf0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Eye size={14} /> View Details
                      </button>

                      <span
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${badge.border}`,
                          fontSize: '11px',
                          fontWeight: 800,
                          background: badge.bg,
                          color: badge.color,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {badge.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trip Full Details Modal */}
      {selectedBooking && (() => {
        const badge = getStatusBadgeMeta(selectedBooking);
        const mapsUrl =
          selectedBooking.parkingLatitude && selectedBooking.parkingLongitude
            ? `https://www.google.com/maps?q=${selectedBooking.parkingLatitude},${selectedBooking.parkingLongitude}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBooking.address || 'Cairo')}`;

        return (
          <div
            onClick={() => setSelectedBooking(null)}
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
                maxWidth: '820px',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#fff',
                borderRadius: '18px',
                boxShadow: '0 24px 60px rgba(15, 23, 42, 0.35)',
                border: '1px solid #e2e8f0',
              }}
            >
              {/* Modal Header */}
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
                      Trip Details · {selectedBooking.bookingNumber}
                    </h2>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      border: `1px solid ${badge.border}`,
                      background: badge.bg,
                      color: badge.color,
                      fontSize: '10px',
                      fontWeight: 800,
                    }}>
                      {badge.text}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                    {selectedBooking.serviceName} · Customer: <b>{selectedBooking.customerName}</b> · Technician: <b>{selectedBooking.technicianName || 'Unassigned'}</b>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
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
                {/* Timing & Durations Summary */}
                <div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Timer size={15} color="#087cf0" /> Trip Timing &amp; Durations
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                    <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                      <small style={{ display: 'block', fontSize: '10px', color: '#0369a1', fontWeight: 700 }}>Technician Travel Time</small>
                      <b style={{ fontSize: '16px', color: '#0c4a6e' }}>{formatDuration(selectedBooking.travelDurationMinutes)}</b>
                      <small style={{ display: 'block', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                        {formatDateTime(selectedBooking.onTheWayAt)} → {formatDateTime(selectedBooking.arrivedAt)}
                      </small>
                    </div>

                    <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <small style={{ display: 'block', fontSize: '10px', color: '#475569', fontWeight: 700 }}>Work Started At</small>
                      <b style={{ fontSize: '14px', color: '#0f172a' }}>{formatDateTime(selectedBooking.washingStartedAt)}</b>
                      <small style={{ display: 'block', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                        Arrived: {formatDateTime(selectedBooking.arrivedAt)}
                      </small>
                    </div>

                    <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <small style={{ display: 'block', fontSize: '10px', color: '#475569', fontWeight: 700 }}>Work Finished At</small>
                      <b style={{ fontSize: '14px', color: '#0f172a' }}>{formatDateTime(selectedBooking.completedAt)}</b>
                      <small style={{ display: 'block', fontSize: '10px', color: '#15803d', marginTop: '2px', fontWeight: 600 }}>
                        Work duration: {formatDuration(selectedBooking.workDurationMinutes)}
                      </small>
                    </div>

                    <div style={{ padding: '12px 14px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #86efac' }}>
                      <small style={{ display: 'block', fontSize: '10px', color: '#15803d', fontWeight: 700 }}>Total Trip Duration</small>
                      <b style={{ fontSize: '16px', color: '#14532d' }}>{formatDuration(selectedBooking.totalTripMinutes)}</b>
                      <small style={{ display: 'block', fontSize: '10px', color: '#166534', marginTop: '2px' }}>
                        Start to Completion
                      </small>
                    </div>
                  </div>
                </div>

                {/* Service Location Card */}
                <div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="#087cf0" /> Service Location
                  </h3>
                  <div style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid #dbeafe',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}>
                    <div>
                      <b style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{selectedBooking.address || 'No address provided'}</b>
                      <small style={{ fontSize: '11px', color: '#475569' }}>
                        Distance: <b>{selectedBooking.distanceText || '—'}</b>
                        {selectedBooking.parkingLatitude && selectedBooking.parkingLongitude
                          ? ` · GPS: ${Number(selectedBooking.parkingLatitude).toFixed(4)}, ${Number(selectedBooking.parkingLongitude).toFixed(4)}`
                          : ''}
                      </small>
                    </div>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn primary"
                      style={{ textDecoration: 'none', padding: '8px 14px', fontSize: '11px' }}
                    >
                      <Navigation size={14} /> Open Location in Maps <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* QA Photos Section (Before & After) */}
                <div>
                  <h3 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={15} color="#087cf0" /> QA Inspection Photos ({selectedBooking.photos?.length ?? 0} total)
                  </h3>

                  {(!selectedBooking.photos || selectedBooking.photos.length === 0) ? (
                    <div style={{ padding: '20px', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                      No QA photos uploaded for this booking yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {[
                        { title: `Before Wash Photos (${selectedPhotos.before.length})`, items: selectedPhotos.before },
                        { title: `After Wash Photos (${selectedPhotos.after.length})`, items: selectedPhotos.after },
                      ].map((group) => (
                        <div key={group.title} style={{ padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                          <b style={{ display: 'block', fontSize: '12px', color: '#1e293b', marginBottom: '10px' }}>{group.title}</b>
                          {group.items.length === 0 ? (
                            <small style={{ color: '#94a3b8' }}>No photos in this stage.</small>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: '10px' }}>
                              {group.items.map((p) => (
                                <a
                                  key={p.id}
                                  href={resolveAssetUrl(p.imageUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'block',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    border: '1px solid #cbd5e1',
                                    background: '#fff',
                                    textDecoration: 'none',
                                  }}
                                >
                                  <img
                                    src={resolveAssetUrl(p.imageUrl)}
                                    alt={`${p.photoType} ${p.category}`}
                                    style={{ width: '100%', height: '84px', objectFit: 'cover', display: 'block' }}
                                  />
                                  <div style={{ padding: '5px 7px', fontSize: '10px', color: '#334155' }}>
                                    <b style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <CheckCircle2 size={10} color="#16a34a" /> {p.category}
                                    </b>
                                    <small style={{ color: '#94a3b8', fontSize: '9px' }}>
                                      {formatDateTime(p.timestamp)}
                                    </small>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Milestone Timestamps */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  fontSize: '11px',
                  color: '#475569',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={12} color="#087cf0" /> Accepted: <b>{formatDateTime(selectedBooking.acceptedAt)}</b>
                  </span>
                  <span>On The Way: <b>{formatDateTime(selectedBooking.onTheWayAt)}</b></span>
                  <span>Arrived: <b>{formatDateTime(selectedBooking.arrivedAt)}</b></span>
                  <span>Started Wash: <b>{formatDateTime(selectedBooking.washingStartedAt)}</b></span>
                  <span>Completed: <b>{formatDateTime(selectedBooking.completedAt)}</b></span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
