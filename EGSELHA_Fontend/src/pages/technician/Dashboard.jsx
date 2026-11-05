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
  CheckCircle2
} from 'lucide-react'

import PageTitle from '../../component/PageTitle'
import Stat from '../../component/Stat'
import Status from '../../component/Status'
import { useTech } from '../../context/TechnicianContext'
import { jobPath } from '../../data/jobs'
import { technicianApi } from '../../services/technicianApi'

export default function Dashboard() {
  const navigate = useNavigate()
  const { notify,profile } = useTech()
  const [dashboard, setDashboard] = useState(null)
  const [loadingDash, setLoadingDash] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await technicianApi.getDashboard()
        setDashboard(data)
      } catch (error) {
        console.error('Dashboard API Error:', error)
      } finally {
        setLoadingDash(false)
      }
    }
    fetchDashboard()
  }, [])

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
