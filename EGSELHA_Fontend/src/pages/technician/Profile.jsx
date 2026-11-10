import { useEffect, useState } from 'react'
import {
  Check,
  Camera,
  Star,
  ShieldCheck,
  Award,
  CheckCircle2,
  BriefcaseBusiness,
  Pencil,
  X,
  Wrench,
  CarFront,
  Plus,
  Trash2
} from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import { useTech } from '../../context/TechnicianContext'

function calculateAge(dobStr) {
  if (!dobStr) return null
  const dob = new Date(dobStr)
  if (Number.isNaN(dob.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

const VEHICLE_TYPES = [
  'Service Van',
  'Pickup Truck',
  'Sedan',
  'SUV',
  'Mobile Detailing Trailer'
]

export default function Profile() {
  const { profile, setProfile, photoPreview, setPhotoPreview, updateProfile } = useTech()

  const [editingAbout, setEditingAbout] = useState(false)
  const [aboutDraft, setAboutDraft] = useState('')
  const [savingAbout, setSavingAbout] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    area: '',
    dateOfBirth: '1995-01-01'
  })

  // Equipment & Tools state
  const [editingTools, setEditingTools] = useState(false)
  const [toolsDraft, setToolsDraft] = useState([])
  const [newToolInput, setNewToolInput] = useState('')
  const [savingTools, setSavingTools] = useState(false)

  // Service Vehicle state
  const [editingVehicle, setEditingVehicle] = useState(false)
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [vehicleDraft, setVehicleDraft] = useState({
    vehicleType: 'Service Van',
    vehicleName: '',
    vehiclePlate: ''
  })

  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        area: profile.area || '',
        dateOfBirth: profile.dateOfBirth || '1995-01-01'
      })
    }
  }, [profile, isEditing])

  useEffect(() => {
    if (profile && !editingTools) {
      setToolsDraft(Array.isArray(profile.equipment) ? profile.equipment : [])
    }
  }, [profile, editingTools])

  useEffect(() => {
    if (profile && !editingVehicle) {
      setVehicleDraft({
        vehicleType: profile.vehicleType || 'Service Van',
        vehicleName: profile.vehicleName || '',
        vehiclePlate: profile.vehiclePlate || ''
      })
    }
  }, [profile, editingVehicle])

  const change = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const changeVehicle = (e) => setVehicleDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const initials = profile?.name
    ? profile.name.split(' ').map((x) => x[0]).join('').slice(0, 2)
    : ''

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const updated = {
        ...profile,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        area: formData.area.trim(),
        dateOfBirth: formData.dateOfBirth
      }
      setProfile(updated)
      await updateProfile(updated)
      setIsEditing(false)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        area: profile.area || '',
        dateOfBirth: profile.dateOfBirth || '1995-01-01'
      })
    }
    setIsEditing(false)
  }

  const startEditAbout = () => {
    setAboutDraft(profile?.bio || '')
    setEditingAbout(true)
  }

  const handleSaveAbout = async () => {
    const trimmed = aboutDraft.trim()
    const updated = { ...profile, bio: trimmed }
    setSavingAbout(true)
    try {
      setProfile(updated)
      await updateProfile(updated)
      setEditingAbout(false)
    } finally {
      setSavingAbout(false)
    }
  }

  const handleAddTool = () => {
    const trimmed = newToolInput.trim()
    if (!trimmed) return
    if (toolsDraft.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setNewToolInput('')
      return
    }
    setToolsDraft((prev) => [...prev, trimmed])
    setNewToolInput('')
  }

  const handleUpdateToolItem = (idx, value) => {
    setToolsDraft((prev) => prev.map((item, i) => (i === idx ? value : item)))
  }

  const handleRemoveToolItem = (idx) => {
    setToolsDraft((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSaveTools = async () => {
    const cleaned = toolsDraft.map((t) => t.trim()).filter(Boolean)
    const updated = { ...profile, equipment: cleaned }
    setSavingTools(true)
    try {
      setProfile(updated)
      await updateProfile(updated)
      setEditingTools(false)
      setNewToolInput('')
    } finally {
      setSavingTools(false)
    }
  }

  const handleCancelTools = () => {
    setToolsDraft(Array.isArray(profile?.equipment) ? profile.equipment : [])
    setNewToolInput('')
    setEditingTools(false)
  }

  const handleSaveVehicle = async () => {
    const updated = {
      ...profile,
      vehicleType: vehicleDraft.vehicleType.trim(),
      vehicleName: vehicleDraft.vehicleName.trim(),
      vehiclePlate: vehicleDraft.vehiclePlate.trim()
    }
    setSavingVehicle(true)
    try {
      setProfile(updated)
      await updateProfile(updated)
      setEditingVehicle(false)
    } finally {
      setSavingVehicle(false)
    }
  }

  const handleCancelVehicle = () => {
    if (profile) {
      setVehicleDraft({
        vehicleType: profile.vehicleType || 'Service Van',
        vehicleName: profile.vehicleName || '',
        vehiclePlate: profile.vehiclePlate || ''
      })
    }
    setEditingVehicle(false)
  }

  if (!profile) return <div className="empty-state"><p>Loading profile…</p></div>

  const reviewCount = profile.reviewCount ?? 0
  const jobsDone = profile.jobsDone ?? 0
  const ratingDisplay = reviewCount > 0 ? Number(profile.rating || 0).toFixed(1) : '0.0'
  const isTopRated = reviewCount > 0 && Number(profile.rating || 0) >= 4.5
  const age = calculateAge(isEditing ? formData.dateOfBirth : (profile.dateOfBirth || formData.dateOfBirth))
  const equipment = Array.isArray(profile.equipment) ? profile.equipment : []

  const getFieldStyle = (active) => ({
    backgroundColor: active ? '#fff' : '#f8fafc',
    color: active ? '#102a40' : '#475569',
    cursor: active ? 'text' : 'not-allowed',
    borderColor: active ? '#087cf0' : '#e2e8f0'
  })

  return (
    <>
      <PageTitle
        eyebrow="ACCOUNT / PERSONAL DETAILS"
        title="My Profile"
        desc="Manage your personal information, tools, and service vehicle."
      />

      <div className="profile-grid">
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
              {photoPreview ? <img src={photoPreview} alt="" /> : <span>{initials}</span>}
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
                {profile.name}
              </h2>
              <p>Verified Technician <ShieldCheck size={15} /></p>
              <div className="profile-rating">
                <Star size={14} fill="currentColor" /> {ratingDisplay}{' '}
                <span>· {reviewCount} {reviewCount === 1 ? 'customer review' : 'customer reviews'}</span>
              </div>
            </div>
          </div>

          <div className="profile-badges">
            <span><Award /> {isTopRated ? 'Top Rated' : 'Verified Pro'}</span>
            <span><CheckCircle2 /> Identity verified</span>
            <span><BriefcaseBusiness /> {jobsDone} {jobsDone === 1 ? 'job done' : 'jobs done'}</span>
          </div>

          <div className="profile-about">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ margin: 0 }}>About me</h3>
              {!editingAbout && (
                <button
                  type="button"
                  onClick={startEditAbout}
                  title="Edit About me"
                  aria-label="Edit About me"
                  style={{
                    border: '1px solid #dce6ef',
                    background: '#f8fafc',
                    color: '#087cf0',
                    borderRadius: '8px',
                    width: '30px',
                    height: '30px',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>

            {editingAbout ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                  rows={3}
                  value={aboutDraft}
                  onChange={(e) => setAboutDraft(e.target.value)}
                  placeholder="Write a short bio about your experience..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #bfd7ef',
                    fontSize: '12px',
                    color: '#29445b',
                    background: '#fbfdff',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn outline"
                    onClick={() => setEditingAbout(false)}
                    disabled={savingAbout}
                    style={{ padding: '7px 12px' }}
                  >
                    <X size={13} /> Cancel
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={handleSaveAbout}
                    disabled={savingAbout}
                    style={{ padding: '7px 14px' }}
                  >
                    <Check size={13} /> {savingAbout ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <p>{profile.bio || 'No bio added yet.'}</p>
            )}
          </div>
        </section>

        <section className="panel edit-profile">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#102a40' }}>Personal information</h2>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b' }}>
                {isEditing ? 'Editing your personal contact details...' : 'Keep your details up to date.'}
              </p>
            </div>

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
                onClick={handleCancelEdit}
                style={{ fontSize: '11px', padding: '8px 14px' }}
              >
                Cancel
              </button>
            )}
          </div>

          <div className="form-grid">
            <label className="field wide">
              Full name
              <input
                name="name"
                disabled={!isEditing}
                value={formData.name}
                onChange={change}
                style={getFieldStyle(isEditing)}
              />
            </label>

            <label className="field">
              Email address
              <input
                name="email"
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={change}
                style={getFieldStyle(isEditing)}
              />
            </label>

            <label className="field">
              Phone number
              <input
                name="phone"
                disabled={!isEditing}
                value={formData.phone}
                onChange={change}
                style={getFieldStyle(isEditing)}
              />
            </label>

            <label className="field wide">
              Service area
              <input
                name="area"
                disabled={!isEditing}
                value={formData.area}
                onChange={change}
                style={getFieldStyle(isEditing)}
              />
            </label>

            <label className="field wide">
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>Date of birth</span>
                {age !== null && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#0369a1',
                      background: '#e0f2fe',
                      padding: '2px 10px',
                      borderRadius: '999px'
                    }}
                  >
                    {age} years old
                  </span>
                )}
              </span>
              <input
                name="dateOfBirth"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                disabled={!isEditing}
                value={formData.dateOfBirth}
                onChange={change}
                style={getFieldStyle(isEditing)}
              />
            </label>
          </div>

          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn outline"
                onClick={handleCancelEdit}
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

      {/* Equipment & Tools + Service Vehicle Cards */}
      <div className="profile-grid" style={{ marginTop: '18px' }}>
        {/* Equipment & Tools Card */}
        <section className="panel edit-profile">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eaf4ff', color: '#087cf0', display: 'grid', placeItems: 'center' }}>
                <Wrench size={18} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#102a40' }}>Equipment &amp; Tools</h2>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748b' }}>
                  {editingTools ? 'Edit, remove, or add tools to your kit.' : `${equipment.length} tools in your mobile wash kit`}
                </p>
              </div>
            </div>

            {!editingTools ? (
              <button
                type="button"
                className="btn outline"
                onClick={() => {
                  setToolsDraft(equipment)
                  setEditingTools(true)
                }}
                style={{ fontSize: '11px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#087cf0', color: '#087cf0' }}
              >
                <Pencil size={13} />
                <span>Edit Tools</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn outline"
                onClick={handleCancelTools}
                style={{ fontSize: '11px', padding: '8px 14px' }}
              >
                Cancel
              </button>
            )}
          </div>

          {!editingTools ? (
            equipment.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {equipment.map((tool, idx) => (
                  <div
                    key={`${tool}-${idx}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 14px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#1e293b'
                    }}
                  >
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                No tools listed yet. Click "Edit Tools" to add your equipment.
              </p>
            )
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {toolsDraft.map((tool, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    value={tool}
                    onChange={(e) => handleUpdateToolItem(idx, e.target.value)}
                    placeholder="Tool name"
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      color: '#102a40',
                      background: '#fff'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveToolItem(idx)}
                    title="Remove tool"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '9px',
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#dc2626',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="text"
                  value={newToolInput}
                  onChange={(e) => setNewToolInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTool()
                    }
                  }}
                  placeholder="Add new tool (e.g. Steam Cleaner, Foam Cannon)"
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1px dashed #93c5fd',
                    fontSize: '12px',
                    color: '#102a40',
                    background: '#f8fbff'
                  }}
                />
                <button
                  type="button"
                  className="btn outline"
                  onClick={handleAddTool}
                  style={{ borderColor: '#087cf0', color: '#087cf0', padding: '9px 14px' }}
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn outline" onClick={handleCancelTools}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={handleSaveTools}
                  disabled={savingTools}
                >
                  <Check size={14} />
                  <span>{savingTools ? 'Saving...' : 'Save Tools'}</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Service Vehicle Details Card */}
        <section className="panel edit-profile">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                <CarFront size={18} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#102a40' }}>Service Vehicle</h2>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#64748b' }}>
                  {editingVehicle ? 'Update your vehicle type, model, and plate number.' : 'Your registered mobile service vehicle.'}
                </p>
              </div>
            </div>

            {!editingVehicle ? (
              <button
                type="button"
                className="btn outline"
                onClick={() => setEditingVehicle(true)}
                style={{ fontSize: '11px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#087cf0', color: '#087cf0' }}
              >
                <Pencil size={13} />
                <span>Edit Vehicle</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn outline"
                onClick={handleCancelVehicle}
                style={{ fontSize: '11px', padding: '8px 14px' }}
              >
                Cancel
              </button>
            )}
          </div>

          <div className="form-grid">
            <label className="field wide">
              Vehicle type
              {editingVehicle ? (
                <select
                  name="vehicleType"
                  value={vehicleDraft.vehicleType}
                  onChange={changeVehicle}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #087cf0',
                    fontSize: '12px',
                    color: '#102a40',
                    background: '#fff'
                  }}
                >
                  {VEHICLE_TYPES.map((vt) => (
                    <option key={vt} value={vt}>{vt}</option>
                  ))}
                  {!VEHICLE_TYPES.includes(vehicleDraft.vehicleType) && vehicleDraft.vehicleType && (
                    <option value={vehicleDraft.vehicleType}>{vehicleDraft.vehicleType}</option>
                  )}
                </select>
              ) : (
                <input
                  disabled
                  value={vehicleDraft.vehicleType || 'Not specified'}
                  style={getFieldStyle(false)}
                />
              )}
            </label>

            <label className="field">
              Vehicle name / model
              <input
                name="vehicleName"
                disabled={!editingVehicle}
                value={vehicleDraft.vehicleName}
                onChange={changeVehicle}
                placeholder="e.g. Suzuki Carry 2022"
                style={getFieldStyle(editingVehicle)}
              />
            </label>

            <label className="field">
              Plate number
              <input
                name="vehiclePlate"
                disabled={!editingVehicle}
                value={vehicleDraft.vehiclePlate}
                onChange={changeVehicle}
                placeholder="e.g. س ص ع 4821"
                style={getFieldStyle(editingVehicle)}
              />
            </label>
          </div>

          {editingVehicle && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button type="button" className="btn outline" onClick={handleCancelVehicle}>
                Cancel
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={handleSaveVehicle}
                disabled={savingVehicle}
              >
                <Check size={14} />
                <span>{savingVehicle ? 'Saving...' : 'Save Vehicle'}</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
