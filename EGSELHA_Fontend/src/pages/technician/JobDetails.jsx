import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Phone,
  Navigation,
  CarFront,
  CheckCircle2,
  Check,
  MapPin,
  Camera,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  X,
  Lock
} from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import Status from '../../component/Status'
import { useTech } from '../../context/TechnicianContext'
import { technicianApi } from '../../services/technicianApi'
import { resolveAssetUrl } from '../../services/apiClient'

const REQUIRED_QA_COUNT = 6

const QA_CATEGORIES = [
  'FRONT',
  'BACK',
  'INTERIOR',
  'REAR_SEATS',
  'TRUNK',
  'FRONT'
]

const QA_ANGLE_LABELS = [
  'Front Exterior',
  'Rear Exterior',
  'Front Interior',
  'Rear Seats',
  'Trunk Area',
  'Full Angle Check'
]

export default function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { jobs, loading, updateStatus, notify } = useTech()
  const contextJob = jobs.find((j) => j.id === id || j.bookingNumber === id)
  const [fetchedJob, setFetchedJob] = useState(null)
  const [fetchingJob, setFetchingJob] = useState(false)

  const job = contextJob || fetchedJob

  // State for QA Photos
  const [qaPhotos, setQaPhotos] = useState([])
  const [uploading, setUploading] = useState(false)

  // Live Rear Camera Modal State
  const [cameraModalType, setCameraModalType] = useState(null) // 'BEFORE' | 'AFTER' | null
  const [cameraError, setCameraError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // State for Inspection Upsell Modal
  const [upsellModalOpen, setUpsellModalOpen] = useState(false)
  const [upsellReason, setUpsellReason] = useState('')
  const [upsellPrice, setUpsellPrice] = useState(150)
  const [activeUpsell, setActiveUpsell] = useState(null)
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    if (job?.bookingStatus === 'DISPATCHED' && job?.cancelDeadlineUtc) {
      const interval = setInterval(() => setNowMs(Date.now()), 1000)
      return () => clearInterval(interval)
    }
  }, [job?.bookingStatus, job?.cancelDeadlineUtc])

  useEffect(() => {
    if (!contextJob && id) {
      setFetchingJob(true)
      technicianApi.getJobDetails(id)
        .then((data) => {
          if (data && data.id) setFetchedJob(data)
        })
        .catch(console.error)
        .finally(() => setFetchingJob(false))
    }
  }, [contextJob, id])

  useEffect(() => {
    if (job?.id) {
      technicianApi.getQAPhotos(job.id)
        .then((photos) => { if (Array.isArray(photos)) setQaPhotos(photos) })
        .catch(console.error)

      technicianApi.getUpsell(job.id)
        .then((upsell) => { if (upsell) setActiveUpsell(upsell) })
        .catch(console.error)
    }
  }, [job?.id])

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }, [])

  const closeCameraModal = useCallback(() => {
    stopCameraStream()
    setCameraModalType(null)
    setCameraError('')
  }, [stopCameraStream])

  useEffect(() => {
    if (!cameraModalType) {
      stopCameraStream()
      return
    }

    let cancelled = false
    setCameraError('')
    setCameraReady(false)

    async function startRearCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Live camera preview is not supported in this browser. Use the button below to launch your device camera directly.')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        setCameraReady(true)
      } catch {
        if (!cancelled) {
          setCameraError('Could not access live camera stream. Please grant camera permission or tap Open Device Camera below.')
        }
      }
    }

    startRearCamera()
    return () => {
      cancelled = true
      stopCameraStream()
    }
  }, [cameraModalType, stopCameraStream])

  if ((loading || fetchingJob) && !job) {
    return <div className="empty-state"><p>Loading job details...</p></div>
  }

  if (!job) return <div className="empty-state">Job not found.</div>

  const beforePhotos = qaPhotos.filter((p) => String(p.photoType).toUpperCase() === 'BEFORE' || p.photoType === 0)
  const afterPhotos = qaPhotos.filter((p) => String(p.photoType).toUpperCase() === 'AFTER' || p.photoType === 1)

  const getCurrentCount = (type) => (type === 'BEFORE' ? beforePhotos.length : afterPhotos.length)

  const openCameraFor = (type) => {
    if (getCurrentCount(type) >= REQUIRED_QA_COUNT) {
      notify(`All ${REQUIRED_QA_COUNT} ${type.toLowerCase()} photos are already uploaded.`)
      return
    }
    setCameraModalType(type)
  }

  const getCoordinates = async () => {
    let lat = 30.0561
    let lng = 31.3414
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 2000 })
        )
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      } catch {
        // Fallback coordinates when permission isn't granted
      }
    }
    return { lat, lng }
  }

  const uploadBlobOrFile = async (photoType, fileOrBlob) => {
    const currentCount = getCurrentCount(photoType)
    if (currentCount >= REQUIRED_QA_COUNT) {
      notify(`All ${REQUIRED_QA_COUNT} ${photoType.toLowerCase()} photos uploaded!`)
      closeCameraModal()
      return
    }

    const category = QA_CATEGORIES[currentCount] || 'FRONT'
    const fileToUpload =
      fileOrBlob instanceof File
        ? fileOrBlob
        : new File([fileOrBlob], `${photoType.toLowerCase()}_${currentCount + 1}.jpg`, { type: 'image/jpeg' })

    setUploading(true)
    try {
      const { lat, lng } = await getCoordinates()
      const saved = await technicianApi.uploadQAPhotoFile(job.id, fileToUpload, photoType, category, lat, lng)
      const nextCount = currentCount + 1
      setQaPhotos((prev) => [...prev, saved])
      notify(`Captured & uploaded ${photoType.toLowerCase()} photo (${nextCount}/${REQUIRED_QA_COUNT})`)
      if (nextCount >= REQUIRED_QA_COUNT) {
        closeCameraModal()
      }
    } catch (err) {
      console.error(err)
      notify(err.message || 'Failed to upload QA photo.')
    } finally {
      setUploading(false)
    }
  }

  const handleCaptureFromLiveCamera = async () => {
    const video = videoRef.current
    if (!video || !cameraReady || uploading) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      if (!blob) {
        notify('Could not capture frame from camera.')
        return
      }
      await uploadBlobOrFile(cameraModalType, blob)
    }, 'image/jpeg', 0.88)
  }

  const handleFallbackCameraInput = async (photoType, event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    await uploadBlobOrFile(photoType, file)
  }

  const handleStatusUpdate = async (nextStatus) => {
    if (nextStatus === 'In Progress' && beforePhotos.length < REQUIRED_QA_COUNT) {
      notify(`Capture all ${REQUIRED_QA_COUNT} Before photos before starting (${beforePhotos.length}/${REQUIRED_QA_COUNT}).`)
      openCameraFor('BEFORE')
      return false
    }
    if (nextStatus === 'Completed' && (beforePhotos.length < REQUIRED_QA_COUNT || afterPhotos.length < REQUIRED_QA_COUNT)) {
      notify(`Capture all ${REQUIRED_QA_COUNT} After photos before completing (${afterPhotos.length}/${REQUIRED_QA_COUNT}).`)
      openCameraFor('AFTER')
      return false
    }

    const ok = await updateStatus(job.id, nextStatus)
    if (ok) {
      setFetchedJob((prev) => (prev ? { ...prev, status: nextStatus } : prev))
    }
    return ok
  }

  const handleProposeUpsell = async (e) => {
    e.preventDefault()
    if (!upsellReason || upsellPrice <= 0) return

    try {
      const result = await technicianApi.proposeUpsell(job.id, {
        reason: upsellReason,
        additionalPrice: Number(upsellPrice),
        evidencePhotoUrl: ''
      })
      setActiveUpsell(result)
      setUpsellModalOpen(false)
      notify(`Inspection Upsell of EGP ${upsellPrice} sent for customer approval!`)
    } catch (err) {
      console.error(err)
      notify('Failed to submit upsell request.')
    }
  }

  const isStepCompleted = (list) => list.includes(job.status)
  const canStartWash = beforePhotos.length >= REQUIRED_QA_COUNT
  const canCompleteJob = beforePhotos.length >= REQUIRED_QA_COUNT && afterPhotos.length >= REQUIRED_QA_COUNT

  const activeCameraCount = cameraModalType ? getCurrentCount(cameraModalType) : 0
  const activeAngleLabel = QA_ANGLE_LABELS[activeCameraCount] || 'Vehicle Angle'

  return (
    <>
      <PageTitle
        eyebrow={`BOOKING ${job.id}`}
        title="Job details"
        desc="Review the booking information and update its progress."
        action={<button className="btn outline" onClick={() => navigate('/technician/jobs')}>Back to jobs</button>}
      />

      <div className="details-grid">
        <div className="panel detail-main">
          <div className="panel-head">
            <div><h2>Booking overview</h2><p>Customer and service information</p></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {(job.isAccepted || job.bookingStatus === 'DISPATCHED') && <Status value="Accepted" />}
              <Status value={job.status} />
            </div>
          </div>

          {/* Accepted Job Confirmation Banner */}
          {(() => {
            const deadlineMs = job.cancelDeadlineUtc ? new Date(job.cancelDeadlineUtc).getTime() : 0
            const graceSecondsLeft = job.bookingStatus === 'DISPATCHED' && deadlineMs > 0
              ? Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000))
              : 0
            const mm = String(Math.floor(graceSecondsLeft / 60)).padStart(2, '0')
            const ss = String(graceSecondsLeft % 60).padStart(2, '0')

            if (job.bookingStatus === 'CANCELLED') {
              return (
                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '12px' }}>
                  <b>Booking Cancelled:</b> The customer cancelled this booking within the 2-minute grace window.
                </div>
              )
            }

            if (job.isAccepted || job.bookingStatus === 'DISPATCHED' || job.status !== 'Completed') {
              return (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#ecfdf5',
                  border: '1px solid #86efac',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={20} color="#16a34a" />
                    <div>
                      <b style={{ color: '#166534', fontSize: '13px', display: 'block' }}>
                        Job Accepted — Assigned to You ({job.bookingNumber || job.id})
                      </b>
                      <small style={{ color: '#15803d', fontSize: '11px' }}>
                        {graceSecondsLeft > 0
                          ? `Customer 2-min grace window: ${mm}:${ss} remaining (after that, job is locked in).`
                          : 'Booking is locked in & confirmed (200 EGP deposit paid). Proceed to customer!'}
                      </small>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          })()}

          <div className="detail-customer">
            <div className="customer-avatar large">{job.customer.split(' ').map((x) => x[0]).join('')}</div>
            <div><b>{job.customer}</b><small>{job.phone}</small></div>
            <a
              className="soft-btn"
              href={`tel:${(job.phone || '').replace(/\s+/g, '')}`}
              style={{ textDecoration: 'none' }}
            >
              <Phone size={15} /> Call
            </a>
          </div>

          <div className="detail-sections">
            <div><span>Service package</span><b>{job.service} (EGP {job.basePackagePrice ?? job.price})</b></div>
            <div><span>Vehicle</span><b>{job.car} ({job.vehicleMultiplier ?? 1}×)</b></div>
            <div><span>Date &amp; time</span><b>{job.date} · {job.time}</b></div>
            <div><span>Booking total price</span><b style={{ color: '#087cf0' }}>EGP {job.price}</b></div>
            {(job.addOnsSubtotal ?? 0) > 0 && (
              <div className="wide">
                <span>Selected add-ons (+EGP {job.addOnsSubtotal})</span>
                <b>{job.addOnNames?.length ? job.addOnNames.join(' · ') : `EGP ${job.addOnsSubtotal}`}</b>
              </div>
            )}
            <div><span>Deposit paid</span><b style={{ color: '#16a34a' }}>EGP {job.depositAmount ?? 200}</b></div>
            <div><span>Remaining balance</span><b>EGP {job.remainingBalance ?? Math.max(0, (job.price || 0) - 200)}</b></div>
            <div><span>Distance surcharge</span><b>+EGP {job.distanceSurcharge ?? 0}</b></div>
            <div><span>Your tech share (70%)</span><b style={{ color: '#15803d' }}>EGP {job.techPayout ?? Math.round((job.price || 0) * 0.7)}</b></div>
            {(job.upsellTotal ?? 0) > 0 && (
              <div className="wide"><span>Approved upsell</span><b style={{ color: '#c2410c' }}>+EGP {job.upsellTotal}</b></div>
            )}
            <div className="wide"><span>Customer address</span><b>{job.address}</b></div>
          </div>

          {/* Active Upsell banner if exists */}
          {activeUpsell && (
            <div style={{ margin: '16px 0', padding: '14px', borderRadius: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} color="#2563eb" />
                <div>
                  <b style={{ color: '#1e40af' }}>On-Site Inspection Upsell (+EGP {activeUpsell.additionalPrice})</b>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#3b82f6' }}>{activeUpsell.technicianNote}</p>
                </div>
              </div>
              <span className={`status-pill ${activeUpsell.status.toLowerCase()}`}>
                {activeUpsell.status}
              </span>
            </div>
          )}

          <h3 className="section-title">Job progress (EGHSELHA Workflow)</h3>
          <div className="progress-steps">
            <div className="step completed">
              <i><Check size={14} /></i>
              <span>Accepted</span>
            </div>
            <div className={`step ${isStepCompleted(['On The Way', 'Arrived', 'In Progress', 'Completed']) ? 'completed' : ''}`}>
              <i>{isStepCompleted(['On The Way', 'Arrived', 'In Progress', 'Completed']) ? <Check size={14} /> : 2}</i>
              <span>On the way</span>
            </div>
            <div className={`step ${isStepCompleted(['Arrived', 'In Progress', 'Completed']) ? 'completed' : ''}`}>
              <i>{isStepCompleted(['Arrived', 'In Progress', 'Completed']) ? <Check size={14} /> : 3}</i>
              <span>Arrived</span>
            </div>
            <div className={`step ${isStepCompleted(['In Progress', 'Completed']) ? 'completed' : ''}`}>
              <i>{isStepCompleted(['In Progress', 'Completed']) ? <Check size={14} /> : 4}</i>
              <span>In progress</span>
            </div>
            <div className={`step ${isStepCompleted(['Completed']) ? 'completed' : ''}`}>
              <i>{isStepCompleted(['Completed']) ? <Check size={14} /> : 5}</i>
              <span>Completed</span>
            </div>
          </div>

          <div className="action-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {job.status === 'Upcoming' && (
              <button className="btn primary" onClick={() => handleStatusUpdate('On The Way')}>
                Start navigation <Navigation size={16} />
              </button>
            )}

            {job.status === 'On The Way' && (
              <button
                className="btn primary"
                onClick={async () => {
                  const ok = await handleStatusUpdate('Arrived')
                  if (ok) {
                    notify(`Marked arrived! Please capture all ${REQUIRED_QA_COUNT} Before photos with camera.`)
                  }
                }}
              >
                <MapPin size={16} /> Mark Arrived
              </button>
            )}

            {job.status === 'Arrived' && (
              <>
                <button
                  className="btn primary"
                  disabled={!canStartWash}
                  onClick={() => handleStatusUpdate('In Progress')}
                  style={!canStartWash ? { opacity: 0.55, cursor: 'not-allowed', background: '#94a3b8', boxShadow: 'none' } : undefined}
                >
                  {canStartWash ? <CarFront size={16} /> : <Lock size={15} />}
                  Start washing
                </button>
                {!canStartWash && (
                  <button className="btn outline" onClick={() => openCameraFor('BEFORE')} style={{ borderColor: '#087cf0', color: '#087cf0' }}>
                    <Camera size={16} /> Capture Before ({beforePhotos.length}/{REQUIRED_QA_COUNT})
                  </button>
                )}
                <button className="btn outline" onClick={() => setUpsellModalOpen(true)}>
                  <PlusCircle size={16} /> Propose Upsell
                </button>
              </>
            )}

            {job.status === 'In Progress' && (
              <>
                <button
                  className="btn primary"
                  disabled={!canCompleteJob}
                  onClick={() => handleStatusUpdate('Completed')}
                  style={!canCompleteJob ? { opacity: 0.55, cursor: 'not-allowed', background: '#94a3b8', boxShadow: 'none' } : undefined}
                >
                  {canCompleteJob ? <CheckCircle2 size={16} /> : <Lock size={15} />}
                  Complete job
                </button>
                {!canCompleteJob && (
                  <button className="btn outline" onClick={() => openCameraFor('AFTER')} style={{ borderColor: '#087cf0', color: '#087cf0' }}>
                    <Camera size={16} /> Capture After ({afterPhotos.length}/{REQUIRED_QA_COUNT})
                  </button>
                )}
                <button className="btn outline" onClick={() => setUpsellModalOpen(true)}>
                  <PlusCircle size={16} /> Propose Upsell
                </button>
              </>
            )}

            {job.status === 'Completed' && (
              <span className="completed-note"><CheckCircle2 /> This job is completed.</span>
            )}

            {['Upcoming', 'On The Way', 'Arrived'].includes(job.status) && job.bookingStatus !== 'CANCELLED' && (
              <button
                type="button"
                className="btn outline"
                style={{ marginLeft: 'auto', borderColor: '#fecaca', color: '#dc2626', background: '#fef2f2' }}
                onClick={async () => {
                  if (!window.confirm(`Cancel trip ${job.bookingNumber || job.id}? The booking will be marked as Cancelled by Technician.`)) {
                    return
                  }
                  const ok = await updateStatus(job.id, 'Cancelled')
                  if (ok) {
                    setFetchedJob((prev) => (prev ? { ...prev, status: 'Cancelled', bookingStatus: 'CANCELLED' } : prev))
                    navigate('/technician/jobs')
                  }
                }}
              >
                <X size={15} /> Cancel trip
              </button>
            )}
          </div>

          {(job.status === 'Arrived' || job.status === 'In Progress') && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: (job.status === 'Arrived' ? canStartWash : canCompleteJob) ? '#ecfdf5' : '#fffbeb',
              border: `1px solid ${(job.status === 'Arrived' ? canStartWash : canCompleteJob) ? '#86efac' : '#fde68a'}`,
              fontSize: '11px',
              fontWeight: 600,
              color: (job.status === 'Arrived' ? canStartWash : canCompleteJob) ? '#15803d' : '#b45309',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Camera size={14} />
              {job.status === 'Arrived'
                ? (canStartWash
                    ? `All ${REQUIRED_QA_COUNT} Before photos captured. Ready to start washing!`
                    : `Required before Start Washing: ${beforePhotos.length}/${REQUIRED_QA_COUNT} Before camera photos captured.`)
                : (canCompleteJob
                    ? `All ${REQUIRED_QA_COUNT} Before & ${REQUIRED_QA_COUNT} After photos captured. Ready to complete job!`
                    : `Required before Completing: ${afterPhotos.length}/${REQUIRED_QA_COUNT} After camera photos captured.`)}
            </div>
          )}
        </div>

        <div className="detail-side">
          {/* Redesigned Modern Customer Location Card */}
          <div className="panel">
            <div className="panel-head" style={{ marginBottom: '12px' }}>
              <div>
                <h2>Customer location</h2>
                <p>{job.address}</p>
              </div>
              {job.distance && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: '#e0f2fe',
                  color: '#0369a1'
                }}>
                  {job.distance}
                </span>
              )}
            </div>

            <div
              style={{
                height: '190px',
                borderRadius: '14px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid #dbeafe',
                background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 50%, #ecfeff 100%)',
                marginBottom: '14px'
              }}
            >
              {/* Crisp Stylized Map Grid SVG */}
              <svg
                viewBox="0 0 400 200"
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                <defs>
                  <pattern id="map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#bfdbfe" strokeWidth="0.8" opacity="0.6" />
                  </pattern>
                </defs>
                <rect width="400" height="200" fill="url(#map-grid)" />
                <rect x="260" y="20" width="90" height="58" rx="14" fill="#bbf7d0" opacity="0.45" />
                <rect x="30" y="120" width="85" height="50" rx="12" fill="#bbf7d0" opacity="0.38" />
                <path d="M -20 140 C 80 120, 140 70, 220 95 S 330 135, 420 80" fill="none" stroke="#ffffff" strokeWidth="14" strokeLinecap="round" />
                <path d="M 90 -10 C 110 60, 145 110, 210 100 C 260 92, 300 40, 320 -10" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" />
                <path d="M 70 155 Q 145 128 200 100" fill="none" stroke="#087cf0" strokeWidth="3.5" strokeDasharray="6 6" strokeLinecap="round" />
                <circle cx="70" cy="155" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              {/* Pulsing Radar Destination Pin */}
              <div style={{
                position: 'absolute',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(8, 124, 240, 0.18)',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0ea5e9, #087cf0)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 6px 16px rgba(8, 124, 240, 0.35)',
                    border: '2.5px solid #ffffff'
                  }}>
                    <MapPin size={18} />
                  </div>
                </div>
                <div style={{
                  marginTop: '6px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#0f172a',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
                  whiteSpace: 'nowrap',
                  maxWidth: '240px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {job.address || 'Customer Destination'}
                </div>
              </div>
            </div>

            <a
              className="btn primary full"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address || 'Cairo')}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Navigation size={16} /> Get directions
            </a>
          </div>

          {/* Mandatory QA Photos Panel (6 Before & 6 After via Direct Camera) */}
          <div className="panel upload-panel">
            <div className="panel-head">
              <div>
                <h2>Mandatory QA Photos</h2>
                <p>Tap to open camera &amp; capture {REQUIRED_QA_COUNT} before + {REQUIRED_QA_COUNT} after photos</p>
              </div>
            </div>
            <div className="photo-slots">
              <button
                type="button"
                className="photo-slot"
                onClick={() => openCameraFor('BEFORE')}
                style={{
                  fontFamily: 'inherit',
                  border: beforePhotos.length >= REQUIRED_QA_COUNT ? '1.5px solid #86efac' : undefined,
                  background: beforePhotos.length >= REQUIRED_QA_COUNT ? '#f0fdf4' : '#fbfdff'
                }}
              >
                <Camera color={beforePhotos.length >= REQUIRED_QA_COUNT ? '#16a34a' : undefined} />
                <b>Before Photos ({beforePhotos.length}/{REQUIRED_QA_COUNT})</b>
                <small>
                  {beforePhotos.length >= REQUIRED_QA_COUNT
                    ? 'Completed (6/6)'
                    : (uploading ? 'Uploading...' : 'Tap to open camera')}
                </small>
              </button>

              <button
                type="button"
                className="photo-slot"
                onClick={() => openCameraFor('AFTER')}
                style={{
                  fontFamily: 'inherit',
                  border: afterPhotos.length >= REQUIRED_QA_COUNT ? '1.5px solid #86efac' : undefined,
                  background: afterPhotos.length >= REQUIRED_QA_COUNT ? '#f0fdf4' : '#fbfdff'
                }}
              >
                <Camera color={afterPhotos.length >= REQUIRED_QA_COUNT ? '#16a34a' : undefined} />
                <b>After Photos ({afterPhotos.length}/{REQUIRED_QA_COUNT})</b>
                <small>
                  {afterPhotos.length >= REQUIRED_QA_COUNT
                    ? 'Completed (6/6)'
                    : (uploading ? 'Uploading...' : 'Tap to open camera')}
                </small>
              </button>
            </div>

            {qaPhotos.length > 0 && (
              <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: '8px' }}>
                {qaPhotos.map((p, idx) => (
                  <a
                    key={p.id || idx}
                    href={resolveAssetUrl(p.imageUrl)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', textDecoration: 'none' }}
                  >
                    <img
                      src={resolveAssetUrl(p.imageUrl)}
                      alt={`${p.photoType || 'QA'} ${idx + 1}`}
                      style={{ width: '100%', height: '54px', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ padding: '3px 6px', fontSize: '0.68rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                      <CheckCircle size={10} color="#16a34a" /> {String(p.photoType || 'QA')}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Rear Camera Capture Modal */}
      {cameraModalType && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}
          onClick={closeCameraModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '540px',
              background: '#0f172a',
              color: '#fff',
              borderRadius: '18px',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              border: '1px solid #1e293b'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #1e293b' }}>
              <div>
                <b style={{ fontSize: '14px', display: 'block' }}>
                  {cameraModalType === 'BEFORE' ? 'Before Wash Camera' : 'After Wash Camera'} ({activeCameraCount}/{REQUIRED_QA_COUNT})
                </b>
                <small style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Angle {Math.min(activeCameraCount + 1, REQUIRED_QA_COUNT)} of {REQUIRED_QA_COUNT}: {activeAngleLabel}
                </small>
              </div>
              <button
                type="button"
                onClick={closeCameraModal}
                style={{ background: '#1e293b', border: 'none', color: '#cbd5e1', borderRadius: '8px', width: '32px', height: '32px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ position: 'relative', background: '#020617', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cameraError ? (
                <div style={{ padding: '28px 20px', textAlign: 'center', color: '#cbd5e1', fontSize: '12px' }}>
                  <Camera size={34} color="#38bdf8" style={{ marginBottom: '10px' }} />
                  <p style={{ margin: '0 0 14px', lineHeight: 1.5 }}>{cameraError}</p>
                  <label
                    className="btn primary"
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Camera size={16} />
                    <span>{uploading ? 'Uploading...' : 'Open Device Rear Camera'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFallbackCameraInput(cameraModalType, e)}
                    />
                  </label>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', maxHeight: '380px', objectFit: 'cover', display: 'block' }}
                  />
                  {!cameraReady && (
                    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(2,6,23,0.7)', fontSize: '12px', color: '#cbd5e1' }}>
                      Starting rear camera...
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: '#0f172a', borderTop: '1px solid #1e293b', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '11px', color: '#93c5fd', cursor: 'pointer', fontWeight: 600 }}>
                Device Camera Fallback
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFallbackCameraInput(cameraModalType, e)}
                />
              </label>

              <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                <button type="button" className="btn outline" onClick={closeCameraModal} style={{ background: '#1e293b', borderColor: '#334155', color: '#e2e8f0' }}>
                  Done
                </button>
                {!cameraError && (
                  <button
                    type="button"
                    className="btn primary"
                    disabled={!cameraReady || uploading}
                    onClick={handleCaptureFromLiveCamera}
                  >
                    <Camera size={16} />
                    {uploading ? 'Uploading...' : `Capture Photo (${activeCameraCount + 1}/${REQUIRED_QA_COUNT})`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Propose Upsell Modal */}
      {upsellModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="panel" style={{ width: '100%', maxWidth: '480px', padding: '24px', backgroundColor: '#fff', borderRadius: '12px' }}>
            <h2 style={{ marginTop: 0 }}>Propose Inspection Upsell</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Request customer authorization for extra stain removal or unbooked heavy cleaning discovered during on-site inspection.
            </p>

            <form onSubmit={handleProposeUpsell}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Extra Cleaning Reason</label>
                <input
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="e.g. Heavy mud caked on undercarriage, pet hair extraction"
                  value={upsellReason}
                  onChange={(e) => setUpsellReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Additional Fee (EGP)</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={upsellPrice}
                  onChange={(e) => setUpsellPrice(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn outline" onClick={() => setUpsellModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary">Send to Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
