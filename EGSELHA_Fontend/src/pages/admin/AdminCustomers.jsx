import { useMemo, useState } from 'react';
import {
  Search,
  Users,
  Car,
  Star,
  Wallet,
  MapPin,
  Eye,
  X,
  Phone,
  Mail,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileText
} from 'lucide-react';
import PageTitle from '../../component/PageTitle';
import { useAdmin } from '../../context/AdminContext';

const BOOKING_STATUS_COLORS = {
  COMPLETED: { bg: '#dcfce7', color: '#15803d' },
  WASHING: { bg: '#e0f2fe', color: '#0369a1' },
  ON_THE_WAY: { bg: '#dbeafe', color: '#1d4ed8' },
  ARRIVED: { bg: '#ede9fe', color: '#6d28d9' },
  DISPATCHED: { bg: '#fef3c7', color: '#b45309' },
  DEPOSIT_PAID: { bg: '#fef3c7', color: '#b45309' },
  PENDING: { bg: '#f1f5f9', color: '#475569' },
  CANCELLED: { bg: '#fee2e2', color: '#b91c1c' }
};

export default function AdminCustomers() {
  const { customers, bookings, disputes } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const visibleCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return customers.filter(
      (c) =>
        !q ||
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const customerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    return (bookings || []).filter(
      (b) => b.customerId === selectedCustomer.id || (b.customerName && b.customerName === selectedCustomer.fullName)
    );
  }, [bookings, selectedCustomer]);

  const customerDisputes = useMemo(() => {
    if (!selectedCustomer) return [];
    return (disputes || []).filter(
      (d) => d.customerId === selectedCustomer.id || (d.customerName && d.customerName === selectedCustomer.fullName)
    );
  }, [disputes, selectedCustomer]);

  const getCustomerDisputesCount = (c) => {
    if (typeof c.disputesCount === 'number' && c.disputesCount > 0) return c.disputesCount;
    return (disputes || []).filter((d) => d.customerId === c.id || d.customerName === c.fullName).length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageTitle
        eyebrow="ADMIN / CUSTOMERS"
        title="Customer Directory"
        desc="View registered vehicle owners, inspect full read-only customer profiles, vehicles, bookings, spend, and disputes."
      />

      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <b style={{ fontSize: '13px', color: '#0f172a' }}>Total Customers: {visibleCustomers.length}</b>
          <div className="filter-search" style={{ minWidth: '260px' }}>
            <Search size={15} />
            <input
              placeholder="Search name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {visibleCustomers.length === 0 ? (
          <div className="empty-state">
            <Users size={36} />
            <h3>No customers found</h3>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>CONTACT</th>
                  <th>VEHICLES</th>
                  <th>BOOKINGS</th>
                  <th>TOTAL SPENT</th>
                  <th>WALLET</th>
                  <th>ISSUES</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {visibleCustomers.map((c) => {
                  const issuesCount = getCustomerDisputesCount(c);
                  return (
                    <tr key={c.id}>
                      <td>
                        <b
                          onClick={() => setSelectedCustomer(c)}
                          style={{ cursor: 'pointer', color: '#0f172a' }}
                          title="Click to show profile"
                        >
                          {c.fullName}
                        </b>
                        {c.savedAddresses?.length > 0 && (
                          <small style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                            <MapPin size={11} /> {c.savedAddresses[0]}
                          </small>
                        )}
                      </td>
                      <td>
                        <div>{c.phone}</div>
                        <small style={{ color: '#94a3b8' }}>{c.email}</small>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                          <Car size={13} color="#087cf0" /> {c.vehiclesCount}
                        </span>
                      </td>
                      <td><b>{c.bookingsCount}</b></td>
                      <td><b style={{ color: '#0f172a' }}>EGP {(c.totalSpent || 0).toLocaleString()}</b></td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 700 }}>
                          <Wallet size={13} /> EGP {(c.walletBalance || 0).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        {issuesCount > 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#fef2f2', color: '#dc2626' }}>
                            <AlertTriangle size={12} /> {issuesCount} {issuesCount === 1 ? 'Issue' : 'Issues'}
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>
                            <CheckCircle2 size={12} /> None
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn soft sm"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          <Eye size={13} /> Show Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Read-Only Customer Profile Modal */}
      {selectedCustomer && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedCustomer(null)}
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
              maxWidth: '800px',
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
                    background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '18px',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                  }}
                >
                  {selectedCustomer.fullName.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{selectedCustomer.fullName}</h3>
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
                      Customer · Read-Only
                    </span>
                    {customerDisputes.length > 0 && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '20px',
                          background: 'rgba(239, 68, 68, 0.25)',
                          color: '#fca5a5'
                        }}
                      >
                        ⚠ {customerDisputes.length} {customerDisputes.length === 1 ? 'Dispute' : 'Disputes'}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {selectedCustomer.email} · {selectedCustomer.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
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
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '14px', padding: '14px' }}>
                  <small style={{ fontSize: '11px', color: '#0369a1', display: 'block' }}>Registered Vehicles</small>
                  <b style={{ fontSize: '18px', color: '#0c4a6e', display: 'block', marginTop: '4px' }}>
                    {selectedCustomer.vehiclesCount} Cars
                  </b>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                  <small style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Total Bookings</small>
                  <b style={{ fontSize: '18px', color: '#0f172a', display: 'block', marginTop: '4px' }}>
                    {selectedCustomer.bookingsCount} Trips
                  </b>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '14px' }}>
                  <small style={{ fontSize: '11px', color: '#15803d', display: 'block' }}>Total Spent</small>
                  <b style={{ fontSize: '18px', color: '#166534', display: 'block', marginTop: '4px' }}>
                    EGP {(selectedCustomer.totalSpent || 0).toLocaleString()}
                  </b>
                  <small style={{ fontSize: '10px', color: '#16a34a' }}>Wallet: EGP {(selectedCustomer.walletBalance || 0).toLocaleString()}</small>
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '14px' }}>
                  <small style={{ fontSize: '11px', color: '#b45309', display: 'block' }}>Loyalty Points</small>
                  <b style={{ fontSize: '18px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                    <Star size={16} fill="#d97706" color="#d97706" /> {selectedCustomer.loyaltyPoints || 0} pts
                  </b>
                </div>
              </div>

              {/* Contact, Addresses & Gate Notes */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Contact & Saved Locations
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <Phone size={14} color="#087cf0" />
                    <span><b>Phone:</b> {selectedCustomer.phone || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                    <Mail size={14} color="#087cf0" />
                    <span><b>Email:</b> {selectedCustomer.email || '—'}</span>
                  </div>
                </div>

                {selectedCustomer.savedAddresses?.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <small style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>SAVED ADDRESSES</small>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedCustomer.savedAddresses.map((addr, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#334155', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px' }}>
                          <MapPin size={13} color="#087cf0" style={{ flexShrink: 0 }} />
                          <span>{addr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCustomer.gateNotes && (
                  <div style={{ marginTop: '10px', padding: '10px 12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '12px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} />
                    <span><b>Gate Notes:</b> {selectedCustomer.gateNotes}</span>
                  </div>
                )}
              </div>

              {/* Registered Vehicles */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Car size={15} color="#087cf0" /> Registered Vehicles ({selectedCustomer.vehicles?.length || 0})
                </h4>
                {!selectedCustomer.vehicles || selectedCustomer.vehicles.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>No vehicles registered in this customer's garage yet.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                    {selectedCustomer.vehicles.map((v) => (
                      <div key={v.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <b style={{ fontSize: '13px', color: '#0f172a' }}>{v.make} {v.model}</b>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1' }}>
                            {v.sizeType}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {v.year} · Color: {v.color}
                        </div>
                        <div style={{ fontSize: '11px', color: '#334155', marginTop: '4px' }}>
                          Plate: <b>{v.licensePlate}</b>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trips / Bookings History */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarCheck size={15} color="#087cf0" /> Bookings & Trips History ({customerBookings.length})
                </h4>
                {customerBookings.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>No bookings made by this customer yet.</p>
                ) : (
                  <div className="table-wrap">
                    <table style={{ width: '100%', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th>BOOKING</th>
                          <th>SERVICE & CAR</th>
                          <th>TECHNICIAN</th>
                          <th>PRICE</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerBookings.map((b) => {
                          const st = BOOKING_STATUS_COLORS[String(b.status).toUpperCase()] || BOOKING_STATUS_COLORS.PENDING;
                          return (
                            <tr key={b.id}>
                              <td>
                                <b>{b.bookingNumber}</b>
                                <small style={{ display: 'block', color: '#94a3b8' }}>
                                  {b.scheduledAt ? new Date(b.scheduledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                </small>
                              </td>
                              <td>
                                <div>{b.serviceName}</div>
                                <small style={{ color: '#64748b' }}>{b.vehicleName} {b.licensePlate ? `· ${b.licensePlate}` : ''}</small>
                              </td>
                              <td>{b.technicianName || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                              <td><b style={{ color: '#0f172a' }}>EGP {(b.totalPrice || 0).toLocaleString()}</b></td>
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

              {/* Disputes & Issues Section */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={15} color={customerDisputes.length > 0 ? '#dc2626' : '#16a34a'} /> Disputes & Reported Issues ({customerDisputes.length})
                </h4>
                {customerDisputes.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', color: '#15803d', fontSize: '12px', fontWeight: 600 }}>
                    <CheckCircle2 size={16} />
                    <span>No disputes or issues have been reported by this customer.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {customerDisputes.map((d) => (
                      <div key={d.id} style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <b style={{ color: '#991b1b' }}>Booking {d.bookingNumber} · {d.serviceName}</b>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: d.status === 'RESOLVED' ? '#dcfce7' : '#fee2e2', color: d.status === 'RESOLVED' ? '#15803d' : '#b91c1c' }}>
                            {d.status}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 6px', color: '#7f1d1d' }}><b>Reason:</b> {d.reason}</p>
                        <div style={{ fontSize: '11px', color: '#991b1b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <span>Technician: {d.technicianName || '—'}</span>
                          <span>Filed: {d.filedAt ? new Date(d.filedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                        </div>
                        {d.adminNotes && (
                          <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #fecaca', fontSize: '11px', color: '#475569' }}>
                            <b>Admin Resolution Notes:</b> {d.adminNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
              <button className="btn outline" onClick={() => setSelectedCustomer(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
