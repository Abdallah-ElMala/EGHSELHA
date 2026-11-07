import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Phone, Navigation, CarFront, CheckCircle2, Check, MapPin, Camera, AlertCircle, PlusCircle, Clock, CheckCircle } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import Status from '../../component/Status'
import { useTech } from '../../context/TechnicianContext'
import { technicianApi } from '../../services/technicianApi'

export default function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { jobs, updateStatus, notify } = useTech()
  const job = jobs.find((j) => j.id === id)

  // State for QA Photos
  const [qaPhotos, setQaPhotos] = useState([])
  const [uploading, setUploading] = useState(false)

  // State for Inspection Upsell Modal
  const [upsellModalOpen, setUpsellModalOpen] = useState(false)
  const [upsellReason, setUpsellReason] = useState('')
  const [upsellPrice, setUpsellPrice] = useState(150)
  const [activeUpsell, setActiveUpsell] = useState(null)

  useEffect(() => {
    if (job?.id) {
      // Fetch existing photos and upsells from API
      technicianApi.getQAPhotos(job.id)
        .then((photos) => { if (Array.isArray(photos)) setQaPhotos(photos) })
        .catch(console.error)

      technicianApi.getUpsell(job.id)
        .then((upsell) => { if (upsell) setActiveUpsell(upsell) })
        .catch(console.error)
    }
  }, [job?.id])

  if (!job) return <div className="empty-state">Job not found.</div>

  const reached = (list) => (list.includes(job.status) ? 'completed' : '')

  const handlePhotoUpload = async (photoType, category, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const payload = {
          photoType: photoType === 'BEFORE' ? 0 : 1, // 0: BEFORE, 1: AFTER
          category: 0, // FRONT
          imageUrl: reader.result,
          gpsLatitude: 30.0561,
          gpsLongitude: 31.3414
        }
        const saved = await technicianApi.uploadQAPhoto(job.id, payload)
        setQaPhotos((prev) => [...prev, saved])
        notify(`Uploaded ${photoType.toLowerCase()} photo (${category}) successfully!`)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error(err)
      notify('Failed to upload QA photo.')
    } finally {
      setUploading(false)
    }
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

  const beforePhotos = qaPhotos.filter((p) => String(p.photoType).toUpperCase() === 'BEFORE' || p.photoType === 0)
  const afterPhotos = qaPhotos.filter((p) => String(p.photoType).toUpperCase() === 'AFTER' || p.photoType === 1)

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
            <Status value={job.status} />
          </div>

          <div className="detail-customer">
            <div className="customer-avatar large">{job.customer.split(' ').map((x) => x[0]).join('')}</div>
            <div><b>{job.customer}</b><small>{job.phone}</small></div>
            <button className="soft-btn" onClick={() => notify('Calling customer (demo).')}><Phone size={15} /> Call</button>
          </div>

          <div className="detail-sections">
            <div><span>Service package</span><b>{job.service}</b></div>
            <div><span>Vehicle</span><b>{job.car}</b></div>
            <div><span>Date & time</span><b>{job.date} · {job.time}</b></div>
            <div><span>Service price</span><b>EGP {job.price}</b></div>
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
            <div className="step completed"><i><Check /></i><span>Assigned</span></div>
            <div className={`step ${reached(['On The Way', 'Arrived', 'In Progress', 'Completed'])}`}><i>2</i><span>On the way</span></div>
            <div className={`step ${reached(['Arrived', 'In Progress', 'Completed'])}`}><i>3</i><span>Arrived</span></div>
            <div className={`step ${reached(['In Progress', 'Completed'])}`}><i>4</i><span>In progress</span></div>
            <div className={`step ${reached(['Completed'])}`}><i>5</i><span>Completed</span></div>
          </div>

          <div className="action-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {job.status === 'Upcoming' && (
              <button className="btn primary" onClick={() => updateStatus(job.id, 'On The Way')}>
                Start navigation <Navigation size={16} />
              </button>
            )}

            {job.status === 'On The Way' && (
              <button className="btn primary" onClick={async () => {
                await technicianApi.markArrived(job.id)
                updateStatus(job.id, 'Arrived')
                notify('Marked arrived at location. Please take 4 before photos!')
              }}>
                <MapPin size={16} /> Mark Arrived
              </button>
            )}

            {job.status === 'Arrived' && (
              <>
                <button className="btn primary" onClick={() => updateStatus(job.id, 'In Progress')}>
                  Start washing <CarFront size={16} />
                </button>
                <button className="btn outline" onClick={() => setUpsellModalOpen(true)}>
                  <PlusCircle size={16} /> Propose Upsell
                </button>
              </>
            )}

            {job.status === 'In Progress' && (
              <>
                <button className="btn primary" onClick={() => updateStatus(job.id, 'Completed')}>
                  Complete job <CheckCircle2 size={16} />
                </button>
                <button className="btn outline" onClick={() => setUpsellModalOpen(true)}>
                  <PlusCircle size={16} /> Propose Upsell
                </button>
              </>
            )}

            {job.status === 'Completed' && (
              <span className="completed-note"><CheckCircle2 /> This job is completed.</span>
            )}
          </div>
        </div>

        <div className="detail-side">
          <div className="panel">
            <div className="panel-head">
              <div><h2>Customer location</h2><p>{job.address}</p></div>
            </div>
            <div className="map-art tall">
              <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
              <div className="map-park park-one" />
              <div className="map-pin pin-a"><MapPin size={28} fill="currentColor" /></div>
              <div className="map-label label-a">Destination</div>
            </div>
            <button className="btn primary full" onClick={() => notify('Directions will open in Maps.')}>
              <Navigation size={16} /> Get directions
            </button>
          </div>

          {/* Mandatory QA Photos Panel (4 Before & 4 After) */}
          <div className="panel upload-panel">
            <div className="panel-head">
              <div>
                <h2>Mandatory QA Photos</h2>
                <p>Upload 4 before & 4 after photos (Front, Back, Interior, Trunk)</p>
              </div>
            </div>
            <div className="photo-slots">
              <label className="photo-slot">
                <Camera />
                <b>Before Photos ({beforePhotos.length}/4)</b>
                <small>{uploading ? 'Uploading...' : 'Click to add photo'}</small>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload('BEFORE', 'Front/Back', e)}
                />
              </label>

              <label className="photo-slot">
                <Camera />
                <b>After Photos ({afterPhotos.length}/4)</b>
                <small>{uploading ? 'Uploading...' : 'Click to add photo'}</small>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload('AFTER', 'Clean Result', e)}
                />
              </label>
            </div>

            {qaPhotos.length > 0 && (
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {qaPhotos.map((p, idx) => (
                  <div key={idx} style={{ padding: '4px 8px', borderRadius: '6px', background: '#f1f5f9', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={12} color="#16a34a" /> {p.photoType || 'QA'} #{idx + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
