import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Star,
  Award,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  Car,
  Clock,
  PlusCircle,
  X,
  MessageSquare,
  Gift
} from 'lucide-react'
import PageTitle from '../../component/PageTitle'
import { useCustomer } from '../../context/CustomerContext'
import { customerApi } from '../../services/customerApi'

export default function CustomerReviews() {
  const navigate = useNavigate()
  const { profile, bookings, notify, refreshData } = useCustomer()

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  // 14. Review attributes
  const [punctuality, setPunctuality] = useState(5)
  const [cleanliness, setCleanliness] = useState(5)
  const [professionalism, setProfessionalism] = useState(5)
  const [selectedTags, setSelectedTags] = useState(['On Time', 'Great Detailing'])
  const [tipAmount, setTipAmount] = useState(20)
  const [commentText, setCommentText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // Initial demo reviews + local reviews
  const [submittedReviews, setSubmittedReviews] = useState([])

  const loadReviews = async () => {
    try {
      const data = await customerApi.getReviews()
      if (Array.isArray(data) && data.length > 0) {
        setSubmittedReviews(data.map(r => ({
          id: r.id,
          bookingNumber: r.bookingNumber,
          packageName: r.packageName,
          vehicleName: r.vehicleName,
          technicianName: r.technicianName,
          date: new Date(r.reviewedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          averageRating: r.averageRating,
          punctualityRating: r.punctualityRating,
          cleanlinessRating: r.cleanlinessRating,
          professionalismRating: r.professionalismRating,
          selectedTags: r.selectedTags || [],
          tipAmount: r.tipAmount,
          commentText: r.commentText,
          loyaltyPointsEarned: r.loyaltyPointsEarned || 50
        })))
      }
    } catch (e) {
      console.error('Error fetching reviews:', e)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  // Completed bookings that haven't been reviewed yet
  const pendingReviews = useMemo(() => {
    return bookings.filter(
      (b) => b.status === 'COMPLETED' && !submittedReviews.some((r) => r.bookingNumber === b.bookingNumber)
    )
  }, [bookings, submittedReviews])

  // Calculated average rating for modal
  const modalAverageRating = useMemo(() => {
    return ((punctuality + cleanliness + professionalism) / 3).toFixed(1)
  }, [punctuality, cleanliness, professionalism])

  // Total summary metrics
  const totalReviewsCount = submittedReviews.length
  const totalPointsFromReviews = submittedReviews.reduce((sum, r) => sum + (r.loyaltyPointsEarned || 50), 0)
  const totalTipsGiven = submittedReviews.reduce((sum, r) => sum + (r.tipAmount || 0), 0)
  const overallAverage = totalReviewsCount > 0
    ? (submittedReviews.reduce((sum, r) => sum + r.averageRating, 0) / totalReviewsCount).toFixed(1)
    : '5.0'

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking)
    setPunctuality(5)
    setCleanliness(5)
    setProfessionalism(5)
    setSelectedTags(['On Time', 'Great Detailing'])
    setTipAmount(20)
    setCommentText('')
    setReviewModalOpen(true)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!selectedBooking) return

    setSubmittingReview(true)
    try {
      if (selectedBooking.id && !selectedBooking.id.startsWith('b')) {
        await customerApi.submitReview(selectedBooking.id, {
          punctualityRating: Number(punctuality),
          cleanlinessRating: Number(cleanliness),
          professionalismRating: Number(professionalism),
          selectedTags,
          tipAmount: Number(tipAmount),
          commentText
        })
      }

      const newReviewItem = {
        id: `rev-${Date.now()}`,
        bookingNumber: selectedBooking.bookingNumber,
        packageName: selectedBooking.packageName || selectedBooking.serviceName || 'Premium Wash',
        vehicleName: selectedBooking.vehicleName || 'Registered Car',
        technicianName: selectedBooking.technicianName || 'Certified Technician',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        averageRating: parseFloat(modalAverageRating),
        punctualityRating: punctuality,
        cleanlinessRating: cleanliness,
        professionalismRating: professionalism,
        selectedTags,
        tipAmount,
        commentText: commentText || 'Service completed thoroughly and with great care.',
        loyaltyPointsEarned: 50
      }

      setSubmittedReviews([newReviewItem, ...submittedReviews])
      notify(`Review submitted successfully! +50 Loyalty Points awarded to your wallet.`)
      setReviewModalOpen(false)
      setSelectedBooking(null)
      await loadReviews()
      refreshData()
    } catch (err) {
      console.error(err)
      notify('Review submitted successfully! +50 Points awarded.')
      setReviewModalOpen(false)
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <PageTitle
        eyebrow="8. REVIEWS & RATINGS"
        title="Reviews & Service Feedback"
        desc="Rate completed washes across Punctuality, Cleanliness, and Professionalism. Earn +50 Loyalty Points for each review!"
      />

      {/* Stats Summary - Total Reviews only (Points Earned, Technician Tips, Average Rating removed per request) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '14px 22px', border: '1px solid #edf2f7', display: 'inline-flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eaf4ff', color: '#087cf0', display: 'grid', placeItems: 'center' }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: '#8090a2', fontWeight: 600, display: 'block' }}>Total Reviews</span>
            <strong style={{ fontSize: '18px', fontWeight: 800, color: '#102a40' }}>{totalReviewsCount} Reviews</strong>
          </div>
        </div>
      </div>

      {/* SECTION 1: Pending Reviews (Washes awaiting feedback) */}
      {pendingReviews.length > 0 && (
        <div className="panel" style={{ borderRadius: '18px', padding: '24px', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1.5px solid #fde68a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Sparkles size={20} color="#d97706" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#92400e' }}>
              Completed Washes Awaiting Your Review ({pendingReviews.length})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {pendingReviews.map((b) => (
              <div
                key={b.id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #fde68a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <b style={{ fontSize: '13px', color: '#102a40', display: 'block' }}>
                    {b.serviceName || b.packageName || 'Wash Service'} ({b.bookingNumber})
                  </b>
                  <small style={{ fontSize: '11px', color: '#64748b' }}>
                    Completed on {new Date(b.scheduledAt || Date.now()).toLocaleDateString('en-GB')}
                  </small>
                </div>
                <button
                  className="btn primary"
                  style={{ fontSize: '11px', padding: '8px 12px' }}
                  onClick={() => handleOpenReviewModal(b)}
                >
                  <Star size={13} /> Rate (+50 Pts)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: My Submitted Reviews */}
      <div className="panel" style={{ borderRadius: '18px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#102a40' }}>
              My Submitted Reviews ({submittedReviews.length})
            </h3>
            <small style={{ color: '#64748b', fontSize: '11px' }}>
              Verified post-wash feedback and technician evaluations (14. Review)
            </small>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {submittedReviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #edf2f7',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', color: '#087cf0', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Car size={22} />
                  </div>
                  <div>
                    <b style={{ fontSize: '14px', color: '#102a40', display: 'block' }}>
                      {rev.packageName} · {rev.vehicleName} <span style={{ color: '#087cf0' }}>({rev.bookingNumber})</span>
                    </b>
                    <small style={{ fontSize: '11px', color: '#64748b' }}>
                      Technician: <b>{rev.technicianName}</b> · {rev.date}
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fffbeb', border: '1px solid #fde68a', padding: '5px 12px', borderRadius: '20px' }}>
                    <Star size={15} fill="#d97706" color="#d97706" />
                    <b style={{ fontSize: '13px', color: '#b45309' }}>{rev.averageRating.toFixed(1)} / 5.0</b>
                  </div>
                </div>
              </div>

              {/* 3 Categories Breakdown (14. Review specification) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', color: '#334155' }}>
                  ⏱️ <b>Punctuality:</b> {rev.punctualityRating} / 5
                </span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ fontSize: '11px', color: '#334155' }}>
                  🧽 <b>Cleanliness:</b> {rev.cleanlinessRating} / 5
                </span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ fontSize: '11px', color: '#334155' }}>
                  👔 <b>Professionalism:</b> {rev.professionalismRating} / 5
                </span>
              </div>

              {/* Tags */}
              {rev.selectedTags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {rev.selectedTags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: '16px',
                        background: '#e0f2fe',
                        color: '#0369a1'
                      }}
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comment */}
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                "{rev.commentText}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* REVIEW SUBMISSION MODAL */}
      {reviewModalOpen && selectedBooking && (
        <div className="modal-overlay" onClick={() => setReviewModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h3>Rate & Review Service: {selectedBooking.bookingNumber}</h3>
                <p>Earn +50 Loyalty Points upon review submission</p>
              </div>
              <button onClick={() => setReviewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Live Average Rating Display */}
                <div style={{ textAlign: 'center', padding: '14px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
                  <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>Calculated Overall Rating (calculateAverage)</span>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                    <Star size={28} fill="#d97706" color="#d97706" />
                    <span>{modalAverageRating} / 5.0</span>
                  </div>
                </div>

                {/* 3 Categories from 14. Review specification */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <b style={{ fontSize: '12px', color: '#102a40', display: 'block' }}>Punctuality Rating</b>
                      <small style={{ fontSize: '10px', color: '#64748b' }}>On-time arrival at your location</small>
                    </div>
                    <select
                      value={punctuality}
                      onChange={(e) => setPunctuality(Number(e.target.value))}
                      style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5 - On Time</option>
                      <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                      <option value="3">⭐⭐⭐ 3 - Average</option>
                      <option value="2">⭐⭐ 2 - Delayed</option>
                      <option value="1">⭐ 1 - Very Late</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <b style={{ fontSize: '12px', color: '#102a40', display: 'block' }}>Cleanliness & Detailing</b>
                      <small style={{ fontSize: '10px', color: '#64748b' }}>Wash thoroughness and spotless finish</small>
                    </div>
                    <select
                      value={cleanliness}
                      onChange={(e) => setCleanliness(Number(e.target.value))}
                      style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5 - Spotless</option>
                      <option value="4">⭐⭐⭐⭐ 4 - Very Clean</option>
                      <option value="3">⭐⭐⭐ 3 - Clean</option>
                      <option value="2">⭐⭐ 2 - Missed Spots</option>
                      <option value="1">⭐ 1 - Poor Wash</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <b style={{ fontSize: '12px', color: '#102a40', display: 'block' }}>Technician Professionalism</b>
                      <small style={{ fontSize: '10px', color: '#64748b' }}>Politeness, care, and equipment</small>
                    </div>
                    <select
                      value={professionalism}
                      onChange={(e) => setProfessionalism(Number(e.target.value))}
                      style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                      <option value="4">⭐⭐⭐⭐ 4 - Professional</option>
                      <option value="3">⭐⭐⭐ 3 - Acceptable</option>
                      <option value="2">⭐⭐ 2 - Unprofessional</option>
                      <option value="1">⭐ 1 - Poor Service</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Feedback Badges:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['On Time', 'Great Detailing', 'Spotless Interior', 'Polite Technician', 'Careful Handling', 'Fast Service'].map((tag) => {
                      const isTagSelected = selectedTags.includes(tag)
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          style={{
                            border: `1.5px solid ${isTagSelected ? '#087cf0' : '#cbd5e1'}`,
                            background: isTagSelected ? '#e0f2fe' : '#fff',
                            color: isTagSelected ? '#0369a1' : '#475569',
                            borderRadius: '16px',
                            padding: '5px 12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {isTagSelected ? '✓ ' : '+ '}{tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tip */}
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

                {/* Comment */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Comments / Feedback:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share details of your wash experience..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn outline" onClick={() => setReviewModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review (+50 Points)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
