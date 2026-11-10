import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  CircleDollarSign,
  Star,
  Clock3,
  ChevronRight,
  MapPin,
  Navigation,
  CheckCircle2,
  BellRing,
  Check,
  X
} from 'lucide-react'

import PageTitle from '../../component/PageTitle'
import Stat from '../../component/Stat'
import Status from '../../component/Status'
import { useTech } from '../../context/TechnicianContext'
import { jobPath } from '../../data/jobs'
import { technicianApi } from '../../services/technicianApi'

export default function Dashboard() {
  const navigate = useNavigate()
  const { notify, profile, jobs, offers, acceptOffer, passOffer, refreshData } = useTech()
  const [dashboard, setDashboard] = useState(null)
  const [loadingDash, setLoadingDash] = useState(true)

  // 45-Second Job Offer Dispatch state
  const activeOffer = offers && offers.length > 0 ? offers[0] : null
  const [secondsLeft, setSecondsLeft] = useState(45)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [data] = await Promise.all([
          technicianApi.getDashboard(),
          refreshData()
        ])
        setDashboard(data)

        // Ping real-time GPS location (behavior: updateGPSLocation)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => technicianApi.updateLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {}),
            () => technicianApi.updateLocation(30.0561, 31.3414).catch(() => {}),
            { timeout: 3000 }
          )
        } else {
          await technicianApi.updateLocation(30.0561, 31.3414).catch(() => {})
        }
      } catch (error) {
        console.error('Dashboard API Error:', error)
      } finally {
        setLoadingDash(false)
      }
    }
    fetchDashboard()
  }, [])

  // Keep dashboard stats/jobs synced when context jobs update via polling
  useEffect(() => {
    technicianApi.getDashboard().then(setDashboard).catch(() => {})
  }, [jobs.length, offers.length])

  useEffect(() => {
    if (activeOffer) {
      setSecondsLeft(activeOffer.remainingSeconds || 45)
    }
  }, [activeOffer?.id])

  // 45-second timer countdown
  useEffect(() => {
    if (!activeOffer || secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handlePassOffer(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [activeOffer?.id, secondsLeft])

  const handleAcceptOffer = async () => {
    if (!activeOffer) return
    try {
      const res = await acceptOffer(activeOffer.id)
      const targetBooking = res?.bookingNumber || activeOffer.bookingNumber
      notify(`Job Offer ${targetBooking} accepted! Navigating to job details...`)
      navigate(`/technician/jobs/${encodeURIComponent(targetBooking)}`)
    } catch (err) {
      console.error(err)
      notify('Failed to accept job offer.')
    }
  }

  const handlePassOffer = async (isAutoExpired = false) => {
    if (!activeOffer) return
    try {
      await passOffer(activeOffer.id)
      notify(isAutoExpired ? 'Job offer expired (45s limit reached).' : 'Job offer declined.')
    } catch (err) {
      console.error(err)
    }
  }

  if (loadingDash) {
    return <div className="empty-state"><p>Loading dashboard…</p></div>
  }
 
  const todayJobs = dashboard?.todayJobs ?? []
  const next = dashboard?.nextCustomer ?? null
  const weekly = dashboard?.weeklyPerformance ?? []
  const checklist = dashboard?.checklist ?? []
  const doneCount = checklist.filter((c) => c.status === 'Done').length

  // Derive initials for next customer avatar
  const nextInitials = next?.customer
    ? next.customer.split(' ').map((x) => x[0]).join('').slice(0, 2)
    : ''

  // Weekly chart: map completedJobs to y positions (170 = bottom, 10 = top)
  const maxJobs = Math.max(...weekly.map((w) => w.completedJobs), 1)

  return (
    <>
      <PageTitle
        eyebrow="TUESDAY, NOVEMBER 03, 2026"
        title={`Good morning, ${profile?.name ?? ' Technician'}`}
        desc="Here's what's happening with your work today."
        action={
          <button
            className="btn primary"
            onClick={() => navigate('/technician/jobs')}
          >
            <BriefcaseBusiness size={16} /> View all jobs
          </button>
        }
      />

      {/* 45-Second Dispatched Job Offer Alert */}
      {activeOffer && (
        <div style={{
          margin: '0 0 24px 0',
          padding: '20px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
          border: '2px solid #3b82f6',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#2563eb',
                color: '#fff',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 1.5s infinite'
              }}>
                <BellRing size={20} />
              </div>
              <div>
                <b style={{ color: '#1e3a8a', fontSize: '1.1rem' }}>⚡ Fast-Track Dispatch: New Job Offer ({activeOffer.bookingNumber})</b>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1d4ed8' }}>
                  {activeOffer.serviceName} · {activeOffer.vehicleModel} · {activeOffer.customerAddress} ({activeOffer.distanceText})
                </p>
                {activeOffer.addOnNames?.length > 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#0369a1', fontWeight: 600 }}>
                    Add-Ons: {activeOffer.addOnNames.join(' · ')} (+EGP {activeOffer.addOnsSubtotal})
                  </p>
                )}
              </div>
            </div>

            <div style={{
              background: secondsLeft <= 10 ? '#ef4444' : '#2563eb',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Clock3 size={16} /> {secondsLeft}s left
            </div>
          </div>

          {/* Offer details & CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #bfdbfe', paddingTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Booking Total:</span>
                <span style={{ marginLeft: '6px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  EGP {activeOffer.totalPrice ?? activeOffer.payoutAmount}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                Deposit Paid: <b style={{ color: '#16a34a' }}>EGP {activeOffer.depositAmount ?? 200}</b> · Remaining: <b>EGP {activeOffer.remainingBalance ?? 0}</b>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 700 }}>
                Your Tech Share (70%): EGP {activeOffer.payoutAmount}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn outline"
                style={{ borderColor: '#94a3b8', color: '#475569' }}
                onClick={() => handlePassOffer(false)}
              >
                <X size={16} /> Pass
              </button>
              <button
                className="btn primary"
                style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                onClick={handleAcceptOffer}
              >
                <Check size={16} /> Accept Job ({secondsLeft}s)
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="stats-grid">
        <Stat
          icon={BriefcaseBusiness}
          label="Jobs today"
          value={String(dashboard?.jobsToday ?? 0)}
          change={dashboard?.jobsTodayChange ?? ''}
        />

        <Stat
          icon={CircleDollarSign}
          label="Today's earnings"
          value={`EGP ${dashboard?.todayEarnings ?? 0}`}
          change={dashboard?.todayEarningsChange ?? ''}
          tone="green"
        />

        <Stat
          icon={Star}
          label="Your rating"
          value={`${dashboard?.rating ?? 0} / 5`}
          change={`From ${dashboard?.reviewCount ?? 0} reviews`}
          tone="yellow"
        />

        <Stat
          icon={Clock3}
          label="Hours worked"
          value={`${dashboard?.hoursWorked ?? 0} hrs`}
          change="On track today"
          tone="purple"
        />
      </section>

      <div className="dashboard-grid">
        <section className="panel jobs-panel">
          <div className="panel-head">
            <div>
              <h2>Today's jobs</h2>
              <p>Manage your assigned bookings</p>
            </div>

            <button
              className="text-btn"
              onClick={() => navigate('/technician/jobs')}
            >
              See all <ChevronRight size={15} />
            </button>
          </div>

          {todayJobs.map((job) => (
            <div className="job-row" key={job.id}>
              <div className="job-date">
                <b>{job.time.split(' ')[0]}</b>
                <small>
                  {job.time.includes('PM') ? 'PM' : 'AM'}
                </small>
              </div>

              <div className="job-main">
                <div className="job-line">
                  <b>{job.service}</b>
                  <Status value={job.status} />
                </div>

                <span>
                  {job.id} · {job.customer}
                </span>

                <small>
                  <MapPin size={13} /> {job.address} · {job.distance}
                </small>
              </div>

              <button
                className="round-arrow"
                onClick={() => navigate(jobPath(job.id))}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          ))}

          <div className="panel-foot">
            <span>
              <span className="dot blue-dot" /> {todayJobs.length} assigned jobs
            </span>
            <span>Updated just now</span>
          </div>
        </section>

        <section className="panel map-panel">
          <div className="panel-head">
            <div>
              <h2>Next customer</h2>
              <p>Your upcoming destination</p>
            </div>

            <button
              className="soft-btn"
              onClick={() =>
                notify('Map directions would open here in the connected version.')
              }
            >
              <Navigation size={15} /> Navigate
            </button>
          </div>

          <div className="map-art">
            <div className="map-road road-one" />
            <div className="map-road road-two" />
            <div className="map-road road-three" />

            <div className="map-park park-one" />
            <div className="map-park park-two" />

            <div className="map-pin pin-a">
              <MapPin size={25} fill="currentColor" />
            </div>

            <div className="map-pin pin-b">
              <MapPin size={22} fill="currentColor" />
            </div>

            <div className="map-label label-a">Nasr City</div>
            <div className="map-label label-b">Customer</div>
          </div>

          {next ? (
            <div className="destination">
              <div className="customer-avatar">{nextInitials}</div>

              <div>
                <b>{next.customer}</b>
                <small>{next.car} · {next.service}</small>
              </div>

              <div className="eta">
                <b>{next.eta}</b>
                <small>ETA · {next.distance}</small>
              </div>
            </div>
          ) : (
            <div className="destination">
              <p>No upcoming customer.</p>
            </div>
          )}
        </section>
      </div>

      <div className="lower-grid">
        <section className="panel performance">
          <div className="panel-head">
            <div>
              <h2>Weekly performance</h2>
              <p>Your completed jobs this week</p>
            </div>

            <span className="select-like">This week⌄</span>
          </div>

          <div className="chart">
            <div className="chart-y">
              <span>{maxJobs}</span>
              <span>{Math.round(maxJobs * 0.75)}</span>
              <span>{Math.round(maxJobs * 0.5)}</span>
              <span>{Math.round(maxJobs * 0.25)}</span>
              <span>0</span>
            </div>

            <div className="chart-area">
              <div className="grid-lines">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>

              <svg viewBox="0 0 600 170" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#1687f8" stopOpacity=".22" />
                    <stop offset="1" stopColor="#1687f8" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {weekly.length > 1 && (() => {
                  const pts = weekly.map((w, i) => {
                    const x = (i / (weekly.length - 1)) * 600
                    const y = 10 + (1 - w.completedJobs / maxJobs) * 160
                    return [x, y]
                  })
                  const lineD = `M${pts.map(([x, y]) => `${x} ${y}`).join(' L')}`
                  const areaD = `${lineD} L600,170 L0,170Z`
                  return (
                    <>
                      <path d={areaD} fill="url(#fill)" />
                      <path
                        d={lineD}
                        fill="none"
                        stroke="#1687f8"
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                      />
                    </>
                  )
                })()}
              </svg>

              <div className="chart-x">
                {weekly.map((w) => (
                  <span key={w.day}>{w.day}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel checklist">
          <div className="panel-head">
            <div>
              <h2>Today's checklist</h2>
              <p>Stay ready for every job</p>
            </div>

            <span className="check-count">{doneCount}/{checklist.length}</span>
          </div>

          {checklist.map((item, idx) => (
            <div
              className={`check-item${item.status === 'Done' ? ' done' : ''}`}
              key={idx}
            >
              {item.status === 'Done' ? (
                <CheckCircle2 />
              ) : (
                <span className="empty-check" />
              )}
              <span>{item.title}</span>
              <small>{item.status}</small>
            </div>
          ))}

          <button
            className="btn outline full"
            onClick={() => navigate('/technician/settings')}
          >
            Manage availability
          </button>
        </section>
      </div>
    </>
  )
}
