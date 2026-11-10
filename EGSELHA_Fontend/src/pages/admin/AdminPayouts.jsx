import { useState } from 'react';
import { Wallet, CheckCircle2, XCircle } from 'lucide-react';
import PageTitle from '../../component/PageTitle';
import { useAdmin } from '../../context/AdminContext';
import { adminApi } from '../../services/adminApi';

export default function AdminPayouts() {
  const { payouts, notify, refreshAll } = useAdmin();
  const [busyId, setBusyId] = useState(null);

  const handleProcess = async (payout, approve) => {
    setBusyId(payout.id);
    try {
      await adminApi.processPayout(payout.id, approve);
      notify(
        approve
          ? `Payout of EGP ${payout.amount} to ${payout.technicianName} approved!`
          : `Payout of EGP ${payout.amount} cancelled & refunded to ${payout.technicianName}'s balance.`
      );
      await refreshAll();
    } catch (err) {
      notify(err.message || 'Failed to process payout.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageTitle
        eyebrow="ADMIN / FINANCE & PAYOUTS"
        title="Technician Payout Requests"
        desc="Approve Instapay / Vodafone Cash / Bank withdrawal requests or cancel to refund technician balance."
      />

      <div className="panel" style={{ padding: '20px' }}>
        {payouts.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px 24px' }}>
            <Wallet size={38} />
            <h3>No payout requests yet</h3>
            <p>When technicians request withdrawals from Earnings, they will appear here for approval.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TECHNICIAN</th>
                  <th>METHOD</th>
                  <th>DESTINATION</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const isPending = p.status === 'Pending';
                  return (
                    <tr key={p.id}>
                      <td>{new Date(p.requestedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      <td><b>{p.technicianName}</b></td>
                      <td>{p.payoutMethod}</td>
                      <td>{p.accountDetails}</td>
                      <td><b style={{ color: '#0f172a' }}>EGP {p.amount.toLocaleString()}</b></td>
                      <td>
                        <span className={`payment-status ${p.status === 'Processed' ? 'paid' : 'pending'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {isPending ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn primary"
                              style={{ padding: '6px 10px', fontSize: '10px', background: '#16a34a', borderColor: '#16a34a' }}
                              disabled={busyId === p.id}
                              onClick={() => handleProcess(p, true)}
                            >
                              <CheckCircle2 size={13} /> Approve
                            </button>
                            <button
                              className="btn outline"
                              style={{ padding: '6px 10px', fontSize: '10px', color: '#dc2626', borderColor: '#fca5a5' }}
                              disabled={busyId === p.id}
                              onClick={() => handleProcess(p, false)}
                            >
                              <XCircle size={13} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <small style={{ color: '#94a3b8' }}>
                            {p.processedAt ? new Date(p.processedAt).toLocaleDateString('en-GB') : 'Closed'}
                          </small>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
