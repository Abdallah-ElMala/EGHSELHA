import { useNavigate, useParams } from 'react-router-dom'
import { Phone, Navigation, CarFront, CheckCircle2, Check, MapPin, Camera } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import Status from '../../component/Status'
import { useTech } from '../../context/TechnicianContext'

export default function JobDetails() {
  const { id } = useParams() // React Router بيعمل decode تلقائي
  const navigate = useNavigate()
  const { jobs, updateStatus, notify } = useTech()
  const job = jobs.find((j) => j.id === id)

  if (!job) return <div className="empty-state">Job not found.</div>

  const reached = (list) => (list.includes(job.status) ? 'completed' : '')

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

          <h3 className="section-title">Job progress</h3>
          <div className="progress-steps">
            <div className="step completed"><i><Check /></i><span>Assigned</span></div>
            <div className={`step ${reached(['On The Way', 'In Progress', 'Completed'])}`}><i>2</i><span>On the way</span></div>
            <div className={`step ${reached(['In Progress', 'Completed'])}`}><i>3</i><span>In progress</span></div>
            <div className={`step ${reached(['Completed'])}`}><i>4</i><span>Completed</span></div>
          </div>

          <div className="action-row">
            {job.status === 'Upcoming' && (
              <button className="btn primary" onClick={() => updateStatus(job.id, 'On The Way')}>
                Start navigation <Navigation size={16} />
              </button>
            )}
            {job.status === 'On The Way' && (
              <button className="btn primary" onClick={() => updateStatus(job.id, 'In Progress')}>
                Start washing <CarFront size={16} />
              </button>
            )}
            {job.status === 'In Progress' && (
              <button className="btn primary" onClick={() => updateStatus(job.id, 'Completed')}>
                Complete job <CheckCircle2 size={16} />
              </button>
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
            <button className="btn primary full" onClick={() => notify('Directions will open when maps are connected.')}>
              <Navigation size={16} /> Get directions
            </button>
          </div>

          <div className="panel upload-panel">
            <div className="panel-head">
              <div><h2>Before & after photos</h2><p>Upload proof of your work</p></div>
            </div>
            <div className="photo-slots">
              <label className="photo-slot">
                <Camera /><b>Before photos</b><small>Upload images</small>
                <input type="file" accept="image/*" multiple onChange={() => notify('Before photos selected (demo).')} />
              </label>
              <label className="photo-slot">
                <Camera /><b>After photos</b><small>Upload images</small>
                <input type="file" accept="image/*" multiple onChange={() => notify('After photos selected (demo).')} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
