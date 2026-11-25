import { useState } from 'react'
import { Car, Plus, ShieldCheck, CheckCircle2, MapPin, Trash2, Camera, X, AlertCircle } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import FieldError from '../../component/FieldError'
import LocationPicker from '../../component/LocationPicker'
import { useCustomer } from '../../context/CustomerContext'
import { customerApi } from '../../services/customerApi'
import { validateVehicle, validateSavedAddress, extractApiErrors } from '../../utils/validation'

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
  const [vehicleErrors, setVehicleErrors] = useState({})
  const [serverVehicleError, setServerVehicleError] = useState('')

  // Add Saved Address Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [newAddressText, setNewAddressText] = useState('')
  const [submittingAddress, setSubmittingAddress] = useState(false)
  const [addressError, setAddressError] = useState('')
  const [serverAddressError, setServerAddressError] = useState('')

  const handleOpenVehicleModal = () => {
    setVehicleErrors({})
    setServerVehicleError('')
    setMake('')
    setModel('')
    setYear(2023)
    setColor('Black')
    setLicensePlate('')
    setPhotoUrl('')
    setSizeType(0)
    setVehicleModalOpen(true)
  }

  const handleOpenAddressModal = () => {
    setAddressError('')
    setServerAddressError('')
    setNewAddressText('')
    setAddressModalOpen(true)
  }

  // Handle Add Vehicle (Behavior 1: addVehicle)
  const handleAddVehicle = async (e) => {
    e.preventDefault()

    // Client-side validation
    const { isValid, errors } = validateVehicle({
      make,
      model,
      year,
      color,
      licensePlate
    })

    if (!isValid) {
      setVehicleErrors(errors)
      return
    }

    setSubmittingVehicle(true)
    setVehicleErrors({})
    setServerVehicleError('')

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
      refreshData()
    } catch (err) {
      console.error('Add vehicle error:', err)
      const { message, fieldErrors } = extractApiErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        setVehicleErrors(fieldErrors)
      }
      setServerVehicleError(message)
      notify(message)
    } finally {
      setSubmittingVehicle(false)
    }
  }

  // Handle Add Address (Attribute: savedAddresses)
  const handleAddAddress = async (e) => {
    e.preventDefault()

    // Client-side validation
    const errorMsg = validateSavedAddress(newAddressText)
    if (errorMsg) {
      setAddressError(errorMsg)
      return
    }

    setSubmittingAddress(true)
    setAddressError('')
    setServerAddressError('')

    try {
      await customerApi.addSavedAddress(newAddressText.trim())
      notify(`Address "${newAddressText.trim()}" added to your saved locations!`)
      setAddressModalOpen(false)
      setNewAddressText('')
      refreshData()
    } catch (err) {
      console.error('Add address error:', err)
      const { message } = extractApiErrors(err)
      setServerAddressError(message)
      notify(message)
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

  const getSizeBadge = (sizeType) => {
    switch (sizeType) {
      case 0:
        return { label: 'Sedan (1.0× Multiplier)', color: '#087cf0', bg: '#eaf4ff' }
      case 1:
        return { label: 'SUV (1.25× Multiplier)', color: '#d97706', bg: '#fef3c7' }
      case 2:
        return { label: 'Truck / Van (1.5× Multiplier)', color: '#7c3aed', bg: '#ede9fe' }
      default:
        return { label: 'Sedan (1.0×)', color: '#087cf0', bg: '#eaf4ff' }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageTitle
        eyebrow="2. CUSTOMER / GARAGE & ADDRESSES"
        title="Vehicle Garage & Locations"
        desc="Register and manage vehicles under your customer profile. Vehicle size directly dictates wash tier multipliers (Sedan 1.0×, SUV 1.25×, Truck 1.50×)."
      />

      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
            Registered Vehicles: <span style={{ color: '#087cf0' }}>{vehicles.length}</span>
          </span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
            Saved Addresses: <span style={{ color: '#087cf0' }}>{profile?.savedAddresses?.length || 0}</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn outline" onClick={handleOpenAddressModal}>
            <MapPin size={15} /> Add Location
          </button>
          <button className="btn primary" onClick={handleOpenVehicleModal}>
            <Plus size={16} /> Register New Car
          </button>
        </div>
      </div>

      {/* SECTION 1: Registered Vehicles Grid (5. Vehicle specifications) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Car size={18} style={{ color: '#087cf0' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#102a40', margin: 0 }}>
            Registered Garage Vehicles
          </h2>
        </div>

        {vehicles.length === 0 ? (
          <div className="panel" style={{ padding: '40px', textAlign: 'center', borderRadius: '16px' }}>
            <Car size={42} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>No vehicles registered yet</h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748b' }}>
              Add your primary vehicle to enable 1-click on-demand car washes.
            </p>
            <button className="btn primary" onClick={handleOpenVehicleModal}>
              <Plus size={16} /> Register Your First Car
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
            {vehicles.map((v) => {
              const badge = getSizeBadge(v.sizeType)
              return (
                <div
                  key={v.id}
                  className="panel"
                  style={{
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    border: '1px solid #e2e8f0',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Header: Photo or Placeholder & Delete */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '12px',
                          background: '#f1f5f9',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#087cf0',
                          overflow: 'hidden'
                        }}
                      >
                        {v.photoUrl ? (
                          <img src={v.photoUrl} alt={v.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Car size={26} />
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteVehicle(v.id, `${v.make} ${v.model}`)}
                        title="Delete vehicle"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'grid',
                          placeItems: 'center',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Car Name & Year */}
                    <div style={{ marginBottom: '12px' }}>
                      <h3 style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: 800, color: '#102a40' }}>
                        {v.make} {v.model}
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#64748b' }}>
                        <span>Year: <b>{v.year}</b></span>
                        <span>•</span>
                        <span>Color: <b>{v.color}</b></span>
                      </div>
                    </div>

                    {/* License Plate Banner */}
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '14px'
                      }}
                    >
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>PLATE NUMBER</span>
                      <b style={{ fontSize: '13px', letterSpacing: '1px', color: '#1e293b' }}>
                        {v.licensePlate}
                      </b>
                    </div>
                  </div>

                  {/* Size Multiplier Badge */}
                  <div
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '7px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{badge.label}</span>
                    <ShieldCheck size={14} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Saved Locations (Attribute savedAddresses) */}
      <div className="panel" style={{ borderRadius: '16px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#102a40' }}>
              Saved Parking Addresses (savedAddresses)
            </h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
              Locations stored on your account profile for instant wash dispatch.
            </p>
          </div>
          <button className="btn outline" onClick={handleOpenAddressModal}>
            <Plus size={14} /> Add Address
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {(profile?.savedAddresses || ['Nasr City, Abbas El Akkad, Cairo', 'Heliopolis, Korba, Cairo']).map((addr, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <MapPin size={16} style={{ color: '#087cf0', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {addr}
                </span>
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
            <form onSubmit={handleAddVehicle} noValidate>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {serverVehicleError && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{serverVehicleError}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Brand / Make *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BMW, Toyota"
                      value={make}
                      onChange={(e) => {
                        setMake(e.target.value)
                        if (vehicleErrors.make) setVehicleErrors({ ...vehicleErrors, make: '' })
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: vehicleErrors.make ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                        background: vehicleErrors.make ? '#fffbfb' : '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <FieldError error={vehicleErrors.make} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Model *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 320i, Corolla"
                      value={model}
                      onChange={(e) => {
                        setModel(e.target.value)
                        if (vehicleErrors.model) setVehicleErrors({ ...vehicleErrors, model: '' })
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: vehicleErrors.model ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                        background: vehicleErrors.model ? '#fffbfb' : '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <FieldError error={vehicleErrors.model} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Year *
                    </label>
                    <input
                      type="number"
                      min={1950}
                      max={2030}
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value)
                        if (vehicleErrors.year) setVehicleErrors({ ...vehicleErrors, year: '' })
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: vehicleErrors.year ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                        background: vehicleErrors.year ? '#fffbfb' : '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <FieldError error={vehicleErrors.year} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Color *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. White, Black, Gray"
                      value={color}
                      onChange={(e) => {
                        setColor(e.target.value)
                        if (vehicleErrors.color) setVehicleErrors({ ...vehicleErrors, color: '' })
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: vehicleErrors.color ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                        background: vehicleErrors.color ? '#fffbfb' : '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <FieldError error={vehicleErrors.color} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    License Plate (Identification) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ABC 1234"
                    value={licensePlate}
                    onChange={(e) => {
                      setLicensePlate(e.target.value)
                      if (vehicleErrors.licensePlate) setVehicleErrors({ ...vehicleErrors, licensePlate: '' })
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: vehicleErrors.licensePlate ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      background: vehicleErrors.licensePlate ? '#fffbfb' : '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <FieldError error={vehicleErrors.licensePlate} />
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
            <form onSubmit={handleAddAddress} noValidate>
              <div className="modal-body">
                {serverAddressError && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{serverAddressError}</span>
                  </div>
                )}
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                  Select Location via GPS or Map (Sheikh Zayed &amp; 6th of October) *
                </label>
                <LocationPicker
                  value={newAddressText}
                  error={addressError}
                  onChange={({ address }) => {
                    setNewAddressText(address)
                    if (addressError) setAddressError('')
                  }}
                />
                <FieldError error={addressError} />
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
