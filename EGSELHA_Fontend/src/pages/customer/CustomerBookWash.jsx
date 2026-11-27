import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Car,
  Zap,
  Droplets,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Plus,
  AlertCircle
} from 'lucide-react'
import FieldError from '../../component/FieldError'
import LocationPicker from '../../component/LocationPicker'
import { useCustomer } from '../../context/CustomerContext'
import { customerApi } from '../../services/customerApi'
import { validateBooking, extractApiErrors } from '../../utils/validation'

const PACKAGES = [
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003',
    name: 'Basic Wash',
    basePrice: 200,
    durationMinutes: 30,
    desc: 'Exterior pressure rinse, snow foam bath, satin tire dressing & glass.',
    requiresElectricity: false,
    requiresWater: false,
    requiresPrivateParking: false,
    services: ['Pressure Rinse', 'Snow Foam Bath', 'Tire Gloss', 'Exterior Glass']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001',
    name: 'Premium Wash',
    basePrice: 350,
    durationMinutes: 60,
    desc: 'Full cabin vacuum, dashboard conditioning, snow foam & spray wax.',
    requiresElectricity: false,
    requiresWater: false,
    requiresPrivateParking: false,
    services: ['Cabin Vacuum', 'Dashboard Care', 'Hand Snow Foam', 'Spray Wax']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002',
    name: 'Deep Clean',
    basePrice: 500,
    durationMinutes: 90,
    desc: 'Hot steam upholstery extraction, carpet shampoo & AC sanitation.',
    requiresElectricity: true,
    requiresWater: false,
    requiresPrivateParking: true,
    services: ['Steam Extraction', 'Carpet Shampoo', 'Leather Care', 'AC Sanitation']
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004',
    name: 'Ultimate Detail',
    basePrice: 700,
    durationMinutes: 140,
    desc: 'Clay bar decontamination, machine gloss polish & 6-month ceramic.',
    requiresElectricity: true,
    requiresWater: true,
    requiresPrivateParking: true,
    services: ['Clay Bar Prep', 'Machine Polish', '6-Mo Ceramic', 'Interior Restore']
  }
]

const CATALOG_ADDONS = [
  { id: '11111111-aaaa-aaaa-aaaa-aaaaaaaa0001', name: 'Engine Bay Steam Cleaning', price: 150, desc: 'Degrease and steam-clean engine compartment safely' },
  { id: '11111111-aaaa-aaaa-aaaa-aaaaaaaa0002', name: 'Ozone Odor & Bacteria Elimination', price: 120, desc: 'Medical-grade ozone treatment for stubborn odors' },
  { id: '11111111-aaaa-aaaa-aaaa-aaaaaaaa0003', name: 'Leather Deep Feed & UV Shield', price: 100, desc: 'Matte protective barrier against cracking & UV' },
  { id: '11111111-aaaa-aaaa-aaaa-aaaaaaaa0004', name: 'Rain-X Hydrophobic Glass Coat', price: 80, desc: 'Repels rain and dust for clearer night visibility' }
]

const WIZARD_STEPS = [
  { id: 1, num: '01', label: 'Vehicle & Treatment' },
  { id: 2, num: '02', label: 'Add-Ons' },
  { id: 3, num: '03', label: 'Schedule' },
  { id: 4, num: '04', label: 'Location & Access' }
]

const inputBaseStyle = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: '10px',
  border: '1px solid var(--hairline-light-strong)',
  background: '#ffffff',
  color: 'var(--ink-primary)',
  fontSize: '13px',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  boxSizing: 'border-box'
}

