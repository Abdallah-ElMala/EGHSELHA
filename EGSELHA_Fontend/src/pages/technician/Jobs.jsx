import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Search, SlidersHorizontal, BriefcaseBusiness, CarFront, MapPin, Clock3, ChevronRight, BellRing, Check, X, RefreshCw, Eye } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import Status from '../../component/Status'
import OrderCarBadge from '../../component/OrderCarBadge'
import CustomerPublicProfileModal from '../../component/CustomerPublicProfileModal'
import { useTech } from '../../context/TechnicianContext'
import { jobPath } from '../../data/jobs'
import { getOfferRemainingSeconds, clearOfferDeadline, formatOfferCountdown } from '../../utils/offerTimer'

const filters = ['All', 'Upcoming', 'On The Way', 'Arrived', 'In Progress', 'Completed']

export default function Jobs() {
  const navigate = useNavigate()
  const { jobs, offers, acceptOffer, passOffer, refreshData, notify } = useTech()
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [profileModalCustomer, setProfileModalCustomer] = useState(null)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const filterRefs = useRef({})

  useEffect(() => {
    if (!offers || offers.length === 0) return
    setNowMs(Date.now())
    const timer = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [offers?.length])
  const [filterPill, setFilterPill] = useState({ left: 4, width: 0, ready: false })

  useEffect(() => {
    const syncFilterPill = () => {
      const el = filterRefs.current[filter]
      if (el) setFilterPill({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
    }
    syncFilterPill()
    window.addEventListener('resize', syncFilterPill)
    return () => window.removeEventListener('resize', syncFilterPill)
  }, [filter])

  useEffect(() => {
    refreshData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setRefreshing(false)
  }

  const handleAccept = async (offer) => {
    try {
      clearOfferDeadline(offer.id)
      const res = await acceptOffer(offer.id)
      const target = res?.bookingNumber || offer.bookingNumber
      notify(`Job ${target} accepted! Opening job details...`)
      navigate(jobPath(target))
    } catch (err) {
      console.error(err)
      notify('Failed to accept job offer.')
    }
  }

  const handlePass = async (offer) => {
    try {
      clearOfferDeadline(offer.id)
      await passOffer(offer.id)
      notify(`Job offer ${offer.bookingNumber} passed.`)
    } catch (err) {
      console.error(err)
      notify('Failed to decline job offer.')
    }
  }

  const visibleJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return jobs.filter((j) => {
      const matchesFilter = filter === 'All' || j.status === filter
      const matchesSearch =
        !q ||
        j.id?.toLowerCase().includes(q) ||
        j.customer?.toLowerCase().includes(q) ||
        j.service?.toLowerCase().includes(q) ||
        j.car?.toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [jobs, filter, searchQuery])

  return (
    <>
      <PageTitle
        eyebrow="WORKSPACE / JOBS"
        title="My Jobs"
        desc="All your assigned bookings and incoming customer job requests in one place."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={15} /> {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button className="btn primary" onClick={() => setFilter('Upcoming')}>
              <CalendarDays size={16} /> Upcoming jobs
            </button>
          </div>
        }
      />

      {/* Pending Customer Booking Offers waiting for Technician acceptance */}
      {offers && offers.length > 0 && (
        <div style={{ marginBottom: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="lx-enter"
              style={{
                padding: '20px 22px',
                borderRadius: '16px',
                background: 'var(--obsidian)',
                color: 'var(--ivory)',
                border: '1px solid rgba(198, 146, 73, 0.42)',
                boxShadow: '0 12px 30px rgba(14, 14, 16, 0.16)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(198, 146, 73, 0.16)', border: '1px solid rgba(198, 146, 73, 0.34)', color: 'var(--bronze-dark)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <BellRing size={19} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <b style={{ color: 'var(--ivory)', fontSize: '15px', fontWeight: 600 }}>
                      New Booking Request ({offer.bookingNumber})
                    </b>
                    <span className="mono-num" style={{ fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '999px', background: 'rgba(134, 239, 172, 0.14)', color: '#86efac' }}>
                      Total: EGP {offer.totalPrice ?? offer.payoutAmount}
                    </span>
                    <span className="mono-num" style={{ fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '999px', background: 'rgba(198, 146, 73, 0.16)', color: '#f3d299' }}>
                      Your 70% Share: EGP {offer.payoutAmount}
                    </span>
                    {(() => {
                      const rem = getOfferRemainingSeconds(offer, nowMs)
                      return (
                        <span
                          className="mono-num"
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            background: rem <= 120 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 243, 238, 0.1)',
                            border: `1px solid ${rem <= 120 ? 'rgba(239, 68, 68, 0.48)' : 'rgba(198, 146, 73, 0.35)'}`,
                            color: rem <= 120 ? '#fca5a5' : '#f3d299',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Clock3 size={12} /> {formatOfferCountdown(rem)} left
                        </span>
                      )
                    })()}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--ivory-secondary)' }}>
                    {offer.serviceName} · {offer.customerName} ({offer.vehicleModel}) · {offer.customerAddress}
                    {offer.addOnNames?.length > 0 && ` · Add-Ons: ${offer.addOnNames.join(', ')}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="lx-btn lx-glass-btn lx-glass-crystal"
                  onClick={() => setProfileModalCustomer(offer)}
                  style={{ minHeight: '38px', padding: '0 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={14} /> Customer
                </button>
                <button
                  className="lx-btn lx-glass-btn lx-glass-crystal"
                  onClick={() => handlePass(offer)}
                  style={{ minHeight: '38px', padding: '0 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <X size={14} /> Pass
                </button>
                <button
                  className="lx-btn lx-glass-btn lx-glass-gold"
                  onClick={() => handleAccept(offer)}
                  style={{ minHeight: '38px', padding: '0 18px', borderRadius: '999px', fontSize: '12.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Check size={14} /> Accept Job
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel jobs-list-panel">
        <div className="filter-row" style={{ gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              background: 'var(--alabaster-raised)',
              padding: '4px',
              borderRadius: '999px',
              border: '1px solid var(--hairline-light)'
            }}
          >
            {filterPill.ready && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '4px',
                  bottom: '4px',
                  left: 0,
                  width: `${filterPill.width}px`,
                  transform: `translateX(${filterPill.left}px)`,
                  borderRadius: '999px',
                  background: '#ffffff',
                  border: '1px solid rgba(24, 24, 27, 0.12)',
                  boxShadow: '0 2px 8px rgba(24, 24, 27, 0.08)',
                  transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              />
            )}
            {filters.map((f) => (
              <button
                key={f}
                ref={(el) => { filterRefs.current[f] = el }}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  padding: '6px 13px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: filter === f ? 600 : 500,
                  color: filter === f ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                  cursor: 'pointer',
                  transition: 'color 200ms var(--ease-luxury)'
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="filter-search" style={{ borderRadius: '999px', padding: '7px 14px', background: '#ffffff' }}>
            <Search size={15} />
            <input
              placeholder="Search booking or customer"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '12.5px', width: '170px' }}
            />
          </div>
          <button className="icon-btn border"><SlidersHorizontal size={17} /></button>
        </div>

        {visibleJobs.length === 0 ? (
          <div className="empty-state">
            <BriefcaseBusiness size={35} />
            <h3>No jobs found</h3>
            <p>There are no bookings in this category right now.</p>
          </div>
        ) : (
          visibleJobs.map((j) => (
            <div className="full-job-row" key={j.id}>
              <div className="car-thumb" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <OrderCarBadge size={48} />
              </div>
              <div className="full-job-info">
                <div className="job-line">
                  <b>{j.service}</b>
                  <Status value={j.status} />
                  {(j.isAccepted || j.bookingStatus === 'DISPATCHED') && j.status !== 'Completed' && (
                    <Status value="Accepted" />
                  )}
                </div>
                <span>
                  {j.id} ·{' '}
                  <b
                    onClick={() => setProfileModalCustomer(j)}
                    style={{ color: '#141415', cursor: 'pointer', textDecoration: 'underline' }}
                    title="Click to show customer profile"
                  >
                    {j.customer}
                  </b>
                  {' '}· {j.car}
                  {j.addOnNames?.length > 0 ? ` · +${j.addOnNames.length} Add-On${j.addOnNames.length > 1 ? 's' : ''}` : ''}
                </span>
                <small><MapPin size={13} />{j.address} <Clock3 size={13} />{j.time}</small>
              </div>
              <div className="job-price"><b>EGP {j.price}</b><small>{j.date}</small></div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn soft sm"
                  onClick={() => setProfileModalCustomer(j)}
                >
                  <Eye size={14} /> Show Profile
                </button>
                <button className="btn outline sm" onClick={() => navigate(jobPath(j.id))}>
                  View details <ChevronRight size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Read-Only Customer Profile Modal */}
      <CustomerPublicProfileModal
        customerData={profileModalCustomer}
        onClose={() => setProfileModalCustomer(null)}
      />
    </>
  )
}
