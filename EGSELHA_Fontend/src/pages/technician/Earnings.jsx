import { useEffect, useState, useMemo, useCallback } from 'react'
import { Wallet, CalendarDays, Clock3, TrendingUp, Download, ChevronRight, ArrowLeft, Search, CreditCard } from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import Stat from '../../component/Stat'
import FieldError from '../../component/FieldError'
import { useTech } from '../../context/TechnicianContext'
import { technicianApi } from '../../services/technicianApi'
import { validatePayout, extractApiErrors } from '../../utils/validation'

const RANGE_LABELS = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  year: 'Last 6 months'
}

export default function Earnings() {
  const { notify, profile } = useTech()
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartRange, setChartRange] = useState('7d')

  // View All Transactions state
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Request Payout Modal state
  const [payoutModalOpen, setPayoutModalOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState(500)
  const [payoutMethod, setPayoutMethod] = useState('Instapay')
  const [accountsByMethod, setAccountsByMethod] = useState({
    Instapay: 'mostafa@instapay',
    'Vodafone Cash': profile?.phone || '01012345678',
    'Bank Transfer': 'EG38 0019 0005 0000 0000 2631 8000 2'
  })
  const accountDetails = accountsByMethod[payoutMethod] ?? ''
  const setAccountDetails = (val) => {
    setAccountsByMethod((prev) => ({ ...prev, [payoutMethod]: val }))
  }
  const [submittingPayout, setSubmittingPayout] = useState(false)
  const [payoutErrors, setPayoutErrors] = useState({})
  const [serverPayoutError, setServerPayoutError] = useState('')

  const payoutMethodMeta = {
    Instapay: {
      label: 'Instapay Address (IPA) *',
      placeholder: 'e.g. username@instapay',
      hint: 'Instant transfer directly to your Instapay address'
    },
    'Vodafone Cash': {
      label: 'Vodafone Cash Wallet Number *',
      placeholder: 'e.g. 01012345678',
      hint: '11-digit mobile wallet number (Vodafone / Orange / Etisalat / WE)'
    },
    'Bank Transfer': {
      label: 'Bank IBAN / Account Number *',
      placeholder: 'e.g. EG38 0019 0005 0000 ...',
      hint: '29-character Egyptian IBAN or local bank account number'
    }
  }[payoutMethod] || {
    label: 'Destination Details *',
    placeholder: 'Enter payout destination',
    hint: ''
  }

  const availableBal = Number(earnings?.availableBalance ?? 0)
  const enteredAmount = Number(payoutAmount) || 0
  const remainingAfterPayout = availableBal - enteredAmount
  const exceedsBalance = enteredAmount > availableBal

  const fetchEarnings = useCallback(async (selectedRange = chartRange) => {
    try {
      const data = await technicianApi.getEarnings(selectedRange)
      setEarnings(data)
    } catch (error) {
      console.error('Earnings API Error:', error)
    } finally {
      setLoading(false)
    }
  }, [chartRange])

  useEffect(() => {
    fetchEarnings(chartRange)
    const timer = setInterval(() => fetchEarnings(chartRange), 5000)
    return () => clearInterval(timer)
  }, [chartRange, fetchEarnings])

  const transactions = earnings?.transactions ?? []
  const weekly = earnings?.weekly ?? []
  const payouts = earnings?.payouts ?? []

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

  const handleRequestPayout = async (e) => {
    e.preventDefault()

    const { isValid, errors } = validatePayout({
      amount: payoutAmount,
      payoutMethod,
      accountDetails,
      availableBalance: earnings?.availableBalance
    })

    if (!isValid) {
      setPayoutErrors(errors)
      return
    }

    setPayoutErrors({})
    setServerPayoutError('')
    setSubmittingPayout(true)
    try {
      await technicianApi.requestPayout({
        amount: Number(payoutAmount),
        payoutMethod,
        accountDetails: accountDetails.trim()
      })
      notify(`Payout request of EGP ${payoutAmount} submitted via ${payoutMethod}!`)
      setPayoutModalOpen(false)
      fetchEarnings(chartRange)
    } catch (err) {
      console.error(err)
      const { message, fieldErrors } = extractApiErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        setPayoutErrors(fieldErrors)
      }
      setServerPayoutError(message)
      notify(message)
    } finally {
      setSubmittingPayout(false)
    }
  }

  const getPayoutStatusBadge = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'processed' || s === 'approved' || s === 'completed') {
      return { text: 'Processed', bg: '#e8f8ef', color: '#1b9d67' }
    }
    if (s === 'cancelled' || s === 'canceled' || s === 'rejected' || s === 'failed') {
      return { text: 'Cancelled · Refunded', bg: '#fef2f2', color: '#dc2626' }
    }
    return { text: 'Pending', bg: '#fff6df', color: '#c18a13' }
  }

  if (loading) {
    return <div className="empty-state"><p>Loading earnings…</p></div>
  }

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

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 10px', color: 'var(--muted)', fontSize: 11 }}>
            <span>Showing <b>{filteredTransactions.length}</b> transactions</span>
            <span>Total sum: <b style={{ color: '#141415' }}>EGP {totalFilteredAmount.toLocaleString()}</b></span>
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
                      <td><b>EGP {r.amount}</b>{r.bookingTotal ? <small style={{ display: 'block', color: '#94a3b8', fontSize: '9px' }}>70% of EGP {r.bookingTotal}</small> : null}</td>
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

  return (
    <>
      <PageTitle
        eyebrow="WORKSPACE / FINANCE"
        title="Earnings"
        desc="Track your income, payouts and completed services."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn primary" onClick={() => setPayoutModalOpen(true)}>
              <CreditCard size={16} /> Request Payout
            </button>
            <button className="btn outline" onClick={() => notify('Your earnings report is being prepared.')}>
              <Download size={16} /> Export report
            </button>
          </div>
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
          <div>
            <h2>Income overview</h2>
            <p>
              {RANGE_LABELS[chartRange]} · Period total:{' '}
              <b style={{ color: '#141415' }}>EGP {(earnings?.chartTotal ?? 0).toLocaleString()}</b>
            </p>
          </div>
          <select
            aria-label="Income overview range"
            value={chartRange}
            onChange={(e) => setChartRange(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '9px',
              border: '1px solid #dce6ef',
              background: '#fff',
              color: '#30495e',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="year">Last 6 months</option>
          </select>
        </div>

        <div className="bar-chart" style={{ height: '210px', paddingTop: '24px' }}>
          {weekly.map((w, idx) => (
            <div
              className="bar-col"
              key={`${w.day}-${idx}`}
              title={`${w.day} (${w.dateLabel || ''}): EGP ${(w.amount ?? 0).toLocaleString()}`}
              style={{ gap: '4px' }}
            >
              {w.amount > 0 && (
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#141415', whiteSpace: 'nowrap' }}>
                  EGP {Math.round(w.amount).toLocaleString()}
                </span>
              )}
              <div
                className="bar"
                style={{
                  height: `${w.percentage}%`,
                  minHeight: w.amount > 0 ? '14px' : '4px',
                  opacity: w.amount > 0 ? 1 : 0.25
                }}
              />
              <span style={{ fontWeight: 700, color: '#334155' }}>{w.day}</span>
              {w.dateLabel && (
                <span style={{ fontSize: '8px', color: '#94a3b8' }}>{w.dateLabel}</span>
              )}
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
                  <td><b>EGP {r.amount}</b>{r.bookingTotal ? <small style={{ display: 'block', color: '#94a3b8', fontSize: '9px' }}>70% of EGP {r.bookingTotal}</small> : null}</td>
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

      {/* Payout Requests History */}
      <section className="panel transaction-panel" style={{ marginTop: '18px' }}>
        <div className="panel-head">
          <div>
            <h2>Payout requests history</h2>
            <p>Track pending withdrawals, approved transfers, and cancelled refunds</p>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>
            Available balance: EGP {(earnings?.availableBalance ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>REQUESTED DATE</th>
                <th>METHOD</th>
                <th>ACCOUNT</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                    No payout requests submitted yet.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => {
                  const badge = getPayoutStatusBadge(p.status)
                  return (
                    <tr key={p.id}>
                      <td>{new Date(p.requestedAt).toLocaleDateString()}</td>
                      <td><b>{p.payoutMethod}</b></td>
                      <td>{p.accountDetails}</td>
                      <td><b>EGP {Number(p.amount).toLocaleString()}</b></td>
                      <td>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '5px 10px',
                            borderRadius: '20px',
                            background: badge.bg,
                            color: badge.color
                          }}
                        >
                          {badge.text}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Request Payout Modal */}
      {payoutModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setPayoutModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '470px',
              padding: '26px',
              background: 'var(--alabaster)',
              borderRadius: '20px'
            }}
          >
            <div style={{ marginBottom: '18px' }}>
              <span className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Technician Payout</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 400, margin: '0 0 6px 0', color: 'var(--ink-primary)' }}>
                Request Payout
              </h2>
              <p style={{ color: 'var(--ink-secondary)', fontSize: '13px', margin: 0 }}>
                Withdraw your accumulated detailing earnings to your preferred account.
              </p>
            </div>

            <form onSubmit={handleRequestPayout} noValidate>
              {serverPayoutError && (
                <div style={{ padding: '10px 14px', background: 'var(--semantic-negative-bg)', border: '1px solid rgba(185,28,28,0.25)', borderRadius: '10px', color: 'var(--semantic-negative)', fontSize: '12.5px', marginBottom: '14px' }}>
                  {serverPayoutError}
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                    Withdrawal Amount (EGP) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPayoutAmount(Math.floor(availableBal))
                      if (payoutErrors.amount) setPayoutErrors({ ...payoutErrors, amount: '' })
                    }}
                    style={{
                      background: 'var(--bronze-soft)',
                      border: '1px solid rgba(166, 124, 55, 0.28)',
                      color: '#7a571e',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 9px',
                      borderRadius: '999px',
                      cursor: 'pointer'
                    }}
                  >
                    Withdraw Max (EGP {availableBal.toLocaleString()})
                  </button>
                </div>

                <input
                  type="number"
                  min="50"
                  max={availableBal || undefined}
                  step="1"
                  className="mono-num"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 600,
                    boxSizing: 'border-box',
                    border: payoutErrors.amount || exceedsBalance ? '1.5px solid var(--semantic-negative)' : '1px solid var(--hairline-light-strong)',
                    background: '#ffffff',
                    color: 'var(--ink-primary)',
                    outline: 'none'
                  }}
                  value={payoutAmount}
                  onChange={(e) => {
                    setPayoutAmount(e.target.value)
                    if (payoutErrors.amount) setPayoutErrors({ ...payoutErrors, amount: '' })
                  }}
                />
                <FieldError error={payoutErrors.amount} />

                {/* Live Remaining Balance Breakdown */}
                <div
                  style={{
                    marginTop: '10px',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    background: exceedsBalance ? 'var(--semantic-negative-bg)' : '#ffffff',
                    border: exceedsBalance ? '1px solid rgba(185, 28, 28, 0.25)' : '1px solid var(--hairline-light)',
                    display: 'grid',
                    gap: '5px',
                    fontSize: '12.5px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-secondary)' }}>
                    <span>Available balance</span>
                    <span className="mono-num" style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>
                      EGP {availableBal.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-secondary)' }}>
                    <span>Withdrawing now</span>
                    <span className="mono-num" style={{ fontWeight: 600, color: 'var(--bronze)' }}>
                      -EGP {enteredAmount.toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '6px',
                      borderTop: '1px solid var(--hairline-light)',
                      fontWeight: 600
                    }}
                  >
                    <span style={{ color: exceedsBalance ? 'var(--semantic-negative)' : 'var(--ink-primary)' }}>
                      {exceedsBalance ? 'Exceeds available balance' : 'Remaining balance after payout'}
                    </span>
                    <span
                      className="mono-num"
                      style={{
                        color: exceedsBalance ? 'var(--semantic-negative)' : 'var(--semantic-positive)'
                      }}
                    >
                      {exceedsBalance
                        ? `-EGP ${Math.abs(remainingAfterPayout).toLocaleString()}`
                        : `EGP ${remainingAfterPayout.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                  Payout Method *
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--hairline-light-strong)',
                    background: '#ffffff',
                    color: 'var(--ink-primary)',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                  value={payoutMethod}
                  onChange={(e) => {
                    setPayoutMethod(e.target.value)
                    if (payoutErrors.accountDetails) setPayoutErrors({ ...payoutErrors, accountDetails: '' })
                  }}
                >
                  <option value="Instapay">Instapay (Instant transfer)</option>
                  <option value="Vodafone Cash">Vodafone Cash (Mobile wallet)</option>
                  <option value="Bank Transfer">Bank Transfer (IBAN)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-primary)', marginBottom: '6px' }}>
                  {payoutMethodMeta.label}
                </label>
                <input
                  className="mono-num"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                    border: payoutErrors.accountDetails ? '1.5px solid var(--semantic-negative)' : '1px solid var(--hairline-light-strong)',
                    background: '#ffffff',
                    color: 'var(--ink-primary)',
                    outline: 'none'
                  }}
                  placeholder={payoutMethodMeta.placeholder}
                  value={accountDetails}
                  onChange={(e) => {
                    setAccountDetails(e.target.value)
                    if (payoutErrors.accountDetails) setPayoutErrors({ ...payoutErrors, accountDetails: '' })
                  }}
                />
                {payoutMethodMeta.hint && (
                  <small style={{ display: 'block', marginTop: '5px', fontSize: '11.5px', color: 'var(--ink-muted)' }}>
                    {payoutMethodMeta.hint}
                  </small>
                )}
                <FieldError error={payoutErrors.accountDetails} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn outline" onClick={() => setPayoutModalOpen(false)}>Cancel</button>
                <button
                  type="submit"
                  className="lx-btn lx-glass-btn lx-glass-obsidian"
                  disabled={submittingPayout || exceedsBalance || enteredAmount <= 0}
                  style={{
                    minHeight: '42px',
                    padding: '0 22px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 600,
                    opacity: submittingPayout || exceedsBalance || enteredAmount <= 0 ? 0.5 : 1,
                    cursor: submittingPayout || exceedsBalance || enteredAmount <= 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submittingPayout ? 'Processing…' : 'Submit Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
