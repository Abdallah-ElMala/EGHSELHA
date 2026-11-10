import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  Car,
  MapPin,
  Zap,
  Droplets,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  Plus,
  AlertCircle,
  HelpCircle,
  Tag
} from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import { useCustomer } from '../../context/CustomerContext'
import { customerApi } from '../../services/customerApi'

// 6. ServicePackage specifications from Document
const PACKAGES = [
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
    name: 'Basic Wash',
    basePrice: 200,
    durationMinutes: 30,
    desc: 'Exterior high-pressure rinse, snow foam wash, hand dry, tire shine & exterior glass clean.',
    requiresElectricity: false,
    requiresWater: false,
    requiresPrivateParking: false,
    services: ['Pressure Rinse', 'Snow Foam Bath', 'Tire Gloss', 'Exterior Glass Wipe']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    name: 'Premium Wash',
    basePrice: 350,
    durationMinutes: 60,
    desc: 'Full cabin vacuum, dashboard & console dressing, foam wash, spray wax & streak-free windows.',
    requiresElectricity: false,
    requiresWater: false,
    requiresPrivateParking: false,
    services: ['Complete Cabin Vacuum', 'Dashboard Dressing', 'Snow Foam & Hand Wash', 'Spray Wax Sealant', 'Wheel Detailing']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
    name: 'Deep Clean',
    basePrice: 500,
    durationMinutes: 90,
    desc: 'Deep upholstery steam extraction, stains removal, carpet shampooing & AC antibacterial disinfection.',
    requiresElectricity: true,
    requiresWater: false,
    requiresPrivateParking: true,
    services: ['Steam Detailing', 'Carpet & Seat Extraction', 'Leather Conditioning', 'AC Air Vent Sanitizing', 'Engine Bay Wipe']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004',
    name: 'Ultimate Detail',
    basePrice: 700,
    durationMinutes: 140,
    desc: 'Showroom treatment: clay bar paint decontamination, machine polish, 6-month ceramic sealant & full interior restoration.',
    requiresElectricity: true,
    requiresWater: true,
    requiresPrivateParking: true,
    services: ['Clay Bar Decontamination', 'Paint Machine Polish', 'Ceramic Spray Coat (6 Mo)', 'Full Engine Bay Detail', 'Headlight Restoration']
  }
]

// 7. AddOn specifications from Document
const CATALOG_ADDONS = [
  { id: '11111111-aaaa-aaaa-aaaa-aaaaaaaa0001', name: 'Engine Bay Steam Cleaning', price: 150, desc: 'Degrease and steam-clean engine compartment safely' },
  { id: '11111111-aaaa-aaaa-aaaa-aaaaaaaa0002', name: 'Ozone Odor & Bacteria Elimination', price: 120, desc: 'Medical-grade ozone treatment to destroy stubborn odors' },
  { id: '11111111-aaaa-aaaa-aaaa-aaaaaaaa0003', name: 'Leather Deep Feed & UV Shield', price: 100, desc: 'Protective hydrophobic barrier against cracking and fading' },
  { id: '11111111-aaaa-aaaa-aaaa-aaaaaaaa0004', name: 'Rain-X Hydrophobic Glass Coat', price: 80, desc: 'Repels rainwater and dirt for superior night driving clarity' }
]

