import { useNavigate } from 'react-router-dom';
import {
  CircleDollarSign,
  BriefcaseBusiness,
  Wrench,
  ShieldAlert,
  TrendingUp,
  ChevronRight,
  Clock3,
} from 'lucide-react';
import PageTitle from '../../component/PageTitle';
import Stat from '../../component/Stat';
import { useAdmin } from '../../context/AdminContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { dashboard, loading } = useAdmin();

  if (loading && !dashboard) {
    return <div className="empty-state"><p>Loading Admin dashboard…</p></div>;
  }

  const recentBookings = dashboard?.recentBookings ?? [];
  const revenueByPackage = dashboard?.revenueByPackage ?? [];
  const statusBreakdown = dashboard?.statusBreakdown ?? [];
  const maxPkgRevenue = Math.max(...revenueByPackage.map((p) => p.revenue), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageTitle
        eyebrow="ADMIN / OVERVIEW"
        title="Platform Control Dashboard"
        desc="Monitor revenue, live bookings, technicians, disputes, and payout requests across EGHSELHA."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn outline" onClick={() => navigate('/admin/catalog')}>
              Manage Pricing & Zones
            </button>
            <button className="btn primary" onClick={() => navigate('/admin/bookings')}>
              Manage All Bookings <ChevronRight size={15} />
            </button>
          </div>
        }
      />

      {/* Top KPI Grid */}
      <section className="stats-grid">
        <Stat
          icon={CircleDollarSign}
          label="Completed Revenue"
          value={`EGP ${(dashboard?.totalRevenue ?? 0).toLocaleString()}`}
          change={`Platform 30%: EGP ${(dashboard?.platformCommission ?? 0).toLocaleString()}`}
          tone="green"
        />
        <Stat
          icon={BriefcaseBusiness}
          label="Total Bookings"
          value={String(dashboard?.totalBookings ?? 0)}
          change={`${dashboard?.activeBookings ?? 0} active · ${dashboard?.completedBookings ?? 0} completed`}
        />
        <Stat
          icon={Wrench}
          label="Technicians"
          value={`${dashboard?.onlineTechnicians ?? 0} / ${dashboard?.totalTechnicians ?? 0}`}
          change={`${dashboard?.totalCustomers ?? 0} registered customers`}
          tone="purple"
        />
        <Stat
          icon={ShieldAlert}
          label="Attention Needed"
          value={`${dashboard?.openDisputes ?? 0} Disputes`}
          change={`${dashboard?.pendingPayoutsCount ?? 0} pending payouts (EGP ${(dashboard?.pendingPayoutsAmount ?? 0).toLocaleString()})`}
          tone="yellow"
        />
      </section>

      {/* Actionable Alert Strip if disputes or payouts exist */}
      {((dashboard?.openDisputes ?? 0) > 0 || (dashboard?.pendingPayoutsCount ?? 0) > 0 || (dashboard?.pendingApplicationsCount ?? 0) > 0) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '14px',
          }}
        >
          {(dashboard?.openDisputes ?? 0) > 0 && (
            <div
              onClick={() => navigate('/admin/disputes')}
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <b style={{ color: '#991b1b', fontSize: '13px', display: 'block' }}>
                  {dashboard.openDisputes} Open Dispute{dashboard.openDisputes > 1 ? 's' : ''}
                </b>
                <small style={{ color: '#b91c1c', fontSize: '11px' }}>Click to review PhotoQA & resolve</small>
              </div>
              <ChevronRight size={18} color="#dc2626" />
            </div>
          )}

          {(dashboard?.pendingPayoutsCount ?? 0) > 0 && (
            <div
              onClick={() => navigate('/admin/payouts')}
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <b style={{ color: '#92400e', fontSize: '13px', display: 'block' }}>
                  {dashboard.pendingPayoutsCount} Pending Payout{dashboard.pendingPayoutsCount > 1 ? 's' : ''} (EGP {dashboard.pendingPayoutsAmount})
                </b>
                <small style={{ color: '#b45309', fontSize: '11px' }}>Click to approve or cancel transfers</small>
              </div>
              <ChevronRight size={18} color="#d97706" />
            </div>
          )}

          {(dashboard?.pendingApplicationsCount ?? 0) > 0 && (
            <div
              onClick={() => navigate('/admin/technicians')}
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <b style={{ color: '#1e3a8a', fontSize: '13px', display: 'block' }}>
                  {dashboard.pendingApplicationsCount} Technician Application Pending
                </b>
                <small style={{ color: '#1d4ed8', fontSize: '11px' }}>Click to verify equipment & approve</small>
              </div>
              <ChevronRight size={18} color="#2563eb" />
            </div>
          )}
        </div>
      )}

      {/* Middle Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '18px' }}>
        <section className="panel" style={{ padding: '22px' }}>
          <div className="panel-head">
            <div>
              <h2>Revenue by Service Package</h2>
              <p>Completed wash earnings breakdown (Tech 70% / Platform 30%)</p>
            </div>
            <TrendingUp size={18} color="#087cf0" />
          </div>

          {revenueByPackage.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '12px' }}>No completed bookings yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              {revenueByPackage.map((pkg) => {
                const pct = Math.round((pkg.revenue / maxPkgRevenue) * 100);
                return (
                  <div key={pkg.packageName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                      <b style={{ color: '#102a40' }}>
                        {pkg.packageName} <span style={{ color: '#64748b', fontWeight: 500 }}>({pkg.bookingsCount} jobs)</span>
                      </b>
                      <b style={{ color: '#087cf0' }}>EGP {pkg.revenue.toLocaleString()}</b>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #087cf0, #38bdf8)', borderRadius: '99px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="panel" style={{ padding: '22px' }}>
          <div className="panel-head">
            <div>
              <h2>Booking Status Distribution</h2>
              <p>Live pipeline across all bookings</p>
            </div>
            <Clock3 size={18} color="#64748b" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
            {statusBreakdown.map((item) => (
              <div
                key={item.status}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>{item.status}</span>
                <b style={{ fontSize: '16px', color: '#0f172a' }}>{item.Count ?? item.count}</b>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Bookings Table */}
      <section className="panel" style={{ padding: '22px' }}>
        <div className="panel-head">
          <div>
            <h2>Recent Bookings</h2>
            <p>Latest bookings across all customers & technicians</p>
          </div>
          <button className="text-btn" onClick={() => navigate('/admin/bookings')}>
            View all bookings <ChevronRight size={15} />
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>BOOKING</th>
                <th>CUSTOMER</th>
                <th>PACKAGE & VEHICLE</th>
                <th>TECHNICIAN</th>
                <th>TOTAL PRICE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td><b style={{ color: '#087cf0' }}>{b.bookingNumber}</b></td>
                  <td>
                    <b>{b.customerName}</b>
                    <small style={{ display: 'block', color: '#94a3b8' }}>{b.address}</small>
                  </td>
                  <td>
                    <b>{b.serviceName}</b>
                    <small style={{ display: 'block', color: '#94a3b8' }}>{b.vehicleName}</small>
                  </td>
                  <td>{b.technicianName || <span style={{ color: '#ea580c', fontWeight: 600 }}>Unassigned</span>}</td>
                  <td><b>EGP {b.totalPrice}</b></td>
                  <td>
                    <span className={`payment-status ${b.status === 'COMPLETED' ? 'paid' : 'pending'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
