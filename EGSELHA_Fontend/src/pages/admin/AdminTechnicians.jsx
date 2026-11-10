import { useState } from 'react';
import { Wrench, Star, CheckCircle2, XCircle, ShieldCheck, Power } from 'lucide-react';
import PageTitle from '../../component/PageTitle';
import { useAdmin } from '../../context/AdminContext';
import { adminApi } from '../../services/adminApi';

export default function AdminTechnicians() {
  const { technicians, notify, refreshAll } = useAdmin();
  const [busyId, setBusyId] = useState(null);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageTitle
        eyebrow="ADMIN / FLEET & ONBOARDING"
        title="Technicians & Application Verification"
        desc="Manage online availability, verify mobile detailing equipment, and approve or suspend technicians."
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  className="btn outline"
                  disabled={busyId === t.id}
                  onClick={() => handleToggleOnline(t)}
                  style={{ flex: 1 }}
                >
                  <Power size={14} /> {t.isOnline ? 'Set Offline' : 'Set Online'}
                </button>
                {t.applicationStatus !== 'Approved' ? (
                  <button
                    className="btn primary"
                    disabled={busyId === t.id}
                    onClick={() => handleReviewApp(t, 'Approved')}
                    style={{ flex: 1, background: '#16a34a', borderColor: '#16a34a' }}
                  >
                    <ShieldCheck size={14} /> Approve
                  </button>
                ) : (
                  <button
                    className="btn outline"
                    disabled={busyId === t.id}
                    onClick={() => handleReviewApp(t, 'Suspended')}
                    style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