export default function CustomerBookWash() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { profile, vehicles, notify, refreshData } = useCustomer()

  const urlPackage = searchParams.get('package')
  const urlVehicle = searchParams.get('vehicle')

  const [activeStep, setActiveStep] = useState(1)
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(2)
  const [locationConfirmed, setLocationConfirmed] = useState(false)
  const stepRefs = useRef({})
  const [pillStyle, setPillStyle] = useState({ left: 4, width: 0, ready: false })
  const [packages, setPackages] = useState(PACKAGES)
  const [addonsCatalog, setAddonsCatalog] = useState(CATALOG_ADDONS)
  const [zones, setZones] = useState([
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', zoneName: 'Sheikh Zayed - Central (Arkan / Districts 1-16)', baseDistanceSurcharge: 15, peakSurgeMultiplier: 1.0 },
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002', zoneName: 'Sheikh Zayed - Beverly Hills & New Zayed', baseDistanceSurcharge: 20, peakSurgeMultiplier: 1.0 },
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003', zoneName: '6th of October - El Hosary & Districts 1-12', baseDistanceSurcharge: 15, peakSurgeMultiplier: 1.0 },
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004', zoneName: '6th of October - Mall of Arabia & Palm Hills', baseDistanceSurcharge: 20, peakSurgeMultiplier: 1.0 },
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005', zoneName: '6th of October - Mall of Egypt & Dreamland', baseDistanceSurcharge: 25, peakSurgeMultiplier: 1.0 },
    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', zoneName: 'East Cairo - Nasr City', baseDistanceSurcharge: 20, peakSurgeMultiplier: 1.0 }
  ])
  const [selectedZoneId, setSelectedZoneId] = useState('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001')

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
              return { ...local, ...dbPkg, id: dbPkg.id.toLowerCase() }
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
          const normalizedZones = cat.zones
            .map((z) => ({ ...z, id: z.id.toLowerCase() }))
            .sort((a, b) => {
              const aWest = /zayed|october/i.test(a.zoneName) ? 0 : 1
              const bWest = /zayed|october/i.test(b.zoneName) ? 0 : 1
              return aWest - bWest || a.zoneName.localeCompare(b.zoneName)
            })
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

  const [bookingType, setBookingType] = useState(1)
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [scheduledTime, setScheduledTime] = useState('10:00 AM')
  const [parkingType, setParkingType] = useState(1)
  const [hasElectricity, setHasElectricity] = useState(true)
  const [hasWater, setHasWater] = useState(true)

  const savedList = profile?.savedAddresses || []
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(savedList[0] || '')
  const [customAddress, setCustomAddress] = useState('')
  const [pickedCoords, setPickedCoords] = useState({ lat: 30.0226, lng: 31.0031 })
  const [useCustomAddress, setUseCustomAddress] = useState(savedList.length === 0)
  const [saveNewAddress, setSaveNewAddress] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [bookingErrors, setBookingErrors] = useState({})
  const [serverBookingError, setServerBookingError] = useState('')

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0]
  const selectedPackage = packages.find((p) => p.id === selectedPackageId.toLowerCase()) || packages[1] || packages[0]
  const selectedZone = zones.find((z) => z.id === selectedZoneId.toLowerCase()) || zones[0]

  // Unlock next step smoothly as the user progresses
  const step1Valid = Boolean(selectedVehicle && selectedPackage)
  const effectiveMaxStep = !step1Valid ? 1 : maxUnlockedStep

  const goToStep = (targetStep) => {
    if (targetStep > effectiveMaxStep) return
    setActiveStep(targetStep)
    if (targetStep >= maxUnlockedStep && targetStep < 4) {
      setMaxUnlockedStep(targetStep + 1)
    }
  }

  // Keep the sliding pill synced to the active step button's exact offset & width
  useEffect(() => {
    const updatePill = () => {
      const el = stepRefs.current[activeStep]
      if (el) {
        setPillStyle({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
      }
    }
    updatePill()
    window.addEventListener('resize', updatePill)
    return () => window.removeEventListener('resize', updatePill)
  }, [activeStep])

  const vehicleMultiplier = useMemo(() => {
    if (!selectedVehicle) return 1.0
    const s = String(selectedVehicle.sizeType).toUpperCase()
    if (s === 'SUV' || selectedVehicle.sizeType === 1) return 1.25
    if (s === 'TRUCK_VAN' || selectedVehicle.sizeType === 2) return 1.50
    return 1.0
  }, [selectedVehicle])

  const addOnsSubtotal = useMemo(() => {
    return selectedAddonIds.reduce((sum, id) => {
      const item = addonsCatalog.find((a) => a.id === id)
      return sum + (item ? item.price : 0)
    }, 0)
  }, [selectedAddonIds, addonsCatalog])

  const discountMultiplier = bookingType === 2 ? 0.90 : bookingType === 3 ? 0.85 : 1.0
  const distanceFee = (selectedZone?.baseDistanceSurcharge ?? 20) * (selectedZone?.peakSurgeMultiplier ?? 1.0)
  const packageCost = selectedPackage.basePrice * vehicleMultiplier
  const vehicleSurcharge = Math.round((packageCost - selectedPackage.basePrice) * 100) / 100
  const subtotalBeforeDiscount = packageCost + addOnsSubtotal + distanceFee
  const totalPrice = Math.round(subtotalBeforeDiscount * discountMultiplier)
  const discountSaved = Math.round(subtotalBeforeDiscount - totalPrice)
  const depositAmount = 200
  const remainingBalance = Math.max(0, totalPrice - depositAmount)

  const isUtilityEligible = useMemo(() => {
    if (selectedPackage.requiresElectricity && !hasElectricity) return false
    if (selectedPackage.requiresWater && !hasWater) return false
    return true
  }, [selectedPackage, hasElectricity, hasWater])

  const toggleAddon = (id) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()
    setServerBookingError('')

    const finalAddress = useCustomAddress ? customAddress : selectedSavedAddress

    const { isValid, errors } = validateBooking({
      selectedVehicle,
      selectedPackage,
      address: finalAddress,
      bookingType,
      scheduledDate,
      scheduledTime,
      hasElectricity,
      hasWater,
      parkingType
    })

    if (!isValid) {
      setBookingErrors(errors)
      if (errors.address || errors.utilities) setActiveStep(4)
      else if (errors.schedule) setActiveStep(3)
      else if (errors.vehicle) setActiveStep(1)
      notify(Object.values(errors)[0])
      return
    }

    setBookingErrors({})
    setSubmitting(true)

    try {
      if (useCustomAddress && saveNewAddress && customAddress.trim()) {
        await customerApi.addSavedAddress(customAddress.trim())
      }

      const payload = {
        vehicleId: selectedVehicle.id,
        servicePackageId: selectedPackage.id,
        serviceZoneId: selectedZone?.id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        address: finalAddress.trim(),
        parkingType: Number(parkingType),
        hasElectricity,
        hasWaterAccess: hasWater,
        bookingType: Number(bookingType),
        scheduledAt: bookingType === 0 ? new Date().toISOString() : `${scheduledDate}T${scheduledTime.includes('PM') ? '14:00:00' : '10:00:00'}Z`,
        parkingLatitude: pickedCoords.lat || 30.0226,
        parkingLongitude: pickedCoords.lng || 31.0031,
        addOnIds: selectedAddonIds
      }

      const booking = await customerApi.createBooking(payload)
      notify(`Booking ${booking.bookingNumber} created! Pay the 200 EGP deposit to dispatch a technician.`)
      await refreshData()
      navigate(`/customer/bookings?payBookingId=${encodeURIComponent(booking.id)}`)
    } catch (err) {
      console.error('Create booking error:', err)
      const { message, fieldErrors } = extractApiErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        setBookingErrors(fieldErrors)
      }
      setServerBookingError(message)
      notify(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="lx-enter lx-d1" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* COMPACT HEADER + INTERACTIVE 4-STEP BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--hairline-light)'
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--ink-primary)'
            }}
          >
            Reserve a detailing
          </h1>
        </div>

        {/* Smooth Sliding Horizontal Step Pills (Sequential Guard) */}
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--alabaster-raised)',
            padding: '4px',
            borderRadius: '999px',
            border: '1px solid var(--hairline-light)'
          }}
        >
          {/* Gliding Active Pill Indicator */}
          {pillStyle.ready && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '4px',
                bottom: '4px',
                left: 0,
                width: `${pillStyle.width}px`,
                transform: `translateX(${pillStyle.left}px)`,
                borderRadius: '999px',
                background: '#ffffff',
                border: '1px solid rgba(24, 24, 27, 0.14)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), 0 2px 10px rgba(24, 24, 27, 0.08)',
                transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1), width 340ms cubic-bezier(0.22, 1, 0.36, 1)',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />
          )}

          {WIZARD_STEPS.map((st) => {
            const isActive = activeStep === st.id
            const isUnlocked = st.id <= effectiveMaxStep
            const isCompleted = st.id < activeStep
            return (
              <button
                key={st.id}
                ref={(el) => { stepRefs.current[st.id] = el }}
                type="button"
                disabled={!isUnlocked}
                onClick={() => goToStep(st.id)}
                title={!isUnlocked ? 'Complete the current step first' : st.label}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 14px',
                  borderRadius: '999px',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: isActive ? 'var(--ink-primary)' : isUnlocked ? 'var(--ink-secondary)' : 'rgba(113, 113, 122, 0.45)',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  transition: 'color 220ms var(--ease-luxury)'
                }}
              >
                <span
                  className="mono-num"
                  style={{
                    fontSize: '11px',
                    color: isActive || isCompleted ? 'var(--bronze)' : isUnlocked ? 'var(--ink-muted)' : 'rgba(113, 113, 122, 0.4)',
                    fontWeight: 600
                  }}
                >
                  {st.num}
                </span>
                <span>{st.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {serverBookingError && (
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--semantic-negative-bg)',
            border: '1px solid rgba(185, 28, 28, 0.25)',
            borderRadius: '10px',
            color: 'var(--semantic-negative)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{serverBookingError}</span>
        </div>
      )}

      <form onSubmit={handleCreateBooking}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.75fr) 340px',
            gap: '28px',
            alignItems: 'start'
          }}
        >
          {/* LEFT: SINGLE-VIEWPORT STEP CONTENT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* =========================================================
                STEP 1: VEHICLE (Compact Horizontal Strip) + TREATMENT (2x2)
               ========================================================= */}
            {activeStep === 1 && (
              <div className="lx-enter" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* Compact Vehicle Selector */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-secondary)' }}>
                      Vehicle
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/customer/profile')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--bronze)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      <Plus size={13} /> Add vehicle
                    </button>
                  </div>

                  {vehicles.length === 0 ? (
                    <div style={{ padding: '18px', background: '#ffffff', border: '1px solid var(--hairline-light)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: 'var(--ink-secondary)' }}>No vehicles in your garage yet.</span>
                      <button type="button" className="btn primary sm" onClick={() => navigate('/customer/profile')}>
                        Register vehicle
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '10px' }}>
                      {vehicles.map((v) => {
                        const isSelected = selectedVehicle?.id === v.id
                        const s = String(v.sizeType).toUpperCase()
                        const sizeLabel = v.sizeType === 1 || s === 'SUV' ? 'SUV' : v.sizeType === 2 || s === 'TRUCK_VAN' ? 'Truck/Van' : 'Sedan'
                        const multText = v.sizeType === 1 || s === 'SUV' ? '1.25×' : v.sizeType === 2 || s === 'TRUCK_VAN' ? '1.50×' : '1.0×'
                        return (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVehicleId(v.id)}
                            className={`lx-select-card ${isSelected ? 'is-selected' : ''}`}
                            style={{
                              borderRadius: '12px',
                              padding: '11px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px'
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <b style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                                {v.make} {v.model}
                              </b>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span
                                  dir="auto"
                                  className="mono-num"
                                  style={{
                                    fontSize: '11px',
                                    color: 'var(--ink-secondary)',
                                    unicodeBidi: 'isolate'
                                  }}
                                >
                                  {v.licensePlate}
                                </span>
                                <span style={{ width: '1px', height: '11px', background: 'var(--hairline-light-strong)' }} />
                                <span
                                  dir="ltr"
                                  className="mono-num"
                                  style={{
                                    fontSize: '10.5px',
                                    fontWeight: 600,
                                    color: '#7a571e',
                                    background: 'var(--bronze-soft)',
                                    padding: '1px 7px',
                                    borderRadius: '999px',
                                    unicodeBidi: 'isolate',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {sizeLabel} · {multText}
                                </span>
                              </div>
                            </div>
                            <span
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '999px',
                                border: isSelected ? 'none' : '1.5px solid var(--hairline-light-strong)',
                                background: isSelected ? 'var(--ink-primary)' : 'transparent',
                                color: 'var(--ivory)',
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0
                              }}
                            >
                              {isSelected && <Check size={12} strokeWidth={2.4} />}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <FieldError error={bookingErrors.vehicle} />
                </div>

                {/* Treatment Tier 2x2 Grid */}
                <div>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-secondary)', marginBottom: '10px' }}>
                    Treatment tier
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id
                      const calculatedTierPrice = Math.round(pkg.basePrice * vehicleMultiplier)
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`lx-select-card ${isSelected ? 'is-selected' : ''}`}
                          style={{
                            borderRadius: '14px',
                            padding: '15px 17px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <b style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--ink-primary)' }}>
                              {pkg.name}
                            </b>
                            <span className="mono-num" style={{ fontSize: '16px', fontWeight: 600, color: isSelected ? 'var(--bronze)' : 'var(--ink-primary)' }}>
                              EGP {calculatedTierPrice}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> {pkg.durationMinutes} mins
                          </div>
                          <p style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', lineHeight: 1.45, margin: '0 0 10px 0' }}>
                            {pkg.desc}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {pkg.services.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--ink-secondary)',
                                  background: 'var(--alabaster)',
                                  border: '1px solid var(--hairline-light)',
                                  padding: '2px 8px',
                                  borderRadius: '999px'
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                STEP 2: OPTIONAL ENHANCEMENTS
               ========================================================= */}
            {activeStep === 2 && (
              <div className="lx-enter" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-secondary)' }}>
                  Optional enhancements
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {addonsCatalog.map((addon) => {
                    const isChecked = selectedAddonIds.includes(addon.id)
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`lx-select-card ${isChecked ? 'is-selected' : ''}`}
                        style={{
                          borderRadius: '14px',
                          padding: '15px 16px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '6px',
                            border: isChecked ? 'none' : '1.5px solid var(--hairline-light-strong)',
                            background: isChecked ? 'var(--ink-primary)' : '#ffffff',
                            color: 'var(--ivory)',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}
                        >
                          {isChecked && <Check size={13} strokeWidth={2.4} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                            <b style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-primary)' }}>{addon.name}</b>
                            <span className="mono-num" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bronze)', whiteSpace: 'nowrap' }}>
                              +EGP {addon.price}
                            </span>
                          </div>
                          <span style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', display: 'block', marginTop: '4px', lineHeight: 1.45 }}>
                            {addon.desc}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* =========================================================
                STEP 3: SCHEDULE & CADENCE
               ========================================================= */}
            {activeStep === 3 && (
              <div className="lx-enter" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-secondary)', marginBottom: '10px' }}>
                    Booking cadence
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                    {[
                      { type: 0, title: 'Fast Track', desc: 'Dispatch immediately (within 5 km)' },
                      { type: 1, title: 'Scheduled', desc: 'Pick your exact date & arrival window' },
                      { type: 2, title: 'Weekly · Save 10%', desc: 'Recurring weekly detailing visit' },
                      { type: 3, title: 'Monthly · Save 15%', desc: 'Recurring monthly detailing visit' }
                    ].map((item) => {
                      const active = bookingType === item.type
                      return (
                        <div
                          key={item.type}
                          onClick={() => setBookingType(item.type)}
                          className={`lx-select-card ${active ? 'is-selected' : ''}`}
                          style={{
                            borderRadius: '14px',
                            padding: '15px 16px'
                          }}
                        >
                          <b style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--ink-primary)' }}>{item.title}</b>
                          <span style={{ fontSize: '12.5px', color: 'var(--ink-secondary)', display: 'block', marginTop: '3px' }}>{item.desc}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {bookingType !== 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                      background: '#ffffff',
                      border: '1px solid var(--hairline-light)',
                      padding: '18px',
                      borderRadius: '14px'
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
                        Service date
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={scheduledDate}
                        onChange={(e) => {
                          setScheduledDate(e.target.value)
                          if (bookingErrors.schedule) setBookingErrors({ ...bookingErrors, schedule: '' })
                        }}
                        style={{ ...inputBaseStyle, borderColor: bookingErrors.schedule ? 'var(--semantic-negative)' : 'var(--hairline-light-strong)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
                        Arrival window
                      </label>
                      <select value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} style={inputBaseStyle}>
                        <option value="09:00 AM">09:00 AM – 11:00 AM</option>
                        <option value="11:30 AM">11:30 AM – 01:30 PM</option>
                        <option value="02:00 PM">02:00 PM – 04:00 PM</option>
                        <option value="04:30 PM">04:30 PM – 06:30 PM</option>
                      </select>
                    </div>
                  </div>
                )}
                <FieldError error={bookingErrors.schedule} />
              </div>
            )}

            {/* =========================================================
                STEP 4: LOCATION & SITE ACCESS
               ========================================================= */}
            {activeStep === 4 && (
              <div className="lx-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div
                    style={{
                      position: 'relative',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      background: 'var(--alabaster-raised)',
                      border: '1px solid var(--hairline-light)',
                      borderRadius: '999px',
                      padding: '3px',
                      marginBottom: '12px',
                      maxWidth: '380px'
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: '3px',
                        bottom: '3px',
                        left: '3px',
                        width: 'calc(50% - 3px)',
                        borderRadius: '999px',
                        background: '#ffffff',
                        border: '1px solid rgba(24, 24, 27, 0.1)',
                        boxShadow: '0 2px 6px rgba(24, 24, 27, 0.08)',
                        transform: useCustomAddress ? 'translateX(100%)' : 'translateX(0%)',
                        transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                        pointerEvents: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setUseCustomAddress(false)}
                      style={{ position: 'relative', zIndex: 1, padding: '8px 12px', borderRadius: '999px', border: 'none', outline: 'none', background: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: !useCustomAddress ? 'var(--ink-primary)' : 'var(--ink-secondary)' }}
                    >
                      Saved ({savedList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseCustomAddress(true)}
                      style={{ position: 'relative', zIndex: 1, padding: '8px 12px', borderRadius: '999px', border: 'none', outline: 'none', background: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: useCustomAddress ? 'var(--ink-primary)' : 'var(--ink-secondary)' }}
                    >
                      Pick on GPS map
                    </button>
                  </div>

                  {!useCustomAddress ? (
                    savedList.length > 0 ? (
                      <select value={selectedSavedAddress} onChange={(e) => setSelectedSavedAddress(e.target.value)} style={inputBaseStyle}>
                        {savedList.map((addr, idx) => (
                          <option key={idx} value={addr}>{addr}</option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ padding: '12px 14px', borderRadius: '10px', border: '1px dashed var(--hairline-light-strong)', background: '#ffffff', fontSize: '13px', color: 'var(--ink-secondary)' }}>
                        No saved addresses yet. Switch to <strong>Pick on GPS map</strong> to drop a pin.
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <LocationPicker
                        value={customAddress}
                        latitude={pickedCoords.lat}
                        longitude={pickedCoords.lng}
                        error={bookingErrors.address}
                        onChange={({ address, latitude, longitude }) => {
                          setCustomAddress(address)
                          setPickedCoords({ lat: latitude, lng: longitude })
                          if (bookingErrors.address) setBookingErrors({ ...bookingErrors, address: '' })
                          const targetZoneId =
                            latitude >= 30.045
                              ? 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002'
                              : latitude >= 30.012 && longitude >= 30.965
                                ? 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001'
                                : longitude <= 30.965 && latitude < 30.012
                                  ? 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003'
                                  : latitude >= 29.985
                                    ? 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004'
                                    : 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005'
                          if (zones.some((z) => z.id === targetZoneId)) {
                            setSelectedZoneId(targetZoneId)
                          }
                        }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--ink-secondary)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={saveNewAddress} onChange={(e) => setSaveNewAddress(e.target.checked)} />
                        Save to my addresses for future bookings
                      </label>
                    </div>
                  )}
                  <FieldError error={bookingErrors.address} />
                </div>

                {/* Zone + Parking in compact rows */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
                      Service zone
                    </label>
                    <select value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)} style={inputBaseStyle}>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.zoneName} (+EGP {z.baseDistanceSurcharge})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: '6px' }}>
                      Parking setting
                    </label>
                    <select value={parkingType} onChange={(e) => setParkingType(Number(e.target.value))} style={inputBaseStyle}>
                      <option value={0}>Private Garage</option>
                      <option value={1}>Driveway / Villa</option>
                      <option value={2}>Public Street</option>
                      <option value={3}>Underground</option>
                    </select>
                  </div>
                </div>

                {/* Utilities */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', border: hasElectricity ? '1.5px solid var(--bronze)' : '1px solid var(--hairline-light)', background: hasElectricity ? 'var(--bronze-soft)' : '#ffffff', cursor: 'pointer' }}>
                    <input type="checkbox" checked={hasElectricity} onChange={(e) => setHasElectricity(e.target.checked)} />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-primary)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Zap size={14} color="var(--bronze)" /> Electricity outlet
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', border: hasWater ? '1.5px solid var(--bronze)' : '1px solid var(--hairline-light)', background: hasWater ? 'var(--bronze-soft)' : '#ffffff', cursor: 'pointer' }}>
                    <input type="checkbox" checked={hasWater} onChange={(e) => setHasWater(e.target.checked)} />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-primary)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Droplets size={14} color="var(--bronze)" /> Water tap source
                    </span>
                  </label>
                </div>

                {!isUtilityEligible && (
                  <div style={{ padding: '10px 14px', background: 'var(--bronze-soft)', border: '1px solid rgba(166, 124, 55, 0.3)', borderRadius: '10px', fontSize: '12px', color: '#7a571e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>Self-contained van with onboard generator &amp; water tank will be dispatched automatically.</span>
                  </div>
                )}
                <FieldError error={bookingErrors.utilities} />
              </div>
            )}

            {/* STEP NAVIGATION FOOTER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--hairline-light)' }}>
              <button
                type="button"
                disabled={activeStep === 1}
                onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
                className="btn outline sm"
                style={{ opacity: activeStep === 1 ? 0.4 : 1, cursor: activeStep === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ArrowLeft size={14} /> Back
              </button>

              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={() => goToStep(Math.min(4, activeStep + 1))}
                  className="lx-btn lx-glass-btn lx-glass-obsidian"
                  style={{
                    minHeight: '38px',
                    padding: '0 20px',
                    borderRadius: '999px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px'
                  }}
                >
                  <span>Next: {WIZARD_STEPS[activeStep].label}</span>
                  <ArrowRight size={14} className="lx-arrow" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const finalAddr = (useCustomAddress ? customAddress : selectedSavedAddress || '').trim()
                    if (!finalAddr) {
                      setBookingErrors((prev) => ({
                        ...prev,
                        address: 'Please select a saved address or pick your location on the map.'
                      }))
                      notify('Please choose your wash location before tapping Done.')
                      return
                    }
                    setBookingErrors((prev) => ({ ...prev, address: '' }))
                    setLocationConfirmed(true)
                    notify('Location confirmed! You can now confirm & pay your 200 EGP deposit.')
                  }}
                  className={`lx-btn lx-glass-btn ${locationConfirmed ? 'lx-glass-gold' : 'lx-glass-obsidian'}`}
                  style={{
                    minHeight: '38px',
                    padding: '0 22px',
                    borderRadius: '999px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px'
                  }}
                >
                  <Check size={14} strokeWidth={2.2} />
                  <span>{locationConfirmed ? 'Location confirmed' : 'Done'}</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: FIXED-PROPORTION STICKY OBSIDIAN DOSSIER (100% Visible at 100% Zoom) */}
          <aside style={{ position: 'sticky', top: '76px' }}>
            <div
              style={{
                background: 'var(--obsidian)',
                color: 'var(--ivory)',
                borderRadius: '16px',
                padding: '16px 18px',
                border: '1px solid var(--hairline-dark-strong)',
                boxShadow: '0 16px 36px rgba(14, 14, 16, 0.18)',
                maxHeight: 'calc(100vh - 92px)',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '9.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--bronze-dark)', fontWeight: 600, marginBottom: '2px' }}>
                    Reservation Dossier
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '23px', fontWeight: 400, margin: 0, color: 'var(--ivory)', lineHeight: 1.05 }}>
                    {selectedPackage.name}
                  </h3>
                </div>
                <span className="mono-num" style={{ fontSize: '11px', color: 'var(--ivory-secondary)' }}>
                  {selectedPackage.durationMinutes}m
                </span>
              </div>

              <div
                style={{
                  background: 'rgba(245, 243, 238, 0.05)',
                  border: '1px solid var(--hairline-dark)',
                  borderRadius: '9px',
                  padding: '8px 11px',
                  marginBottom: '10px',
                  display: 'grid',
                  gap: '4px',
                  fontSize: '11.5px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: 'var(--ivory-secondary)' }}>Vehicle</span>
                  <span style={{ color: 'var(--ivory)', fontWeight: 500 }}>
                    {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'Not selected'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: 'var(--ivory-secondary)' }}>Timing</span>
                  <span style={{ color: 'var(--ivory)', fontWeight: 500 }}>
                    {bookingType === 0 ? 'Fast Track' : `${scheduledDate} · ${scheduledTime}`}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingBottom: '10px', borderBottom: '1px solid var(--hairline-dark)', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ivory-secondary)' }}>Base treatment</span>
                  <span className="mono-num">EGP {selectedPackage.basePrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ivory-secondary)' }}>Vehicle size ({vehicleMultiplier}×)</span>
                  <span className="mono-num">+EGP {vehicleSurcharge}</span>
                </div>
                {addOnsSubtotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--ivory-secondary)' }}>Add-ons ({selectedAddonIds.length})</span>
                    <span className="mono-num">+EGP {addOnsSubtotal}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ivory-secondary)' }}>Coverage zone</span>
                  <span className="mono-num">+EGP {distanceFee}</span>
                </div>
                {discountMultiplier < 1.0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86efac' }}>
                    <span>Plan discount (-{Math.round((1 - discountMultiplier) * 100)}%)</span>
                    <span className="mono-num">-EGP {discountSaved}</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 0 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--ivory-secondary)' }}>Estimated total</span>
                  <strong className="mono-num" style={{ fontSize: '21px', fontWeight: 500, color: 'var(--ivory)' }}>
                    EGP {totalPrice}
                  </strong>
                </div>

                <div
                  style={{
                    background: 'rgba(198, 146, 73, 0.12)',
                    border: '1px solid rgba(198, 146, 73, 0.28)',
                    borderRadius: '9px',
                    padding: '8px 11px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                    <span style={{ color: '#f3d299', fontWeight: 600 }}>Due now (deposit)</span>
                    <b className="mono-num" style={{ color: '#f3d299' }}>EGP {depositAmount}.00</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ivory-secondary)' }}>
                    <span>Remaining on completion</span>
                    <span className="mono-num">EGP {remainingBalance}.00</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || vehicles.length === 0 || !locationConfirmed}
                className="lx-btn lx-glass-btn lx-glass-gold"
                title={!locationConfirmed ? 'Complete Step 04 (Location & Access) and click Done first' : 'Confirm & pay deposit'}
                style={{
                  width: '100%',
                  minHeight: '42px',
                  borderRadius: '999px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  opacity: submitting || vehicles.length === 0 || !locationConfirmed ? 0.4 : 1,
                  cursor: submitting || vehicles.length === 0 || !locationConfirmed ? 'not-allowed' : 'pointer',
                  filter: !locationConfirmed ? 'grayscale(0.35)' : 'none'
                }}
              >
                <span>{submitting ? 'Creating…' : 'Confirm & pay 200 EGP deposit'}</span>
                {!submitting && <ArrowRight size={14} strokeWidth={1.9} className="lx-arrow" />}
              </button>

              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center', color: !locationConfirmed ? '#f3d299' : 'var(--ivory-secondary)', fontSize: '10.5px' }}>
                <ShieldCheck size={12} color="var(--bronze-dark)" />
                <span>
                  {!locationConfirmed
                    ? 'Complete Step 04 & tap Done to unlock'
                    : 'Photo-verified finish · Certified detailers'}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  )
}
