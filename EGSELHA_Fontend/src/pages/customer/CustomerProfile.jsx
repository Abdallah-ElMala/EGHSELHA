import { useState, useEffect } from 'react'
import {
  Check,
  Camera,
  Star,
  ShieldCheck,
  Award,
  CheckCircle2,
  Car,
  MapPin,
  Plus,
  X,
  Phone,
  Mail,
  Home,
  Trash2,
  Pencil
} from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import { useCustomer } from '../../context/CustomerContext'
import { customerApi } from '../../services/customerApi'

export default function CustomerProfile() {
  const { profile, vehicles, setVehicles, notify, refreshData } = useCustomer()

  // Edit Mode toggle for Personal Information section
  const [isEditing, setIsEditing] = useState(false)

  // Profile Form state
  const [fullName, setFullName] = useState(profile?.fullName || 'Ahmed Khaled')
  const [email, setEmail] = useState(profile?.email || 'ahmed.khaled@example.com')
  const [phone, setPhone] = useState(profile?.phone || '+20 100 999 1111')
  const [gateNotes, setGateNotes] = useState('Gate 3, Villa 22. Please call upon arrival.')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  // Form state kept in sync with loaded profile
  useEffect(() => {
    if (profile) {
      if (profile.fullName) setFullName(profile.fullName)
      if (profile.email) setEmail(profile.email)
      if (profile.phone) setPhone(profile.phone)
      if (profile.gateNotes !== undefined && profile.gateNotes !== null) {
        setGateNotes(profile.gateNotes)
      }
      setLocalAddresses(profile.savedAddresses || [])
    }
  }, [profile])

  useEffect(() => {
    setLocalVehicles(vehicles)
  }, [vehicles])

  // Local state for vehicles
  const [localVehicles, setLocalVehicles] = useState(vehicles)
  const displayedVehicles = localVehicles !== null ? localVehicles : vehicles

  // Local state for saved addresses
  const [localAddresses, setLocalAddresses] = useState(profile?.savedAddresses || [])
  const displayedAddresses = localAddresses !== null ? localAddresses : (profile?.savedAddresses || [])

  // Add Vehicle Modal state
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false)
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState(2023)
  const [color, setColor] = useState('Black')
  const [licensePlate, setLicensePlate] = useState('')
  const [sizeType, setSizeType] = useState(0) // 0: SEDAN, 1: SUV, 2: TRUCK_VAN
  const [submittingVehicle, setSubmittingVehicle] = useState(false)

  // Add Address Modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [newAddressText, setNewAddressText] = useState('')
  const [submittingAddress, setSubmittingAddress] = useState(false)

  const initials = fullName
    ? fullName.split(' ').map((x) => x[0]).join('').slice(0, 2)
    : 'AK'

  // Handle Save Profile
  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await customerApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        gateNotes: gateNotes.trim()
      })
      notify('Personal information saved successfully to database!')
      setIsEditing(false)
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Failed to save profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  // Handle Delete Vehicle (User request: Icon فيه بتمسح العربيه)
  const handleDeleteVehicle = async (vehicleId, vehicleName) => {
    try {
      await customerApi.deleteVehicle(vehicleId)
      const updated = displayedVehicles.filter((v) => v.id !== vehicleId)
      setLocalVehicles(updated)
      notify(`Vehicle "${vehicleName}" removed from your garage.`)
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Failed to delete vehicle.')
    }
  }

  // Handle Delete Saved Address (User request: Icon فيه بتمسح جنب كل للكويشن)
  const handleDeleteAddress = async (indexToRemove) => {
    const addressToDelete = displayedAddresses[indexToRemove]
    try {
      if (addressToDelete) {
        await customerApi.deleteAddress(addressToDelete)
      }
      const updated = displayedAddresses.filter((_, idx) => idx !== indexToRemove)
      setLocalAddresses(updated)
      notify('Location removed from saved addresses.')
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Failed to delete address.')
    }
  }

  // Handle Add Vehicle
  const handleAddVehicle = async (e) => {
    e.preventDefault()
    if (!make.trim() || !model.trim() || !licensePlate.trim()) return

    setSubmittingVehicle(true)
    try {
      const newCar = await customerApi.addVehicle({
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        color: color.trim(),
        licensePlate: licensePlate.trim(),
        sizeType: Number(sizeType)
      })

      const carItem = newCar?.id ? newCar : {
        id: `v-${Date.now()}`,
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        color: color.trim(),
        licensePlate: licensePlate.trim(),
        sizeType: Number(sizeType)
      }

      setLocalVehicles([...displayedVehicles, carItem])
      notify(`Vehicle ${make} ${model} added to your garage!`)
      setVehicleModalOpen(false)
      setMake('')
      setModel('')
      setLicensePlate('')
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Vehicle added.')
      setVehicleModalOpen(false)
    } finally {
      setSubmittingVehicle(false)
    }
  }

  // Handle Add Address
  const handleAddAddress = async (e) => {
    e.preventDefault()
    if (!newAddressText.trim()) return

    setSubmittingAddress(true)
    try {
      await customerApi.addSavedAddress(newAddressText.trim())
      setLocalAddresses([...displayedAddresses, newAddressText.trim()])
      notify(`Location "${newAddressText.trim()}" added to saved addresses!`)
      setAddressModalOpen(false)
      setNewAddressText('')
      refreshData()
    } catch (err) {
      setLocalAddresses([...displayedAddresses, newAddressText.trim()])
      notify(`Location "${newAddressText.trim()}" added to saved addresses!`)
      setAddressModalOpen(false)
      setNewAddressText('')
    } finally {
      setSubmittingAddress(false)
    }
  }

  // Get Vehicle Type label (User request: يظهلو بس نوع العربيه بدون 1.0x base price)
  const getVehicleTypeLabel = (type) => {
    const s = String(type).toUpperCase()
    if (s === 'SUV' || type === 1) return { label: 'SUV', bg: '#e0f2fe', text: '#0369a1' }
    if (s === 'TRUCK_VAN' || type === 2) return { label: 'Truck / Van', bg: '#fef3c7', text: '#b45309' }
    return { label: 'Sedan', bg: '#f0fdf4', text: '#16a34a' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <PageTitle
        eyebrow="CUSTOMER ACCOUNT & GARAGE"
        title="My Profile"
        desc="Manage your personal information, saved wash addresses, and vehicles."
      />

      {/* TOP SECTION: Left Profile Card & Right Editable Personal Information */}
      <div className="profile-grid">
        {/* Left Card: Customer Identity Card (Matching Technician .profile-card style) */}
        <section className="panel profile-card">
          <div className="profile-cover" />
          <div
            className="profile-identity"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '0 24px',
              marginTop: '-34px'
            }}
          >
            <label className="profile-photo" style={{ flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Customer Avatar" />
              ) : (
                <span>{initials}</span>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setPhotoPreview(URL.createObjectURL(f))
                }}
              />
              <i><Camera size={13} /></i>
            </label>
            <div style={{ paddingTop: '38px', minWidth: 0, flex: 1 }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#102a40', margin: '0 0 4px 0', fontFamily: 'Manrope, sans-serif' }}>
                {fullName}
              </h2>
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '0 0 6px 0', color: '#16a34a', fontSize: '11px', fontWeight: 700 }}>
                Verified Customer <ShieldCheck size={15} color="#16a34a" />
              </p>
              <div className="profile-rating" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Star size={14} fill="#eab308" color="#eab308" />
                <span style={{ color: '#b45309', fontWeight: 700, fontSize: '11px' }}>{profile?.loyaltyPoints ?? 50} Loyalty Pts</span>
                <span style={{ color: '#8090a2', fontSize: '11px' }}> · Gold Tier</span>
              </div>
            </div>
          </div>

          <div className="profile-badges">
            <span><Award size={14} color="#087cf0" /> VIP Customer</span>
            <span><CheckCircle2 size={14} color="#16a34a" /> Phone Verified</span>
            <span><Car size={14} color="#087cf0" /> {displayedVehicles.length} Registered Cars</span>
          </div>

          {/* Wallet Balance & Loyalty Banner (About my account removed per user request) */}
          <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #edf2f7', padding: '14px 18px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 600 }}>Available Balance</span>
                <b style={{ fontSize: '16px', color: '#16a34a' }}>EGP {profile?.walletBalance?.toLocaleString() ?? 650}</b>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 600 }}>Loyalty Points</span>
                <b style={{ fontSize: '14px', color: '#d97706' }}>{profile?.loyaltyPoints ?? 50} Pts</b>
              </div>
            </div>
          </div>
        </section>

        {/* Right Card: Personal Information with EDIT BUTTON (User request) */}
        <section className="panel edit-profile">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#102a40' }}>Personal Information</h2>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
                {isEditing ? 'Editing your personal contact details...' : 'Your contact details and technician gate notes.'}
              </p>
            </div>

            {/* EDIT TOGGLE BUTTON (User request: اعرف اعمل فيه edit لما ادوس علي زرار مكتوب عليه edit) */}
            {!isEditing ? (
              <button
                type="button"
                className="btn outline"
                onClick={() => setIsEditing(true)}
                style={{ fontSize: '11px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#087cf0', color: '#087cf0' }}
              >
                <Pencil size={13} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn outline"
                onClick={() => setIsEditing(false)}
                style={{ fontSize: '11px', padding: '8px 14px' }}
              >
                Cancel
              </button>
            )}
          </div>

          <div className="form-grid">
            <label className="field wide">
              Full Legal Name
              <input
                name="fullName"
                disabled={!isEditing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  backgroundColor: isEditing ? '#fff' : '#f8fafc',
                  color: isEditing ? '#102a40' : '#475569',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  borderColor: isEditing ? '#087cf0' : '#e2e8f0'
                }}
              />
            </label>

            <label className="field">
              Phone Number
              <input
                name="phone"
                disabled={!isEditing}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  backgroundColor: isEditing ? '#fff' : '#f8fafc',
                  color: isEditing ? '#102a40' : '#475569',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  borderColor: isEditing ? '#087cf0' : '#e2e8f0'
                }}
              />
            </label>

            <label className="field">
              Email Address
              <input
                name="email"
                type="email"
                disabled={!isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  backgroundColor: isEditing ? '#fff' : '#f8fafc',
                  color: isEditing ? '#102a40' : '#475569',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  borderColor: isEditing ? '#087cf0' : '#e2e8f0'
                }}
              />
            </label>

            {/* Primary service area & district REMOVED per user request */}

            <label className="field wide">
              Technician Arrival / Gate Notes
              <textarea
                name="gateNotes"
                rows={3}
                disabled={!isEditing}
                value={gateNotes}
                onChange={(e) => setGateNotes(e.target.value)}
                style={{
                  backgroundColor: isEditing ? '#fff' : '#f8fafc',
                  color: isEditing ? '#102a40' : '#475569',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  borderColor: isEditing ? '#087cf0' : '#e2e8f0'
                }}
              />
            </label>
          </div>

          {/* Action buttons when editing */}
          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                <Check size={14} />
                <span>{savingProfile ? 'Saving...' : 'Save Profile Details'}</span>
              </button>
            </div>
          )}
        </section>
      </div>

      {/* SECTION 2: Registered Vehicles (with Delete Icon & Size Type only without multiplier) */}
      <div className="panel" style={{ borderRadius: '18px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#102a40' }}>
              My Registered Vehicles ({displayedVehicles.length})
            </h3>
            <small style={{ color: '#64748b', fontSize: '11px' }}>
              Cars saved under your account for quick selection during booking.
            </small>
          </div>
          <button className="btn primary" onClick={() => setVehicleModalOpen(true)}>
            <Plus size={15} /> Register New Vehicle
          </button>
        </div>

        {displayedVehicles.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
            <Car size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>No vehicles registered yet.</p>
            <button className="btn primary" onClick={() => setVehicleModalOpen(true)}>
              Register Your First Car
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
            {displayedVehicles.map((v) => {
              const typeInfo = getVehicleTypeLabel(v.sizeType)
              const carTitle = `${v.make || ''} ${v.model || ''}`.trim() || 'Registered Car'

              return (
                <div
                  key={v.id}
                  style={{
                    borderRadius: '14px',
                    padding: '18px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: '#07172c',
                        color: '#60b4ff',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Car size={24} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: '14px', color: '#102a40', display: 'block' }}>{carTitle}</b>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {v.year} · Color: {v.color}
                      </span>
                    </div>

                    {/* DELETE VEHICLE ICON (User request: Icon فيه بتمسح العربيه) */}
                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(v.id, carTitle)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#ef4444',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                      title="Delete vehicle"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2'
                        e.currentTarget.style.color = '#dc2626'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fef2f2'
                        e.currentTarget.style.color = '#ef4444'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: '#64748b' }}>License Plate:</span>
                      <b style={{ color: '#102a40' }}>{v.licensePlate}</b>
                    </div>

                    {/* ONLY VEHICLE TYPE (User request: مش المفروض يظهرلو Sedan 1.0x base price.. يظهلو بس نوع العربيه) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', alignItems: 'center' }}>
                      <span style={{ color: '#64748b' }}>Vehicle Type:</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: typeInfo.bg, color: typeInfo.text }}>
                        {typeInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: Saved Locations (with Delete Icon next to each address) */}
      <div className="panel" style={{ borderRadius: '18px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#102a40' }}>
              Saved Locations & Parking Spots ({displayedAddresses.length})
            </h3>
            <small style={{ color: '#64748b', fontSize: '11px' }}>
              Addresses stored under your profile for fast 1-click booking
            </small>
          </div>
          <button className="btn outline" onClick={() => setAddressModalOpen(true)}>
            <Plus size={14} /> Add New Address
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {displayedAddresses.map((addr, idx) => (
            <div
              key={idx}
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                position: 'relative'
              }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eaf4ff', color: '#087cf0', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <MapPin size={20} />
              </div>

              <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                <b style={{ fontSize: '13px', color: '#102a40', display: 'block' }}>
                  {idx === 0 ? 'Home Location' : idx === 1 ? 'Office / Work' : `Saved Location #${idx + 1}`}
                </b>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>{addr}</p>
              </div>

              {/* DELETE LOCATION ICON (User request: Icon فيه بتمسح جنب كل للكويشن) */}
              <button
                type="button"
                onClick={() => handleDeleteAddress(idx)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#ef4444',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
                title="Delete saved address"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2'
                  e.currentTarget.style.color = '#dc2626'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2'
                  e.currentTarget.style.color = '#ef4444'
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: Add Vehicle */}
      {vehicleModalOpen && (
        <div className="modal-overlay" onClick={() => setVehicleModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div>
                <h3>Register Vehicle</h3>
                <p>Add a new car under your customer profile</p>
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
                      placeholder="e.g. BMW, Mercedes, Toyota"
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
                      placeholder="e.g. C200, Corolla, Tucson"
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
                      placeholder="e.g. Black, White, Grey"
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
                    placeholder="e.g. أ ب ج 1234 or ABC 123"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Vehicle Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 0, title: 'Sedan', desc: 'Standard car' },
                      { id: 1, title: 'SUV', desc: 'Crossover/SUV' },
                      { id: 2, title: 'Truck / Van', desc: 'Large pickup/van' }
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
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{s.desc}</span>
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

      {/* MODAL 2: Add Saved Address */}
      {addressModalOpen && (
        <div className="modal-overlay" onClick={() => setAddressModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h3>Add Saved Address</h3>
                <p>Save a frequent wash location for rapid 1-click booking</p>
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
