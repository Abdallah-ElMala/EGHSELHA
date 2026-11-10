import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CalendarCheck,
  CreditCard,
  Star,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  X,
  PlusCircle,
  MapPin,
  FileText,
  Clock,
  ShieldAlert,
  Car,
  ChevronRight,
  Download,
  AlertCircle
} from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import { useCustomer } from '../../context/CustomerContext'
import { customerApi } from '../../services/customerApi'

export default function CustomerBookings() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialFilter = searchParams.get('filter') || 'all'
  const payBookingId = searchParams.get('payBookingId')

  const { bookings, profile, notify, refreshData } = useCustomer()

  const [activeTab, setActiveTab] = useState(initialFilter) // 'all', 'active', 'completed', 'disputed'

  // Modal states
  const [payDepositModal, setPayDepositModal] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const hasActiveCountdown = bookings.some(
      (b) => b.status === 'DISPATCHED' && b.cancelDeadlineUtc && new Date(b.cancelDeadlineUtc).getTime() > Date.now()
    )
    if (!hasActiveCountdown) return
    const timer = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [bookings])

  const formatMmSs = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const handleCancelBooking = async (booking) => {
    setCancellingId(booking.id)
    try {
      const res = await customerApi.cancelBooking(booking.id)
      if (!res.ok || !res.success) {
        notify(res.message || 'Cancellation window has expired.')
      } else {
        notify(res.message || `Booking ${booking.bookingNumber} cancelled.`)
      }
      await refreshData()
    } catch (err) {
      console.error(err)
      notify('Failed to cancel booking.')
    } finally {
      setCancellingId(null)
    }
  }

  useEffect(() => {
    if (payBookingId && bookings.length > 0) {
      const target = bookings.find((b) => b.id === payBookingId && b.status === 'PENDING')
      if (target) {
        setPayDepositModal(target)
        setSearchParams({}, { replace: true })
      }
    }
  }, [payBookingId, bookings, setSearchParams])
  const [payMethod, setPayMethod] = useState(1) // 1: Card, 2: Vodafone Cash, 3: Instapay, 4: Cash, 5: Wallet
  const [payingDeposit, setPayingDeposit] = useState(false)

  // Review Modal state (14. Review specifications)
  const [reviewModal, setReviewModal] = useState(null)
  const [punctuality, setPunctuality] = useState(5)
  const [cleanliness, setCleanliness] = useState(5)
  const [professionalism, setProfessionalism] = useState(5)
  const [selectedTags, setSelectedTags] = useState(['On Time', 'Great Detailing'])
  const [tipAmount, setTipAmount] = useState(20)
  const [commentText, setCommentText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // Dispute Modal state (15. Dispute specifications)
  const [disputeModal, setDisputeModal] = useState(null)
  const [disputeReason, setDisputeReason] = useState('')
  const [filingDispute, setFilingDispute] = useState(false)

  // Invoice / Receipt Modal (17. Invoice specifications)
  const [invoiceModal, setInvoiceModal] = useState(null)

  // Calculate live average review rating
  const averageRating = useMemo(() => {
    return ((punctuality + cleanliness + professionalism) / 3).toFixed(1)
  }, [punctuality, cleanliness, professionalism])

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    if (activeTab === 'active') {
      return bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED')
    }
    if (activeTab === 'completed') {
      return bookings.filter((b) => b.status === 'COMPLETED')
    }
    return bookings
  }, [bookings, activeTab])

  // Handle Pay Deposit (Behavior 3)
  const handlePayDeposit = async (e) => {
    e.preventDefault()
    if (!payDepositModal) return

    setPayingDeposit(true)
    try {
      await customerApi.payDeposit(payDepositModal.id, Number(payMethod))
      notify(`Mandatory 200 EGP deposit confirmed! Technician is being dispatched.`)
      setPayDepositModal(null)
      refreshData()
    } catch (err) {
      console.error(err)
      notify(err?.message || 'Failed to process deposit payment.')
    } finally {
      setPayingDeposit(false)
    }
  }

  // Handle Approve/Decline Upsell (Behavior 4)
  const handleApproveUpsell = async (upsellId, decision) => {
    try {
      await customerApi.approveUpsell(upsellId, decision)
      notify(decision ? 'Extra service approved (+EGP added to final bill).' : 'Extra service declined.')
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Failed to respond to upsell.')
    }
  }

  // Handle Submit Review (Behavior 5)
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewModal) return

    setSubmittingReview(true)
    try {
      await customerApi.submitReview(reviewModal.id, {
        punctualityRating: Number(punctuality),
        cleanlinessRating: Number(cleanliness),
        professionalismRating: Number(professionalism),
        selectedTags,
        tipAmount: Number(tipAmount),
        commentText
      })
      notify(`Thank you! Review submitted and +50 Loyalty Points added to your account!`)
      setReviewModal(null)
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Failed to submit review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Handle File Dispute (Behavior 6)
  const handleFileDispute = async (e) => {
    e.preventDefault()
    if (!disputeModal || !disputeReason.trim()) return

    setFilingDispute(true)
    try {
      await customerApi.fileDispute(disputeModal.id, {
        reason: disputeReason,
        evidenceUrls: []
      })
      notify(`Dispute case opened. Admin will investigate against PhotoQA within 12 hours.`)
      setDisputeModal(null)
      setDisputeReason('')
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Failed to file dispute.')
    } finally {
      setFilingDispute(false)
    }
  }

  const toggleReviewTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <PageTitle
        eyebrow="3. CUSTOMER / BOOKINGS MANAGEMENT"
        title="My Bookings & Order History"
        desc="Track active jobs, pay deposits, approve on-site inspection upsells, submit reviews, and view itemized invoices."
        action={
          <button className="btn primary" onClick={() => navigate('/customer/book')}>
            <PlusCircle size={16} /> Book New Wash
          </button>
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'all', label: `All Bookings (${bookings.length})` },
          { id: 'active', label: 'Active & In-Progress' },
          { id: 'completed', label: 'Completed History' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#087cf0' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {filteredBookings.length === 0 ? (
          <div className="panel" style={{ padding: '48px 24px', textAlign: 'center', borderRadius: '16px' }}>
            <CalendarCheck size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>No bookings found</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '12px' }}>You haven't placed any bookings in this section yet.</p>
            <button className="btn primary" onClick={() => navigate('/customer/book')}>
              Book Your First Wash
            </button>
          </div>
        ) : (
          filteredBookings.map((b) => {
            const isCompleted = b.status === 'COMPLETED'
            const isCancelled = b.status === 'CANCELLED'
            const isDepositPaid = b.status !== 'PENDING' && !isCancelled
            const isPendingDeposit = b.status === 'PENDING'
            const isUnacceptedByTech = b.status === 'PENDING' || b.status === 'DEPOSIT_PAID'
            const deadlineMs = b.cancelDeadlineUtc ? new Date(b.cancelDeadlineUtc).getTime() : 0
            const graceSecondsLeft = b.status === 'DISPATCHED' && deadlineMs > 0
              ? Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000))
              : 0
            const canCancelNow = !isCompleted && !isCancelled && (isUnacceptedByTech || (b.status === 'DISPATCHED' && graceSecondsLeft > 0))
            const isLockedIn = !isCompleted && !isCancelled && !canCancelNow
            const packageTitle = b.serviceName || b.packageName || 'Wash Package'
            const vehicleInfo = b.vehicleName ? ` · ${b.vehicleName}` : ''

            return (
              <div
                key={b.id}
                className="panel"
                style={{
                  borderRadius: '16px',
                  padding: '22px',
                  border: '1px solid #edf2f7',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eaf4ff', color: '#087cf0', display: 'grid', placeItems: 'center' }}>
                      <Car size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <b style={{ fontSize: '15px', color: '#102a40' }}>
                          {packageTitle}{vehicleInfo} <span style={{ color: '#087cf0', fontWeight: 700 }}>({b.bookingNumber})</span>
                        </b>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background:
                              b.bookingType === 'SUBSCRIPTION_WEEKLY' ? '#f0fdf4'
                              : b.bookingType === 'SUBSCRIPTION_MONTHLY' ? '#faf5ff'
                              : b.bookingType === 'FAST_TRACK' ? '#eff6ff'
                              : '#f1f5f9',
                            color:
                              b.bookingType === 'SUBSCRIPTION_WEEKLY' ? '#16a34a'
                              : b.bookingType === 'SUBSCRIPTION_MONTHLY' ? '#7c3aed'
                              : b.bookingType === 'FAST_TRACK' ? '#2563eb'
                              : '#475569',
                            border: '1px solid currentColor'
                          }}
                        >
                          {b.bookingType === 'SUBSCRIPTION_WEEKLY' ? '🔄 Weekly (-10%)'
                            : b.bookingType === 'SUBSCRIPTION_MONTHLY' ? '👑 Monthly (-15%)'
                            : b.bookingType === 'FAST_TRACK' ? '⚡ Fast Track'
                            : '📅 Scheduled'}
                        </span>
                      </div>
                      <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '3px' }}>
                        Scheduled: {new Date(b.scheduledAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {b.address}
                        {b.technicianName && (
                          <span style={{ color: '#087cf0', fontWeight: 700 }}> · Technician: {b.technicianName}</span>
                        )}
                      </small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        backgroundColor: isCompleted ? '#eafbf2' : b.status === 'DISPATCHED' ? '#dcfce7' : b.status === 'ON_THE_WAY' || b.status === 'ARRIVED' || b.status === 'WASHING' ? '#eff6ff' : b.status === 'DEPOSIT_PAID' ? '#ecfdf5' : '#fff7ed',
                        color: isCompleted ? '#1da46f' : b.status === 'DISPATCHED' ? '#15803d' : b.status === 'ON_THE_WAY' || b.status === 'ARRIVED' || b.status === 'WASHING' ? '#2563eb' : b.status === 'DEPOSIT_PAID' ? '#059669' : '#c2410c'
                      }}
                    >
                      {b.status === 'PENDING' ? 'Pending Deposit'
                        : b.status === 'DEPOSIT_PAID' ? 'Confirmed · Awaiting Tech'
                        : b.status === 'DISPATCHED' ? 'Accepted by Technician'
                        : b.status === 'ON_THE_WAY' ? 'Technician On The Way'
                        : b.status === 'ARRIVED' ? 'Technician Arrived'
                        : b.status === 'WASHING' ? 'Washing In Progress'
                        : b.status}
                    </span>
                    <strong style={{ fontSize: '16px', color: '#102a40' }}>EGP {b.totalPrice}</strong>
                  </div>
                </div>

                {/* Price & Add-Ons Breakdown Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
                    Base: EGP {b.basePackagePrice ?? b.totalPrice}
                  </span>
                  {(b.vehicleMultiplier ?? 1) > 1 && (
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '8px', background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1' }}>
                      Vehicle {b.vehicleMultiplier}×
                    </span>
                  )}
                  {(b.addOnsSubtotal ?? 0) > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
                      Add-Ons: +EGP {b.addOnsSubtotal}{b.addOnNames?.length ? ` (${b.addOnNames.join(', ')})` : ''}
                    </span>
                  )}
                  {(b.distanceSurcharge ?? 0) > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
                      Distance Fee: +EGP {b.distanceSurcharge}
                    </span>
                  )}
                  {(b.upsellTotal ?? 0) > 0 && (
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '8px', background: '#fff7ed', border: '1px solid #fdba74', color: '#c2410c' }}>
                      Upsell: +EGP {b.upsellTotal}
                    </span>
                  )}
                </div>

                {/* Upsell Banner if Pending (Behavior 4) */}
                {b.hasPendingUpsell && (
                  <div style={{ padding: '14px 16px', background: '#fff7ed', border: '1.5px solid #fdba74', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertTriangle size={20} color="#ea580c" />
                      <div>
                        <b style={{ fontSize: '12px', color: '#9a3412', display: 'block' }}>
                          Technician Requested Extra Cleaning (+EGP {b.pendingUpsellPrice || 150})
                        </b>
                        <small style={{ fontSize: '11px', color: '#c2410c' }}>
                          Reason: {b.pendingUpsellReason || 'Extra stain or heavy cleaning required after on-site inspection.'}
                        </small>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn outline" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => handleApproveUpsell(b.pendingUpsellId, false)}>
                        Decline
                      </button>
                      <button className="btn primary" style={{ fontSize: '11px', padding: '6px 12px', background: '#f97316', borderColor: '#ea580c' }} onClick={() => handleApproveUpsell(b.pendingUpsellId, true)}>
                        Approve (+EGP {b.pendingUpsellPrice || 150})
                      </button>
                    </div>
                  </div>
                )}

                {/* Technician Acceptance / 2-Min Grace Period / Lock-in Notice */}
                {b.status === 'DISPATCHED' && graceSecondsLeft > 0 && (
                  <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#92400e' }}>
                      <Clock size={16} color="#d97706" />
                      <span>
                        <b>Technician accepted your booking!</b> You have <b>{formatMmSs(graceSecondsLeft)}</b> left to cancel before the job is locked in.
                      </span>
                    </div>
                  </div>
                )}

                {isLockedIn && (
                  <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#166534' }}>
                    <CheckCircle size={16} color="#16a34a" />
                    <span>
                      <b>Confirmed & Locked In:</b> Cancellation window ended — {b.technicianName || 'your technician'} is assigned and heading to you.
                    </span>
                  </div>
                )}

                {/* Footer action buttons */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Deposit:</span>
                    <b style={{ fontSize: '12px', color: isDepositPaid ? '#1da46f' : isCancelled ? '#dc2626' : '#ea580c' }}>
                      {isCancelled ? 'Cancelled' : isDepositPaid ? '✓ Paid (200 EGP)' : '⚠ Unpaid (Required)'}
                    </b>
                    {isDepositPaid && b.remainingBalance !== undefined && (
                      <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>
                        · Remaining: EGP {b.remainingBalance}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Cancel / Delete Booking Button */}
                    {canCancelNow && (
                      <button
                        className="btn outline"
                        style={{ fontSize: '11px', padding: '8px 14px', color: '#dc2626', borderColor: '#fca5a5' }}
                        disabled={cancellingId === b.id}
                        onClick={() => handleCancelBooking(b)}
                      >
                        <X size={14} />
                        {cancellingId === b.id
                          ? 'Cancelling...'
                          : isUnacceptedByTech
                          ? 'Delete / Cancel'
                          : `Cancel (${formatMmSs(graceSecondsLeft)})`}
                      </button>
                    )}

                    {/* Pay Deposit Button (Behavior 3) */}
                    {isPendingDeposit && (
                      <button
                        className="btn primary"
                        style={{ fontSize: '11px', padding: '8px 14px' }}
                        onClick={() => setPayDepositModal(b)}
                      >
                        <CreditCard size={14} /> Pay 200 EGP Deposit
                      </button>
                    )}

                    {/* View Itemized Invoice (17. Invoice) */}
                    {isCompleted && (
                      <button
                        className="btn outline"
                        style={{ fontSize: '11px', padding: '8px 14px' }}
                        onClick={() => setInvoiceModal(b)}
                      >
                        <FileText size={14} /> View Invoice
                      </button>
                    )}

                    {/* Submit Review (Behavior 5) */}
                    {isCompleted && !b.hasReview && (
                      <button
                        className="btn primary"
                        style={{ fontSize: '11px', padding: '8px 14px' }}
                        onClick={() => setReviewModal(b)}
                      >
                        <Star size={14} /> Rate & Review (+50 Pts)
                      </button>
                    )}

                    {/* File Dispute (Behavior 6) */}
                    {isCompleted && !b.hasDispute && (
                      <button
                        className="btn outline"
                        style={{ fontSize: '11px', padding: '8px 14px', color: '#dc2626', borderColor: '#fca5a5' }}
                        onClick={() => setDisputeModal(b)}
                      >
                        <ShieldAlert size={14} /> File Dispute
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 1. PAY DEPOSIT MODAL (Behavior 3: payDeposit) */}
      {payDepositModal && (
        <div className="modal-overlay" onClick={() => setPayDepositModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h3>Pay Upfront Deposit</h3>
                <p>Booking {payDepositModal.bookingNumber} · Mandatory 200 EGP</p>
              </div>
              <button onClick={() => setPayDepositModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePayDeposit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px', background: '#f0f7ff', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#0369a1' }}>Mandatory Booking Deposit</span>
                  <h1 style={{ margin: '4px 0', fontSize: '32px', color: '#087cf0', fontWeight: 800 }}>EGP 200.00</h1>
                  <small style={{ fontSize: '10px', color: '#64748b' }}>Locks in your appointment & certified technician</small>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                    Select Payment Method (11. PaymentMethod)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { id: 1, label: 'Credit Card (Visa/Mastercard)' },
                      { id: 2, label: 'Vodafone Cash Wallet' },
                      { id: 3, label: 'Instapay Transfer' },
                      { id: 4, label: 'Cash Upon Arrival' },
                      { id: 5, label: `Wallet Balance (EGP ${profile?.walletBalance ?? 0})` }
                    ].map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setPayMethod(m.id)}
                        style={{
                          border: `1.5px solid ${payMethod === m.id ? '#087cf0' : '#e2e8f0'}`,
                          background: payMethod === m.id ? '#f0f7ff' : '#fff',
                          borderRadius: '10px',
                          padding: '12px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {m.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn outline" onClick={() => setPayDepositModal(null)}>Cancel</button>
                <button type="submit" className="btn primary" disabled={payingDeposit}>
                  {payingDeposit ? 'Processing...' : 'Confirm Payment (200 EGP)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. SUBMIT REVIEW MODAL (Behavior 5: submitReview / 14. Review) */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div>
                <h3>Rate & Review Service: {reviewModal.bookingNumber}</h3>
                <p>Earn +50 Loyalty Points upon review submission</p>
              </div>
              <button onClick={() => setReviewModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Overall Rating Display */}
                <div style={{ textAlign: 'center', padding: '14px', background: '#fffbeb', borderRadius: '12px' }}>
                  <span style={{ fontSize: '11px', color: '#b45309' }}>Average Star Rating</span>
                  <div style={{ fontSize: '30px', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Star size={26} fill="#d97706" color="#d97706" />
                    <span>{averageRating} / 5.0</span>
                  </div>
                </div>

                {/* 3 Categories from 14. Review specification */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Punctuality & On-Time Arrival:</span>
                    <select value={punctuality} onChange={(e) => setPunctuality(Number(e.target.value))} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="5">⭐⭐⭐⭐⭐ (5 - Perfect)</option>
                      <option value="4">⭐⭐⭐⭐ (4 - Good)</option>
                      <option value="3">⭐⭐⭐ (3 - Average)</option>
                      <option value="2">⭐⭐ (2 - Delayed)</option>
                      <option value="1">⭐ (1 - Late)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Wash Quality & Cleanliness:</span>
                    <select value={cleanliness} onChange={(e) => setCleanliness(Number(e.target.value))} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="5">⭐⭐⭐⭐⭐ (5 - Spotless)</option>
                      <option value="4">⭐⭐⭐⭐ (4 - Very Clean)</option>
                      <option value="3">⭐⭐⭐ (3 - Clean)</option>
                      <option value="2">⭐⭐ (2 - Missed Spots)</option>
                      <option value="1">⭐ (1 - Poor)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Technician Professionalism:</span>
                    <select value={professionalism} onChange={(e) => setProfessionalism(Number(e.target.value))} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="5">⭐⭐⭐⭐⭐ (5 - Polite & Pro)</option>
                      <option value="4">⭐⭐⭐⭐ (4 - Professional)</option>
                      <option value="3">⭐⭐⭐ (3 - Okay)</option>
                      <option value="2">⭐⭐ (2 - Unfriendly)</option>
                      <option value="1">⭐ (1 - Rude)</option>
                    </select>
                  </div>
                </div>

                {/* Selected Tags */}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Feedback Tags:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['On Time', 'Great Detailing', 'Spotless Interior', 'Polite Technician', 'Careful Handling', 'Fast Service'].map((tag) => {
                      const isTagSelected = selectedTags.includes(tag)
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleReviewTag(tag)}
                          style={{
                            border: `1px solid ${isTagSelected ? '#087cf0' : '#cbd5e1'}`,
                            background: isTagSelected ? '#e0f2fe' : '#fff',
                            color: isTagSelected ? '#0369a1' : '#475569',
                            borderRadius: '16px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Optional Tip */}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Optional Tip for Technician:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[0, 20, 50, 100].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setTipAmount(amt)}
                        style={{
                          flex: 1,
                          border: `1.5px solid ${tipAmount === amt ? '#16a34a' : '#cbd5e1'}`,
                          background: tipAmount === amt ? '#f0fdf4' : '#fff',
                          color: tipAmount === amt ? '#15803d' : '#475569',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {amt === 0 ? 'No Tip' : `EGP ${amt}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <textarea
                    rows={3}
                    placeholder="Write a comment about your experience..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn outline" onClick={() => setReviewModal(null)}>Cancel</button>
                <button type="submit" className="btn primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review (+50 Points)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. FILE DISPUTE MODAL (Behavior 6: fileDispute / 15. Dispute) */}
      {disputeModal && (
        <div className="modal-overlay" onClick={() => setDisputeModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div>
                <h3>Open Formal Dispute: {disputeModal.bookingNumber}</h3>
                <p>12-hour guarantee against missed spots or damage</p>
              </div>
              <button onClick={() => setDisputeModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleFileDispute}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px' }}>
                  <b style={{ fontSize: '12px', color: '#991b1b', display: 'block' }}>12-Hour Investigation Window</b>
                  <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#b91c1c' }}>
                    An Admin will review the technician's mandatory before-and-after PhotoQA records. Eligible outcomes include full refund or free re-wash.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Reason for Complaint:
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe what was unsatisfactory (e.g. rims not cleaned, carpet still stained)..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn outline" onClick={() => setDisputeModal(null)}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#dc2626', borderColor: '#b91c1c' }} disabled={filingDispute}>
                  {filingDispute ? 'Submitting...' : 'File Official Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. INVOICE / RECEIPT MODAL (17. Invoice) */}
      {invoiceModal && (
        <div className="modal-overlay" onClick={() => setInvoiceModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div>
                <h3>Electronic Invoice: INV-{invoiceModal.bookingNumber?.replace('#BK-', '') || '2025-01'}</h3>
                <p>Settled & Closed · EGHSELHA Egypt</p>
              </div>
              <button onClick={() => setInvoiceModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Customer</span>
                  <b style={{ display: 'block', fontSize: '12px', color: '#102a40' }}>{profile?.fullName || 'Ahmed Khaled'}</b>
                  <small style={{ fontSize: '10px', color: '#64748b' }}>{profile?.phone || '+20 100 999 1111'}</small>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Invoice Date</span>
                  <b style={{ display: 'block', fontSize: '12px', color: '#102a40' }}>{new Date().toLocaleDateString('en-GB')}</b>
                </div>
              </div>

              {/* Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Base Package ({invoiceModal.serviceName || invoiceModal.packageName || 'Car Wash'})</span>
                  <b style={{ color: '#1e293b' }}>EGP {invoiceModal.basePackagePrice ?? invoiceModal.totalPrice}</b>
                </div>
                {(invoiceModal.vehicleMultiplier ?? 1) > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Vehicle Size Multiplier ({invoiceModal.vehicleMultiplier}×)</span>
                    <b style={{ color: '#1e293b' }}>+EGP {Math.round(((invoiceModal.basePackagePrice ?? 0) * ((invoiceModal.vehicleMultiplier ?? 1) - 1)) * 100) / 100}</b>
                  </div>
                )}
                {(invoiceModal.addOnsSubtotal ?? 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Extra Add-Ons {invoiceModal.addOnNames?.length ? `(${invoiceModal.addOnNames.join(', ')})` : ''}</span>
                    <b style={{ color: '#087cf0' }}>+EGP {invoiceModal.addOnsSubtotal}</b>
                  </div>
                )}
                {(invoiceModal.distanceSurcharge ?? 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Zone Distance Fee</span>
                    <b style={{ color: '#1e293b' }}>+EGP {invoiceModal.distanceSurcharge}</b>
                  </div>
                )}
                {(invoiceModal.upsellTotal ?? 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Approved On-Site Upsell</span>
                    <b style={{ color: '#c2410c' }}>+EGP {invoiceModal.upsellTotal}</b>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#102a40' }}>Total Amount</span>
                  <b style={{ color: '#087cf0', fontSize: '16px' }}>EGP {invoiceModal.totalPrice}</b>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>Deposit Paid: EGP {invoiceModal.depositAmount ?? 200}</span>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Balance Settled: EGP {Math.max(0, (invoiceModal.totalPrice ?? 0) - (invoiceModal.depositAmount ?? 200))}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn outline"
                onClick={() => {
                  window.print()
                }}
              >
                <Download size={14} /> Download PDF
              </button>
              <button className="btn primary" onClick={() => setInvoiceModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
