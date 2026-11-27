import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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

  // Monotonic version to prevent stale polling responses from overwriting newer user mutations
  const syncVersionRef = useRef(0);
  const inFlightRef = useRef(false);
  const toastTimerRef = useRef(null);

  const bumpSyncVersion = useCallback(() => {
    syncVersionRef.current += 1;
    return syncVersionRef.current;
  }, []);

  const notify = useCallback((msg) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3200);
  }, []);

  // Targeted lightweight refreshers (fast, single-endpoint updates)
  const refreshDashboard = useCallback(async () => {
    const v = syncVersionRef.current;
    const dash = await adminApi.getDashboard().catch(() => null);
    if (dash && syncVersionRef.current === v) setDashboard(dash);
  }, []);

  const refreshTechnicians = useCallback(async () => {
    const v = syncVersionRef.current;
    const techs = await adminApi.getTechnicians().catch(() => null);
    if (Array.isArray(techs) && syncVersionRef.current === v) setTechnicians(techs);
  }, []);

  const refreshBookings = useCallback(async () => {
    const v = syncVersionRef.current;
    const bks = await adminApi.getBookings().catch(() => null);
    if (Array.isArray(bks) && syncVersionRef.current === v) setBookings(bks);
  }, []);

  const refreshDisputes = useCallback(async () => {
    const v = syncVersionRef.current;
    const disps = await adminApi.getDisputes().catch(() => null);
    if (Array.isArray(disps) && syncVersionRef.current === v) setDisputes(disps);
  }, []);

  const refreshPayouts = useCallback(async () => {
    const v = syncVersionRef.current;
    const pays = await adminApi.getPayouts().catch(() => null);
    if (Array.isArray(pays) && syncVersionRef.current === v) setPayouts(pays);
  }, []);

  const refreshCatalog = useCallback(async () => {
    const v = syncVersionRef.current;
    const cat = await adminApi.getCatalog().catch(() => null);
    if (cat && syncVersionRef.current === v) setCatalog(cat);
  }, []);

  const refreshAll = useCallback(async (force = false) => {
    if (inFlightRef.current && !force) return;
    inFlightRef.current = true;
    const v = syncVersionRef.current;
    try {
      const [dash, bks, techs, custs, cat, disps, pays] = await Promise.all([
        adminApi.getDashboard().catch(() => null),
        adminApi.getBookings().catch(() => null),
        adminApi.getTechnicians().catch(() => null),
        adminApi.getCustomers().catch(() => null),
        adminApi.getCatalog().catch(() => null),
        adminApi.getDisputes().catch(() => null),
        adminApi.getPayouts().catch(() => null),
      ]);
      // Drop stale response if a user action mutated state while this fetch was in flight
      if (syncVersionRef.current !== v) return;
      if (dash) setDashboard(dash);
      if (Array.isArray(bks)) setBookings(bks);
      if (Array.isArray(techs)) setTechnicians(techs);
      if (Array.isArray(custs)) setCustomers(custs);
      if (cat) setCatalog(cat);
      if (Array.isArray(disps)) setDisputes(disps);
      if (Array.isArray(pays)) setPayouts(pays);
    } catch (err) {
      console.error('Admin refresh error:', err);
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      setLoading(true);
      await refreshAll(true);
      if (active) setLoading(false);
    }
    init();
    const interval = setInterval(() => {
      if (typeof document === 'undefined' || !document.hidden) {
        refreshAll(false);
      }
    }, 30000);
    return () => {
      active = false;
      clearInterval(interval);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [refreshAll]);

  return (
    <AdminContext.Provider
      value={{
        dashboard,
        setDashboard,
        bookings,
        setBookings,
        technicians,
        setTechnicians,
        customers,
        setCustomers,
        catalog,
        setCatalog,
        disputes,
        setDisputes,
        payouts,
        setPayouts,
        loading,
        toastMessage,
        notify,
        bumpSyncVersion,
        refreshAll,
        refreshDashboard,
        refreshTechnicians,
        refreshBookings,
        refreshDisputes,
        refreshPayouts,
        refreshCatalog,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
