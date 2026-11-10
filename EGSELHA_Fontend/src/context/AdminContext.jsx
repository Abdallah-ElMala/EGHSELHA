import { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [catalog, setCatalog] = useState({ packages: [], addOns: [], zones: [] });
  const [disputes, setDisputes] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const notify = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshAll = async () => {
    try {
      const [dash, bks, techs, custs, cat, disps, pays] = await Promise.all([
        adminApi.getDashboard().catch(() => null),
        adminApi.getBookings().catch(() => []),
        adminApi.getTechnicians().catch(() => []),
        adminApi.getCustomers().catch(() => []),
        adminApi.getCatalog().catch(() => ({ packages: [], addOns: [], zones: [] })),
        adminApi.getDisputes().catch(() => []),
        adminApi.getPayouts().catch(() => []),
      ]);
      if (dash) setDashboard(dash);
      if (Array.isArray(bks)) setBookings(bks);
      if (Array.isArray(techs)) setTechnicians(techs);
      if (Array.isArray(custs)) setCustomers(custs);
      if (cat) setCatalog(cat);
      if (Array.isArray(disps)) setDisputes(disps);
      if (Array.isArray(pays)) setPayouts(pays);
    } catch (err) {
      console.error('Admin refresh error:', err);
    }
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      await refreshAll();
      setLoading(false);
    }
    init();
    const interval = setInterval(() => {
      if (typeof document === 'undefined' || !document.hidden) {
        refreshAll();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        dashboard,
        bookings,
        technicians,
        customers,
        catalog,
        disputes,
        payouts,
        loading,
        toastMessage,
        notify,
        refreshAll,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
