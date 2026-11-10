import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Search, SlidersHorizontal, BriefcaseBusiness, CarFront, MapPin, Clock3, ChevronRight, BellRing, Check, X, RefreshCw } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import Status from '../../component/Status'
import { useTech } from '../../context/TechnicianContext'
import { jobPath } from '../../data/jobs'

const filters = ['All', 'Upcoming', 'On The Way', 'Arrived', 'In Progress', 'Completed']

export default function Jobs() {
  const navigate = useNavigate()
  const { jobs, offers, acceptOffer, passOffer, refreshData, notify } = useTech()
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

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
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {offers.map((offer) => (
            <div
              key={offer.id}
              style={{
                padding: '18px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
                border: '2px solid #3b82f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <BellRing size={19} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <b style={{ color: '#1e3a8a', fontSize: '14px' }}>
                      New Booking Request ({offer.bookingNumber})
                    </b>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: '#dcfce7', color: '#15803d' }}>
                      Booking Total: EGP {offer.totalPrice ?? offer.payoutAmount}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: '#dbeafe', color: '#1d4ed8' }}>
                      Deposit Paid · Tech Share (70%): EGP {offer.payoutAmount}
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#1e40af' }}>
                    {offer.serviceName} · {offer.customerName} ({offer.vehicleModel}) · {offer.customerAddress}
                    {offer.addOnNames?.length > 0 && ` · Add-Ons: ${offer.addOnNames.join(', ')}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn outline" onClick={() => handlePass(offer)}>
                  <X size={15} /> Pass
                </button>
                <button
                  className="btn primary"
                  style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => handleAccept(offer)}
                >
                  <Check size={15} /> Accept Job
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="panel jobs-list-panel">
        <div className="filter-row">
          {filters.map((f) => (
            <button key={f} className={filter === f ? 'filter active-filter' : 'filter'} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
          <div className="filter-search">
            <Search size={16} />
            <input
              placeholder="Search booking or customer"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <div className="car-thumb"><CarFront size={27} /></div>
              <div className="full-job-info">
                <div className="job-line">
                  <b>{j.service}</b>
                  <Status value={j.status} />
                  {(j.isAccepted || j.bookingStatus === 'DISPATCHED') && j.status !== 'Completed' && (
                    <Status value="Accepted" />
                  )}
                </div>
                <span>
                  {j.id} · {j.customer} · {j.car}
                  {j.addOnNames?.length > 0 ? ` · +${j.addOnNames.length} Add-On${j.addOnNames.length > 1 ? 's' : ''}` : ''}
                </span>
                <small><MapPin size={13} />{j.address} <Clock3 size={13} />{j.time}</small>
              </div>
              <div className="job-price"><b>EGP {j.price}</b><small>{j.date}</small></div>
              <button className="btn outline" onClick={() => navigate(jobPath(j.id))}>
                View details <ChevronRight size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  )
}