export default function CustomerBookWash() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { profile, vehicles, notify, refreshData } = useCustomer()

  const urlPackage = searchParams.get('package')
  const urlVehicle = searchParams.get('vehicle')

  const [packages, setPackages] = useState(PACKAGES)
  const [addonsCatalog, setAddonsCatalog] = useState(CATALOG_ADDONS)
  const [zones, setZones] = useState([
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', zoneName: 'East Cairo - Nasr City', baseDistanceSurcharge: 20, peakSurgeMultiplier: 1.0 }
  ])
  const [selectedZoneId, setSelectedZoneId] = useState('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')

  const [selectedVehicleId, setSelectedVehicleId] = useState(urlVehicle || vehicles[0]?.id || '')
  const [selectedPackageId, setSelectedPackageId] = useState(urlPackage || PACKAGES[1].id)
  const [selectedAddonIds, setSelectedAddonIds] = useState([])

  useEffect(() => {
    customerApi.getCatalog()
      .then((cat) => {
        if (cat?.packages?.length) {
          setPackages((prev) =>
            cat.packages.map((dbPkg) => {
              const local = prev.find((p) => p.id.toLowerCase() === dbPkg.id.toLowerCase()) || prev[1]
              return {
                ...local,
                ...dbPkg,
                id: dbPkg.id.toLowerCase()
              }
            })
          )
        }
        if (Array.isArray(cat?.addOns)) {
          setAddonsCatalog(
            cat.addOns.map((a) => ({
              id: a.id.toLowerCase(),
              name: a.name,
              price: a.price,
              desc: a.description
            }))
          )
        }
        if (cat?.zones?.length) {
          const normalizedZones = cat.zones.map((z) => ({ ...z, id: z.id.toLowerCase() }))
          setZones(normalizedZones)
          setSelectedZoneId((curr) =>
            normalizedZones.some((z) => z.id === curr) ? curr : normalizedZones[0].id
          )
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    const pkg = searchParams.get('package')
    if (pkg) setSelectedPackageId(pkg)
  }, [searchParams])

  useEffect(() => {
    const veh = searchParams.get('vehicle')
    if (veh) {
      setSelectedVehicleId(veh)
    } else if (!selectedVehicleId && vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id)
    }
  }, [searchParams, vehicles])

  // Booking Type: 0: FAST_TRACK, 1: SCHEDULED, 2: SUBSCRIPTION_WEEKLY, 3: SUBSCRIPTION_MONTHLY
  const [bookingType, setBookingType] = useState(1)
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [scheduledTime, setScheduledTime] = useState('10:00 AM')

  // Parking Type: 0: PRIVATE_GARAGE, 1: DRIVEWAY, 2: STREET, 3: UNDERGROUND
  const [parkingType, setParkingType] = useState(1)

  // Utilities available at customer's parking spot
  const [hasElectricity, setHasElectricity] = useState(true)
  const [hasWater, setHasWater] = useState(true)

  // Location / Address
  const savedList = profile?.savedAddresses?.length > 0
    ? profile.savedAddresses
    : ['Nasr City, Abbas El Akkad, Cairo', 'New Cairo, 5th Settlement', 'Heliopolis, Korba, Cairo']
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(savedList[0] || 'Nasr City, Abbas El Akkad, Cairo')
  const [customAddress, setCustomAddress] = useState('')
  const [useCustomAddress, setUseCustomAddress] = useState(false)
  const [saveNewAddress, setSaveNewAddress] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0]
  const selectedPackage = packages.find((p) => p.id === selectedPackageId.toLowerCase()) || packages[1] || packages[0]
  const selectedZone = zones.find((z) => z.id === selectedZoneId.toLowerCase()) || zones[0]

  // Vehicle size multiplier: Sedan 1.0x, SUV 1.25x, Truck/Van 1.50x
  const vehicleMultiplier = useMemo(() => {
    if (!selectedVehicle) return 1.0
    const s = String(selectedVehicle.sizeType).toUpperCase()
    if (s === 'SUV' || selectedVehicle.sizeType === 1) return 1.25
    if (s === 'TRUCK_VAN' || selectedVehicle.sizeType === 2) return 1.50
    return 1.0
  }, [selectedVehicle])

  // Add-ons subtotal
  const addOnsSubtotal = useMemo(() => {
    return selectedAddonIds.reduce((sum, id) => {
      const item = addonsCatalog.find((a) => a.id === id)
      return sum + (item ? item.price : 0)
    }, 0)
  }, [selectedAddonIds, addonsCatalog])

  // Subscription discount
  const discountMultiplier = bookingType === 2 ? 0.90 : bookingType === 3 ? 0.85 : 1.0
  const distanceFee = (selectedZone?.baseDistanceSurcharge ?? 20) * (selectedZone?.peakSurgeMultiplier ?? 1.0)

  // Total price calculation matching Backend Booking.CalculateFinalPrice():
  // round(((basePackagePrice * vehicleMultiplier) + addOnsSubtotal + distanceFee) * discountMultiplier)
  const packageCost = selectedPackage.basePrice * vehicleMultiplier
  const vehicleSurcharge = Math.round((packageCost - selectedPackage.basePrice) * 100) / 100
  const subtotalBeforeDiscount = packageCost + addOnsSubtotal + distanceFee
  const totalPrice = Math.round(subtotalBeforeDiscount * discountMultiplier)
  const discountSaved = Math.round(subtotalBeforeDiscount - totalPrice)
  const depositAmount = 200
  const remainingBalance = Math.max(0, totalPrice - depositAmount)

  // Eligibility check (Behavior isEligible from ServicePackage)
  const isUtilityEligible = useMemo(() => {
    if (selectedPackage.requiresElectricity && !hasElectricity) return false
    if (selectedPackage.requiresWater && !hasWater) return false
    return true
  }, [selectedPackage, hasElectricity, hasWater])

  const toggleAddon = (id) => {
    if (selectedAddonIds.includes(id)) {
      setSelectedAddonIds(selectedAddonIds.filter((x) => x !== id))
    } else {
      setSelectedAddonIds([...selectedAddonIds, id])
    }
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    if (!selectedVehicle) {
      notify('Please register and select a vehicle first.')
      navigate('/customer/vehicles')
      return
    }

    const finalAddress = useCustomAddress ? customAddress : selectedSavedAddress
    if (!finalAddress.trim()) {
      notify('Please enter or select a valid wash address.')
      return
    }

    setSubmitting(true)
    try {
      if (useCustomAddress && saveNewAddress && customAddress.trim()) {
        await customerApi.addSavedAddress(customAddress.trim())
      }

      const payload = {
        vehicleId: selectedVehicle.id,
        servicePackageId: selectedPackage.id,
        serviceZoneId: selectedZone?.id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        address: finalAddress,
        parkingType: Number(parkingType),
        hasElectricity,
        hasWaterAccess: hasWater,
        bookingType: Number(bookingType),
        scheduledAt: bookingType === 0 ? new Date().toISOString() : `${scheduledDate}T${scheduledTime.includes('PM') ? '14:00:00' : '10:00:00'}Z`,
        parkingLatitude: 30.0561,
        parkingLongitude: 31.3414,
        addOnIds: selectedAddonIds
      }

      const booking = await customerApi.createBooking(payload)
      notify(`Booking ${booking.bookingNumber} created! Pay the 200 EGP deposit to dispatch a technician.`)
      await refreshData()
      navigate(`/customer/bookings?payBookingId=${encodeURIComponent(booking.id)}`)
    } catch (err) {
      console.error(err)
      notify('Failed to create booking.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageTitle
        eyebrow="3. CUSTOMER / ON-DEMAND & SCHEDULED"
        title="Book a Mobile Car Wash"
        desc="Select your vehicle, wash tier, and on-site utilities. Mandatory 200 EGP upfront deposit locks in your certified technician."
      />

      <form onSubmit={handleCreateBooking}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: '24px', alignItems: 'start' }}>
          {/* LEFT FORM COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 1. Vehicle Selection */}
            <div className="panel" style={{ borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#102a40' }}>
                  1. Select Registered Vehicle
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/customer/vehicles')}
                  style={{ background: 'none', border: 'none', color: '#087cf0', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Add New Vehicle
                </button>
              </div>

              {vehicles.length === 0 ? (
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                  <Car size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#64748b' }}>No vehicles registered under your account yet.</p>
                  <button type="button" className="btn primary" onClick={() => navigate('/customer/vehicles')}>
                    Register Vehicle Now
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
                  {vehicles.map((v) => {
                    const isSelected = (selectedVehicle?.id === v.id)
                    const s = String(v.sizeType).toUpperCase()
                    const multText = (s === 'SUV' || v.sizeType === 1) ? '1.25×' : (s === 'TRUCK_VAN' || v.sizeType === 2) ? '1.50×' : '1.0×'

                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicleId(v.id)}
                        style={{
                          border: `2px solid ${isSelected ? '#087cf0' : '#e2e8f0'}`,
                          borderRadius: '12px',
                          padding: '14px',
                          cursor: 'pointer',
                          background: isSelected ? '#f0f7ff' : '#fff',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                      >
                        {isSelected && (
                          <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#087cf0' }}>
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                        <b style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>{v.make} {v.model}</b>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                          Plate: {v.licensePlate} · {v.color}
                        </span>
                        <div style={{ marginTop: '8px', display: 'inline-block', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1' }}>
                          {v.sizeType === 1 || s === 'SUV' ? 'SUV' : v.sizeType === 2 || s === 'TRUCK_VAN' ? 'Truck/Van' : 'Sedan'} ({multText})
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 2. Wash Package Selection */}
            <div className="panel" style={{ borderRadius: '16px', padding: '22px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#102a40' }}>
                2. Choose Wash Package
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' }}>
                {packages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id
                  const calculatedTierPrice = Math.round(pkg.basePrice * vehicleMultiplier)

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      style={{
                        border: `2px solid ${isSelected ? '#087cf0' : '#e2e8f0'}`,
                        borderRadius: '14px',
                        padding: '16px',
                        cursor: 'pointer',
                        background: isSelected ? '#fbfdff' : '#fff',
                        boxShadow: isSelected ? '0 4px 16px rgba(8, 124, 240, 0.12)' : 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <b style={{ fontSize: '14px', color: '#102a40' }}>{pkg.name}</b>
                          {isSelected && <CheckCircle2 size={16} color="#087cf0" />}
                        </div>
                        <div style={{ margin: '6px 0 10px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 800, color: '#087cf0' }}>EGP {calculatedTierPrice}</span>
                          <span style={{ fontSize: '10px', color: '#8493a2', marginLeft: '6px' }}>({pkg.durationMinutes} mins)</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4, margin: '0 0 12px 0' }}>{pkg.desc}</p>
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '10px', color: '#475569' }}>
                          {pkg.services.slice(0, 3).map((s, idx) => (
                            <li key={idx} style={{ marginBottom: '3px' }}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 3. Add-Ons Selection (7. AddOn & 8. BookingAddOn) */}
            <div className="panel" style={{ borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Tag size={16} color="#087cf0" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#102a40' }}>
                  3. Optional Extra Add-Ons
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
                {addonsCatalog.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id)
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      style={{
                        border: `1.5px solid ${isChecked ? '#087cf0' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        padding: '12px 14px',
                        background: isChecked ? '#f0f7ff' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        style={{ marginTop: '3px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <b style={{ fontSize: '11px', color: '#1e293b' }}>{addon.name}</b>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#087cf0' }}>+EGP {addon.price}</span>
                        </div>
                        <small style={{ fontSize: '9px', color: '#64748b', display: 'block', marginTop: '3px' }}>{addon.desc}</small>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 4. Booking Type & Schedule */}
            <div className="panel" style={{ borderRadius: '16px', padding: '22px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#102a40' }}>
                4. Scheduling & Booking Type
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {[
                  { type: 0, title: '⚡ Fast Track', desc: 'Wash Now (within 5 km)' },
                  { type: 1, title: '📅 Scheduled', desc: 'Pick Date & Slot' },
                  { type: 2, title: '🔄 Weekly (10% Off)', desc: 'Recurring weekly' },
                  { type: 3, title: '👑 Monthly (15% Off)', desc: 'Recurring monthly' }
                ].map((item) => (
                  <div
                    key={item.type}
                    onClick={() => setBookingType(item.type)}
                    style={{
                      border: `1.5px solid ${bookingType === item.type ? '#087cf0' : '#e2e8f0'}`,
                      borderRadius: '10px',
                      padding: '12px 10px',
                      textAlign: 'center',
                      background: bookingType === item.type ? '#f0f7ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <b style={{ display: 'block', fontSize: '11px', color: bookingType === item.type ? '#087cf0' : '#334155' }}>
                      {item.title}
                    </b>
                    <small style={{ fontSize: '9px', color: '#64748b', display: 'block', marginTop: '3px' }}>{item.desc}</small>
                  </div>
                ))}
              </div>

              {bookingType !== 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Service Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Preferred Time Slot
                    </label>
                    <select
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                      <option value="11:30 AM">11:30 AM - 01:30 PM</option>
                      <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:30 PM">04:30 PM - 06:30 PM</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Location & On-Site Utilities */}
            <div className="panel" style={{ borderRadius: '16px', padding: '22px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 800, color: '#102a40' }}>
                5. Location & Site Utilities
              </h3>

              {/* Address selector / saved addresses */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Wash Location / Address
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    className={`btn ${!useCustomAddress ? 'primary' : 'outline'}`}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                    onClick={() => setUseCustomAddress(false)}
                  >
                    Saved Addresses ({savedList.length})
                  </button>
                  <button
                    type="button"
                    className={`btn ${useCustomAddress ? 'primary' : 'outline'}`}
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                    onClick={() => setUseCustomAddress(true)}
                  >
                    + Enter New Address
                  </button>
                </div>

                {!useCustomAddress ? (
                  <select
                    value={selectedSavedAddress}
                    onChange={(e) => setSelectedSavedAddress(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  >
                    {savedList.map((addr, idx) => (
                      <option key={idx} value={addr}>{addr}</option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. Villa 42, District 1, New Cairo"
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '6px' }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                      <input
                        type="checkbox"
                        checked={saveNewAddress}
                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                      />
                      Save to my addresses for future 1-click bookings
                    </label>
                  </div>
                )}
              </div>

              {/* Service Zone Selector */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Service Coverage Zone
                </label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.zoneName} (Distance: +EGP {z.baseDistanceSurcharge}{z.peakSurgeMultiplier > 1 ? ` · Peak ${z.peakSurgeMultiplier}×` : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Parking Type (3. ParkingType Enum) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Parking Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: 0, label: 'Private Garage' },
                    { id: 1, label: 'Driveway / Villa' },
                    { id: 2, label: 'Public Street' },
                    { id: 3, label: 'Underground' }
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setParkingType(p.id)}
                      style={{
                        border: `1.5px solid ${parkingType === p.id ? '#087cf0' : '#e2e8f0'}`,
                        borderRadius: '8px',
                        padding: '10px 8px',
                        textAlign: 'center',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: parkingType === p.id ? '#f0f7ff' : '#fff',
                        color: parkingType === p.id ? '#087cf0' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {p.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Utilities Check (isEligible requirement) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: hasElectricity ? '#f0fdf4' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasElectricity}
                    onChange={(e) => setHasElectricity(e.target.checked)}
                  />
                  <div>
                    <b style={{ fontSize: '11px', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={13} /> Electricity Outlet
                    </b>
                    <small style={{ fontSize: '9px', color: '#65a30d' }}>Within 25 meters</small>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: hasWater ? '#f0fdf4' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hasWater}
                    onChange={(e) => setHasWater(e.target.checked)}
                  />
                  <div>
                    <b style={{ fontSize: '11px', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Droplets size={13} /> Water Tap Source
                    </b>
                    <small style={{ fontSize: '9px', color: '#65a30d' }}>Tap connection available</small>
                  </div>
                </label>
              </div>

              {!isUtilityEligible && (
                <div style={{ marginTop: '12px', padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} color="#d97706" />
                  <small style={{ fontSize: '11px', color: '#92400e' }}>
                    Note: {selectedPackage.name} requires on-site utilities. A high-spec van with mobile generator & water tank will be dispatched.
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SUMMARY & CHECKOUT COLUMN */}
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: '#fff',
                borderRadius: '18px',
                padding: '24px',
                border: '1px solid #edf2f7',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
              }}
            >
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#102a40' }}>
                Booking Summary
              </h3>

              {/* Breakdown Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Package ({selectedPackage.name})</span>
                  <b style={{ color: '#1e293b' }}>EGP {selectedPackage.basePrice}</b>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Vehicle Multiplier ({vehicleMultiplier}×)</span>
                  <b style={{ color: '#1e293b' }}>+EGP {vehicleSurcharge}</b>
                </div>

                {addOnsSubtotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Add-Ons ({selectedAddonIds.length})</span>
                    <b style={{ color: '#087cf0' }}>+EGP {addOnsSubtotal}</b>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Zone Distance Fee</span>
                  <b style={{ color: '#1e293b' }}>+EGP {distanceFee}</b>
                </div>

                {discountMultiplier < 1.0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>Plan Discount (-{Math.round((1 - discountMultiplier) * 100)}%)</span>
                    <b style={{ color: '#16a34a' }}>-EGP {discountSaved}</b>
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div style={{ padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Total Price</span>
                  <strong style={{ fontSize: '24px', fontWeight: 800, color: '#102a40' }}>EGP {totalPrice}</strong>
                </div>

                {/* Upfront Deposit Highlight (Behavior payDeposit from Document) */}
                <div style={{ background: '#f0f7ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#0369a1', fontWeight: 700 }}>Upfront Deposit:</span>
                    <b style={{ color: '#0284c7' }}>EGP {depositAmount}.00</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                    <span>Remaining on Completion:</span>
                    <span>EGP {remainingBalance}.00</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || vehicles.length === 0}
                style={{
                  width: '100%',
                  marginTop: '18px',
                  background: '#087cf0',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(8, 124, 240, 0.35)',
                  transition: 'background 0.2s'
                }}
              >
                <span>{submitting ? 'Creating Booking...' : 'Proceed to Pay 200 EGP Deposit'}</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <ShieldCheck size={14} color="#16a34a" />
                <small style={{ fontSize: '10px', color: '#64748b' }}>100% Satisfaction Guarantee · Verified Techs</small>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
