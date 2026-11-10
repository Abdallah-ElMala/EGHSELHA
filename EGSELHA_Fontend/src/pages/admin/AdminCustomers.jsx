import { useMemo, useState } from 'react';
import { Search, Users, Car, Star, Wallet, MapPin } from 'lucide-react';
import PageTitle from '../../component/PageTitle';
import { useAdmin } from '../../context/AdminContext';

export default function AdminCustomers() {
  const { customers } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageTitle
        eyebrow="ADMIN / CUSTOMERS"
        title="Customer Directory"
        desc="View registered vehicle owners, wallet balances, loyalty points, and total booking spend."
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
                  <th>LOYALTY</th>
                </tr>
              </thead>
              <tbody>
                {visibleCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <b>{c.fullName}</b>
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
                    <td><b style={{ color: '#0f172a' }}>EGP {c.totalSpent.toLocaleString()}</b></td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 700 }}>
                        <Wallet size={13} /> EGP {c.walletBalance.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d97706', fontWeight: 700 }}>
                        <Star size={13} fill="#d97706" /> {c.loyaltyPoints} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
