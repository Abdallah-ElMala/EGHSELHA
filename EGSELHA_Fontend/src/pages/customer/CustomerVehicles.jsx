import { useState } from 'react'
import { Car, Plus, ShieldCheck, CheckCircle2, MapPin, Trash2, Camera, X } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import { useCustomer } from '../../context/CustomerContext'
import { customerApi } from '../../services/customerApi'

export default function CustomerVehicles() {
  const { vehicles, profile, notify, refreshData } = useCustomer()

  // Add Vehicle Modal
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false)
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(2023)
  const [color, setColor] = useState('Black')
  const [licensePlate, setLicensePlate] = useState('')
  const [sizeType, setSizeType] = useState(0) // 0: SEDAN, 1: SUV, 2: TRUCK_VAN
  const [photoUrl, setPhotoUrl] = useState('')
  const [submittingVehicle, setSubmittingVehicle] = useState(false)

  // Add Saved Address Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [newAddressText, setNewAddressText] = useState('')
  const [submittingAddress, setSubmittingAddress] = useState(false)

  // Handle Add Vehicle (Behavior 1: addVehicle)
  const handleAddVehicle = async (e) => {
    e.preventDefault()
    if (!make.trim() || !model.trim() || !licensePlate.trim()) return

    setSubmittingVehicle(true)
    try {
      await customerApi.addVehicle({
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        color: color.trim(),
        licensePlate: licensePlate.trim(),
        sizeType: Number(sizeType),
        photoUrl: photoUrl.trim() || undefined
      })
      notify(`Vehicle ${make} ${model} registered successfully!`)
      setVehicleModalOpen(false)
      setMake('')
      setModel('')
      setLicensePlate('')
      setPhotoUrl('')
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Failed to add vehicle.')
    } finally {
      setSubmittingVehicle(false)
    }
  }

  // Handle Add Address (Attribute: savedAddresses)
  const handleAddAddress = async (e) => {
    e.preventDefault()
    if (!newAddressText.trim()) return

    setSubmittingAddress(true)
    try {
      await customerApi.addSavedAddress(newAddressText.trim())
      notify(`Address "${newAddressText.trim()}" added to your saved locations!`)
      setAddressModalOpen(false)
      setNewAddressText('')
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Failed to save address.')
    } finally {
      setSubmittingAddress(false)
    }
  }

  // Handle Delete Vehicle
  const handleDeleteVehicle = async (vehicleId, vehicleName) => {
    try {
      await customerApi.deleteVehicle(vehicleId)
      notify(`Vehicle "${vehicleName}" removed from your garage.`)
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Failed to delete vehicle.')
    }
  }

  // Handle Delete Address
  const handleDeleteAddress = async (address) => {
    try {
      await customerApi.deleteAddress(address)
      notify(`Address removed from your saved locations.`)
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Failed to delete address.')
    }
  }

  const getMultiplierInfo = (type) => {
    const s = String(type).toUpperCase()
    if (s === 'SUV' || type === 1) return { label: 'SUV', factor: '1.25× base price', bg: '#e0f2fe', text: '#0369a1' }
    if (s === 'TRUCK_VAN' || type === 2) return { label: 'Truck / Van', factor: '1.50× base price', bg: '#fef3c7', text: '#b45309' }
    return { label: 'Sedan', factor: '1.0× base price', bg: '#f0fdf4', text: '#16a34a' }
  }

  const savedAddresses = profile?.savedAddresses || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <PageTitle
        eyebrow="3. CUSTOMER / GARAGE & ADDRESSES"
        title="Vehicles & Saved Locations"
        desc="Manage your vehicles (size category directly controls pricing multipliers) and saved locations for instant 1-click booking."
        action={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn outline" onClick={() => setAddressModalOpen(true)}>
              <MapPin size={15} /> Add Saved Address
            </button>
            <button className="btn primary" onClick={() => setVehicleModalOpen(true)}>
              <Plus size={15} /> Register New Vehicle
            </button>
          </div>
        }
      />

      {/* SECTION 1: Registered Vehicles (5. Vehicle) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#102a40' }}>
            Registered Vehicles ({vehicles.length})
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {vehicles.map((v) => {
            const mult = getMultiplierInfo(v.sizeType)
            return (
              <div
                className="panel"
                key={v.id}
                style={{
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  border: '1px solid #edf2f7',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: '#07172c',
                      color: '#60b4ff',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Car size={26} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: '15px', color: '#102a40', display: 'block' }}>{v.make} {v.model}</b>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {v.year} · Color: {v.color}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteVehicle(v.id, `${v.make} ${v.model}`)}
                    title="Delete vehicle from garage"
                    style={{
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      color: '#e11d48',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'grid',
                      placeItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>License Plate:</span>
                    <b style={{ color: '#102a40', letterSpacing: '1px' }}>{v.licensePlate}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Vehicle Size Multiplier:</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: mult.bg, color: mult.text }}>
                      {mult.label} ({mult.factor})
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION 2: Saved Locations (Attribute savedAddresses from 3. Customer) */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#102a40' }}>
              Saved Addresses & Parking Spots
            </h3>
            <small style={{ color: '#64748b', fontSize: '11px' }}>
              Fast 1-click address fill for your upcoming washes
            </small>
          </div>
          <button className="btn outline" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => setAddressModalOpen(true)}>
            <Plus size={14} /> Add Address
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {savedAddresses.map((addr, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #edf2f7',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#087cf0', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: '12px', color: '#102a40', display: 'block' }}>
                  {idx === 0 ? 'Home' : idx === 1 ? 'Work' : `Saved Location #${idx + 1}`}
                </b>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>{addr}</p>
              </div>
              <button
                onClick={() => handleDeleteAddress(addr)}
                title="Remove address"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: Add Vehicle (Behavior 1: addVehicle) */}
      {vehicleModalOpen && (
        <div className="modal-overlay" onClick={() => setVehicleModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div>
                <h3>Register Vehicle</h3>
                <p>Add a new car under your customer profile (5. Vehicle)</p>
              </div>
              <button onClick={() => setVehicleModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddVehicle}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Brand / Make
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BMW, Toyota"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Model
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 320i, Corolla"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Year
                    </label>
                    <input
                      type="number"
                      required
                      min={1990}
                      max={2026}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Color
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. White, Black, Gray"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    License Plate (Identification)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. أ ب ج 1234 or ABC 1234"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>

                {/* Size Category (2. VehicleSize Enum) */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Vehicle Size Category (Dictates Pricing Multiplier)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 0, title: 'Sedan', mult: '1.0×', desc: 'Standard sedan/hatch' },
                      { id: 1, title: 'SUV', mult: '1.25×', desc: 'Crossover/SUV' },
                      { id: 2, title: 'Truck / Van', mult: '1.50×', desc: 'Pickup/Microbus' }
                    ].map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setSizeType(s.id)}
                        style={{
                          border: `1.5px solid ${sizeType === s.id ? '#087cf0' : '#cbd5e1'}`,
                          borderRadius: '8px',
                          padding: '10px 8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: sizeType === s.id ? '#f0f7ff' : '#fff'
                        }}
                      >
                        <b style={{ display: 'block', fontSize: '12px', color: sizeType === s.id ? '#087cf0' : '#1e293b' }}>
                          {s.title}
                        </b>
                        <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: 700 }}>{s.mult}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn outline" onClick={() => setVehicleModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary" disabled={submittingVehicle}>
                  {submittingVehicle ? 'Saving...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Saved Address (Attribute savedAddresses) */}
      {addressModalOpen && (
        <div className="modal-overlay" onClick={() => setAddressModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h3>Add Saved Address</h3>
                <p>Save a frequent wash location for rapid booking</p>
              </div>
              <button onClick={() => setAddressModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddAddress}>
              <div className="modal-body">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Address Details:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sheikh Zayed, Beverly Hills, Villa 102"
                  value={newAddressText}
                  onChange={(e) => setNewAddressText(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn outline" onClick={() => setAddressModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary" disabled={submittingAddress}>
                  {submittingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
