import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  CircleDollarSign,
  Star,
  Clock3,
  ChevronRight,
  MapPin,
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
import { getOfferRemainingSeconds, clearOfferDeadline, formatOfferCountdown } from '../../utils/offerTimer'

export default function Dashboard() {
  const navigate = useNavigate()
  const { notify, profile, jobs, offers, acceptOffer, passOffer, refreshData } = useTech()
  const [dashboard, setDashboard] = useState(null)
  const [loadingDash, setLoadingDash] = useState(true)
  const [timeRange, setTimeRange] = useState('this_week')

  // Persistent wall-clock 30-minute Job Offer countdown (survives route switches & tab close)
  const activeOffer = offers && offers.length > 0 ? offers[0] : null
  const [nowMs, setNowMs] = useState(() => Date.now())
  const secondsLeft = activeOffer ? getOfferRemainingSeconds(activeOffer, nowMs) : 0

  useEffect(() => {
    let mounted = true
    const fetchDashboard = async () => {
      try {
        const data = await technicianApi.getDashboard()
        if (mounted) setDashboard(data)
      } catch (error) {
        console.error('Dashboard API Error:', error)
      } finally {
        if (mounted) setLoadingDash(false)
      }

      // Ping real-time GPS location in background (non-blocking)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => technicianApi.updateLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {}),
          () => technicianApi.updateLocation(30.0226, 31.0031).catch(() => {}),
          { timeout: 3000 }
        )
      } else {
        technicianApi.updateLocation(30.0226, 31.0031).catch(() => {})
      }
    }
    fetchDashboard()
    return () => { mounted = false }
  }, [])

  // Keep dashboard stats/jobs synced when context jobs update via polling
  useEffect(() => {
    technicianApi.getDashboard().then(setDashboard).catch(() => {})
  }, [jobs.length, offers.length])

  // Real wall-clock 1s ticker (never resets on route change or tab close)
  useEffect(() => {
    if (!activeOffer) return
    setNowMs(Date.now())
    const timer = setInterval(() => {
      const current = Date.now()
      setNowMs(current)
      if (getOfferRemainingSeconds(activeOffer, current) <= 0) {
        clearInterval(timer)
        handlePassOffer(true)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [activeOffer?.id])

  const handleAcceptOffer = async () => {
    if (!activeOffer) return
    try {
      clearOfferDeadline(activeOffer.id)
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
      clearOfferDeadline(activeOffer.id)
      await passOffer(activeOffer.id)
      notify(isAutoExpired ? 'Job offer expired (30 min limit reached).' : 'Job offer declined.')
    } catch (err) {
      console.error(err)
    }
  }

  if (loadingDash) {
    return <div className="empty-state"><p>Loading dashboard…</p></div>
  }
 
  const todayJobs = dashboard?.todayJobs ?? []

  // Build 100% real performance metrics from actual backend jobs & dashboard API
  const completedJobsList = (jobs || []).filter(
    (j) => String(j.status || '').toLowerCase() === 'completed'
  )

  const parseJobDate = (j) => {
    const raw = j.scheduledAt || j.completedAt || j.date
    if (!raw) return null
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const buildDailySeries = (daysOffsetEnd) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const result = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysOffsetEnd - i)
      const count = completedJobsList.filter((j) => {
        const d = parseJobDate(j)
        return (
          d &&
          d.getFullYear() === target.getFullYear() &&
          d.getMonth() === target.getMonth() &&
          d.getDate() === target.getDate()
        )
      }).length
      result.push({ day: dayNames[target.getDay()], completedJobs: count })
    }
    return result
  }

  const buildMonthlySeries = () => {
    const now = new Date()
    return [3, 2, 1, 0].map((weekIdx, idx) => {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekIdx * 7, 23, 59, 59)
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (weekIdx + 1) * 7 + 1, 0, 0, 0)
      const count = completedJobsList.filter((j) => {
        const d = parseJobDate(j)
        return d && d >= start && d <= end
      }).length
      return { day: `Week ${idx + 1}`, completedJobs: count }
    })
  }

  const apiWeekly = Array.isArray(dashboard?.weeklyPerformance) && dashboard.weeklyPerformance.length > 0
    ? dashboard.weeklyPerformance
    : null

  const currentWeekly =
    timeRange === 'this_week'
      ? (apiWeekly ?? buildDailySeries(0))
      : timeRange === 'last_week'
        ? buildDailySeries(7)
        : buildMonthlySeries()

  const totalInRange = currentWeekly.reduce((sum, w) => sum + (w.completedJobs || 0), 0)
  const maxCompleted = Math.max(...currentWeekly.map((w) => w.completedJobs || 0), 0)
  const maxJobs = Math.max(Math.ceil((maxCompleted || 4) / 4) * 4, 4)

  return (
    <>
      <PageTitle
        eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase()}
        title={`Good morning, ${profile?.name ?? 'Technician'}`}
        desc="Here is your live dispatch overview and today's assigned detailing schedule."
        action={
          <button
            className="btn primary"
            onClick={() => navigate('/technician/jobs')}
          >
            <BriefcaseBusiness size={15} /> View all jobs
          </button>
        }
      />

      {/* 45-Second Dispatched Job Offer Alert (High-Contrast Obsidian & Champagne Gold) */}
      {activeOffer && (
        <div
          className="lx-enter"
          style={{
            margin: '0 0 24px 0',
            padding: '22px 24px',
            borderRadius: '18px',
            background: 'var(--obsidian)',
            color: 'var(--ivory)',
            border: '1px solid rgba(198, 146, 73, 0.42)',
            boxShadow: '0 16px 38px rgba(14, 14, 16, 0.22)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  background: 'rgba(198, 146, 73, 0.16)',
                  border: '1px solid rgba(198, 146, 73, 0.36)',
                  color: 'var(--bronze-dark)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                <BellRing size={20} />
              </div>
              <div>
                <b style={{ color: 'var(--ivory)', fontSize: '16px', fontWeight: 600, display: 'block' }}>
                  Fast-Track Dispatch · {activeOffer.bookingNumber}
                </b>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--ivory-secondary)' }}>
                  {activeOffer.serviceName} · {activeOffer.vehicleModel} · {activeOffer.customerAddress} ({activeOffer.distanceText})
                </p>
                {activeOffer.addOnNames?.length > 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--bronze-dark)', fontWeight: 500 }}>
                    Add-Ons: {activeOffer.addOnNames.join(' · ')} (+EGP {activeOffer.addOnsSubtotal})
                  </p>
                )}
              </div>
            </div>

            <div
              className="mono-num"
              style={{
                background: secondsLeft <= 120 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(198, 146, 73, 0.16)',
                border: `1px solid ${secondsLeft <= 120 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(198, 146, 73, 0.4)'}`,
                color: secondsLeft <= 120 ? '#fca5a5' : '#f3d299',
                padding: '6px 14px',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Clock3 size={15} /> {formatOfferCountdown(secondsLeft)} left
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--hairline-dark)', paddingTop: '14px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--ivory-secondary)' }}>Booking Total:</span>
                <span className="mono-num" style={{ marginLeft: '6px', fontSize: '18px', fontWeight: 600, color: 'var(--ivory)' }}>
                  EGP {activeOffer.totalPrice ?? activeOffer.payoutAmount}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--ivory-secondary)' }}>
                Deposit Paid: <b style={{ color: '#86efac' }}>EGP {activeOffer.depositAmount ?? 200}</b> · Remaining: <b style={{ color: 'var(--ivory)' }}>EGP {activeOffer.remainingBalance ?? 0}</b>
              </div>
              <div style={{ fontSize: '12.5px', color: '#f3d299', fontWeight: 600 }}>
                Your Tech Share (70%): <span className="mono-num">EGP {activeOffer.payoutAmount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="lx-btn lx-glass-btn lx-glass-crystal"
                onClick={() => handlePassOffer(false)}
                style={{ minHeight: '40px', padding: '0 18px', borderRadius: '999px', fontSize: '13px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <X size={15} /> Pass
              </button>
              <button
                className="lx-btn lx-glass-btn lx-glass-gold"
                onClick={handleAcceptOffer}
                style={{ minHeight: '40px', padding: '0 22px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={15} /> Accept Job
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

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
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
      </div>

      <div className="lower-grid" style={{ gridTemplateColumns: '1fr' }}>
        <section className="panel performance">
          <div className="panel-head">
            <div>
              <h2>Weekly performance</h2>
              <p>
                {timeRange === 'this_week' && 'Your completed jobs this week'}
                {timeRange === 'last_week' && 'Your completed jobs last week'}
                {timeRange === 'last_month' && 'Your completed jobs past 30 days'}
              </p>
            </div>

            <select
              aria-label="Performance range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="select-like"
              style={{
                cursor: 'pointer',
                outline: 'none',
                border: '1px solid #dce6ef',
                borderRadius: '8px',
                padding: '6px 12px',
                background: '#fff',
                color: '#30495e',
                fontWeight: 700,
                fontSize: '11px'
              }}
            >
              <option value="this_week">This week</option>
              <option value="last_week">Last week</option>
              <option value="last_month">Last 30 days</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '12.5px', color: 'var(--ink-secondary)' }}>
            <span>
              Total completed in range:{' '}
              <strong className="mono-num" style={{ color: 'var(--ink-primary)' }}>{totalInRange}</strong>
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--ink-muted)' }}>Live database figures</span>
          </div>

          <div
            style={{
              height: '190px',
              display: 'grid',
              gridTemplateColumns: `repeat(${currentWeekly.length}, minmax(0, 1fr))`,
              gap: '14px',
              alignItems: 'end',
              padding: '18px 12px 10px',
              background: 'var(--alabaster)',
              borderRadius: '14px',
              border: '1px solid var(--hairline-light)'
            }}
          >
            {currentWeekly.map((w, idx) => {
              const count = w.completedJobs || 0
              const pct = count === 0 ? 4 : Math.max(12, Math.round((count / maxJobs) * 100))
              return (
                <div
                  key={`${w.day}-${idx}`}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span
                    className="mono-num"
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: count > 0 ? 'var(--ink-primary)' : 'var(--ink-muted)'
                    }}
                  >
                    {count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '46px',
                      height: `${pct}%`,
                      borderRadius: '8px 8px 4px 4px',
                      background:
                        count > 0
                          ? 'linear-gradient(180deg, #cf9d54 0%, #a67c37 100%)'
                          : 'rgba(24, 24, 27, 0.08)',
                      transition: 'height 360ms cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                  />
                  <span style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--ink-secondary)' }}>
                    {w.day}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}
