import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Search, SlidersHorizontal, BriefcaseBusiness, CarFront, MapPin, Clock3, ChevronRight } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import Status from '../../component/Status'
import { useTech } from '../../context/TechnicianContext'
import { jobPath } from '../../data/jobs'

const filters = ['All', 'Upcoming', 'On The Way', 'In Progress', 'Completed']

export default function Jobs() {
  const navigate = useNavigate()
  const { jobs } = useTech()
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

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
        desc="All your assigned bookings in one place."
        action={
          <button className="btn primary" onClick={() => setFilter('Upcoming')}>
            <CalendarDays size={16} /> Upcoming jobs
          </button>
        }
      />

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
                <div className="job-line"><b>{j.service}</b><Status value={j.status} /></div>
                <span>{j.customer} · {j.car}</span>
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
