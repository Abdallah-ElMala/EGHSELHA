import { useEffect, useState, useMemo } from 'react'
import { Wallet, CalendarDays, Clock3, TrendingUp, Download, ChevronRight, ArrowLeft, Search, Filter } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import Stat from '../../component/Stat'
import { useTech } from '../../context/TechnicianContext'
import { technicianApi } from '../../services/technicianApi'

export default function Earnings() {
  const { notify } = useTech()
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)

  // View All Transactions state
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const data = await technicianApi.getEarnings()
        setEarnings(data)
      } catch (error) {
        console.error('Earnings API Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEarnings()
  }, [])

  const transactions = earnings?.transactions ?? []
  const weekly = earnings?.weekly ?? []

  // Filtered transactions for "View all"
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchStatus = statusFilter === 'All' || t.status.toLowerCase() === statusFilter.toLowerCase()
      const matchSearch =
        !searchQuery ||
        t.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.date?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(t.amount).includes(searchQuery)

      return matchStatus && matchSearch
    })
  }, [transactions, statusFilter, searchQuery])

  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  }, [filteredTransactions])

  if (loading) {
    return <div className="empty-state"><p>Loading earnings…</p></div>
  }

  // إذا تم الضغط على View All، نعرض صفحة كاملة لكل المعاملات
  if (showAllTransactions) {
    return (
      <>
        <PageTitle
          eyebrow="WORKSPACE / FINANCE / TRANSACTIONS"
          title="All Transactions"
          desc="Complete history of your job earnings, payouts and transaction statuses."
          action={
            <button className="btn outline" onClick={() => setShowAllTransactions(false)}>
              <ArrowLeft size={16} /> Back to earnings
            </button>
          }
        />

        <div className="panel" style={{ padding: '20px' }}>
          {/* Controls row */}
          <div className="filter-row" style={{ paddingTop: 0 }}>
            {['All', 'Paid', 'Pending'].map((st) => (
              <button
                key={st}
                className={statusFilter === st ? 'filter active-filter' : 'filter'}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}

            <div className="filter-search">
              <Search size={16} />
              <input
                placeholder="Search transaction, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              className="btn outline"
              style={{ marginLeft: 8 }}
              onClick={() => notify(`Exporting ${filteredTransactions.length} transactions report.`)}
            >
              <Download size={14} /> Export
            </button>
          </div>

          {/* Quick summary strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 10px', color: 'var(--muted)', fontSize: 11 }}>
            <span>Showing <b>{filteredTransactions.length}</b> transactions</span>
            <span>Total sum: <b style={{ color: '#1687f8' }}>EGP {totalFilteredAmount.toLocaleString()}</b></span>
          </div>

          {/* Full Transactions Table */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>SERVICE</th>
                  <th>CUSTOMER</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                      No transactions found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td><b>{r.service}</b></td>
                      <td>{r.customer}</td>
                      <td><b>EGP {r.amount}</b></td>
                      <td>
                        <span className={`payment-status ${r.status.toLowerCase()}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )
  }

  // العرض العادي للصفحة
  return (
    <>
      <PageTitle
        eyebrow="WORKSPACE / FINANCE"
        title="Earnings"
        desc="Track your income, payouts and completed services."
        action={
          <button className="btn outline" onClick={() => notify('Your earnings report is being prepared (demo).')}>
            <Download size={16} /> Export report
          </button>
        }
      />

      <div className="stats-grid earnings-stats">
        <Stat
          icon={Wallet}
          label="Total earnings"
          value={`EGP ${earnings?.totalEarnings?.toLocaleString() ?? 0}`}
          change={earnings?.totalEarningsChange ?? ''}
          tone="green"
        />
        <Stat
          icon={CalendarDays}
          label="This month"
          value={`EGP ${earnings?.thisMonth?.toLocaleString() ?? 0}`}
          change={earnings?.thisMonthChange ?? ''}
        />
        <Stat
          icon={Clock3}
          label="Pending payout"
          value={`EGP ${earnings?.pendingPayout?.toLocaleString() ?? 0}`}
          change={earnings?.nextPayoutInfo ?? ''}
          tone="yellow"
        />
        <Stat
          icon={TrendingUp}
          label="Average per job"
          value={`EGP ${earnings?.averagePerJob?.toLocaleString() ?? 0}`}
          change={earnings?.averageChange ?? ''}
          tone="purple"
        />
      </div>

      <section className="panel earnings-chart">
        <div className="panel-head">
          <div><h2>Income overview</h2><p>Your earnings over the last 7 days</p></div>
          <span className="select-like">Last 7 days⌄</span>
        </div>
        <div className="bar-chart">
          {weekly.map((w) => (
            <div className="bar-col" key={w.day}>
              <div className="bar" style={{ height: w.percentage + '%' }} />
              <span>{w.day}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel transaction-panel">
        <div className="panel-head">
          <div><h2>Recent transactions</h2><p>Details of your latest jobs and payments</p></div>
          <button className="text-btn" onClick={() => setShowAllTransactions(true)}>
            View all <ChevronRight size={15} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>SERVICE</th>
                <th>CUSTOMER</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td><b>{r.service}</b></td>
                  <td>{r.customer}</td>
                  <td><b>EGP {r.amount}</b></td>
                  <td>
                    <span className={`payment-status ${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
