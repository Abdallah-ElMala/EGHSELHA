import { useState, useEffect } from 'react';
import { Tags, MapPin, Save, Plus, CheckCircle2 } from 'lucide-react';
import PageTitle from '../../component/PageTitle';
import { useAdmin } from '../../context/AdminContext';
import { adminApi } from '../../services/adminApi';

export default function AdminCatalogZones() {
  const { catalog, notify, refreshAll } = useAdmin();
  const [packages, setPackages] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [zones, setZones] = useState([]);
  const [savingId, setSavingId] = useState(null);

  // New zone modal / inline form
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneFee, setNewZoneFee] = useState(25);
  const [newZoneSurge, setNewZoneSurge] = useState(1.0);
  const [newZoneMaxTechs, setNewZoneMaxTechs] = useState(10);

  useEffect(() => {
    setPackages(catalog?.packages ?? []);
    setAddOns(catalog?.addOns ?? []);
    setZones(catalog?.zones ?? []);
  }, [catalog]);

  const handleSavePackage = async (pkg) => {
    setSavingId(pkg.id);
    try {
      await adminApi.updatePackage(pkg.id, {
        name: pkg.name,
        basePrice: Number(pkg.basePrice),
        durationMinutes: Number(pkg.durationMinutes),
        requiresElectricity: Boolean(pkg.requiresElectricity),
        requiresWater: Boolean(pkg.requiresWater),
        requiresPrivateParking: Boolean(pkg.requiresPrivateParking),
      });
      notify(`Package "${pkg.name}" updated (EGP ${pkg.basePrice}).`);
      await refreshAll();
    } catch (err) {
      notify(err.message || 'Failed to update package.');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAddOn = async (addon) => {
    setSavingId(addon.id);
    try {
      await adminApi.updateAddOn(addon.id, {
        name: addon.name,
        price: Number(addon.price),
        description: addon.description,
        isActive: Boolean(addon.isActive),
      });
      notify(`Add-on "${addon.name}" updated (EGP ${addon.price}).`);
      await refreshAll();
    } catch (err) {
      notify(err.message || 'Failed to update add-on.');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveZone = async (z) => {
    setSavingId(z.id);
    try {
      const statusMap = { ACTIVE: 1, INACTIVE: 2, UNAVAILABLE: 3 };
      await adminApi.updateZone(z.id, {
        zoneName: z.zoneName,
        status: statusMap[z.status] ?? 1,
        baseDistanceSurcharge: Number(z.baseDistanceSurcharge),
        peakSurgeMultiplier: Number(z.peakSurgeMultiplier),
        maxTechnicians: Number(z.maxTechnicians),
      });
      notify(`Zone "${z.zoneName}" saved.`);
      await refreshAll();
    } catch (err) {
      notify(err.message || 'Failed to update zone.');
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;
    setSavingId('new-zone');
    try {
      await adminApi.createZone({
        zoneName: newZoneName.trim(),
        status: 1,
        baseDistanceSurcharge: Number(newZoneFee),
        peakSurgeMultiplier: Number(newZoneSurge),
        maxTechnicians: Number(newZoneMaxTechs),
      });
      notify(`Service zone "${newZoneName.trim()}" created!`);
      setNewZoneName('');
      await refreshAll();
    } catch (err) {
      notify(err.message || 'Failed to create zone.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageTitle
        eyebrow="ADMIN / CATALOG & ZONES"
        title="Packages, Add-Ons & Service Zones"
        desc="Configure wash package pricing, optional add-ons, and geographic zone surcharges & surge multipliers."
      />

      {/* 1. Service Packages */}
      <section className="panel" style={{ padding: '22px' }}>
        <div className="panel-head">
          <div>
            <h2>Wash Packages</h2>
            <p>Changes directly affect new customer booking prices</p>
          </div>
          <Tags size={18} color="#087cf0" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '14px', marginTop: '12px' }}>
          {packages.map((pkg, idx) => (
            <div key={pkg.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <b style={{ fontSize: '14px', color: '#0f172a' }}>{pkg.name}</b>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Base Price (EGP)</label>
                  <input
                    type="number"
                    min="50"
                    value={pkg.basePrice}
                    onChange={(e) => {
                      const next = [...packages];
                      next[idx] = { ...pkg, basePrice: e.target.value };
                      setPackages(next);
                    }}
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Duration (mins)</label>
                  <input
                    type="number"
                    min="15"
                    value={pkg.durationMinutes}
                    onChange={(e) => {
                      const next = [...packages];
                      next[idx] = { ...pkg, durationMinutes: e.target.value };
                      setPackages(next);
                    }}
                    style={{ width: '100%', padding: '7px 9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>
              <button className="btn primary" disabled={savingId === pkg.id} onClick={() => handleSavePackage(pkg)}>
                <Save size={14} /> {savingId === pkg.id ? 'Saving...' : 'Save Package'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Add-Ons */}
      <section className="panel" style={{ padding: '22px' }}>
        <div className="panel-head">
          <div>
            <h2>Extra Add-Ons</h2>
            <p>Configure optional detailing add-on prices and availability</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '14px', marginTop: '12px' }}>
          {addOns.map((addon, idx) => (
            <div key={addon.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <b style={{ fontSize: '13px', color: '#0f172a' }}>{addon.name}</b>
                <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={addon.isActive}
                    onChange={(e) => {
                      const next = [...addOns];
                      next[idx] = { ...addon, isActive: e.target.checked };
                      setAddOns(next);
                    }}
                  />
                  Active
                </label>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Price (EGP)</label>
                <input
                  type="number"
                  min="10"
                  value={addon.price}
                  onChange={(e) => {
                    const next = [...addOns];
                    next[idx] = { ...addon, price: e.target.value };
                    setAddOns(next);
                  }}
                  style={{ width: '100%', padding: '7px 9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <button className="btn outline" disabled={savingId === addon.id} onClick={() => handleSaveAddOn(addon)}>
                <Save size={14} /> {savingId === addon.id ? 'Saving...' : 'Save Add-On'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Service Zones */}
      <section className="panel" style={{ padding: '22px' }}>
        <div className="panel-head">
          <div>
            <h2>Service Zones & Surge Multipliers</h2>
            <p>Manage coverage areas, distance surcharges, and peak surge multipliers</p>
          </div>
          <MapPin size={18} color="#087cf0" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          {zones.map((z, idx) => (
            <div
              key={z.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr auto',
                gap: '10px',
                alignItems: 'end',
              }}
            >
              <div>
                <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Zone Name</label>
                <input
                  value={z.zoneName}
                  onChange={(e) => {
                    const next = [...zones];
                    next[idx] = { ...z, zoneName: e.target.value };
                    setZones(next);
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Status</label>
                <select
                  value={z.status}
                  onChange={(e) => {
                    const next = [...zones];
                    next[idx] = { ...z, status: e.target.value };
                    setZones(next);
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="UNAVAILABLE">UNAVAILABLE</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Distance Fee (EGP)</label>
                <input
                  type="number"
                  value={z.baseDistanceSurcharge}
                  onChange={(e) => {
                    const next = [...zones];
                    next[idx] = { ...z, baseDistanceSurcharge: e.target.value };
                    setZones(next);
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Surge (×)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={z.peakSurgeMultiplier}
                  onChange={(e) => {
                    const next = [...zones];
                    next[idx] = { ...z, peakSurgeMultiplier: e.target.value };
                    setZones(next);
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Max Techs</label>
                <input
                  type="number"
                  min="1"
                  value={z.maxTechnicians}
                  onChange={(e) => {
                    const next = [...zones];
                    next[idx] = { ...z, maxTechnicians: e.target.value };
                    setZones(next);
                  }}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <button className="btn primary" disabled={savingId === z.id} onClick={() => handleSaveZone(z)}>
                <CheckCircle2 size={14} /> Save
              </button>
            </div>
          ))}
        </div>

        {/* Add New Zone Form */}
        <form onSubmit={handleCreateZone} style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>New Zone Name</label>
            <input
              placeholder="e.g. West Cairo - Sheikh Zayed"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Distance Fee</label>
            <input
              type="number"
              value={newZoneFee}
              onChange={(e) => setNewZoneFee(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Surge (×)</label>
            <input
              type="number"
              step="0.1"
              value={newZoneSurge}
              onChange={(e) => setNewZoneSurge(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Max Techs</label>
            <input
              type="number"
              value={newZoneMaxTechs}
              onChange={(e) => setNewZoneMaxTechs(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            />
          </div>
          <button type="submit" className="btn outline" disabled={savingId === 'new-zone'}>
            <Plus size={14} /> Add Zone
          </button>
        </form>
      </section>
    </div>
  );
}
