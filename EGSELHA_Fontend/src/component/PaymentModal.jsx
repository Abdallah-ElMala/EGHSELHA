import React, { useState } from 'react'
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Smartphone,
  Wallet,
  Building2,
  AlertCircle,
  Copy,
  Check,
  Star,
  Sparkles,
  Plus
} from 'lucide-react'
import {
  PAYMENT_METHODS,
  formatCardNumber,
  formatExpiry,
  detectCardBrand,
  processPaymentTransaction
} from '../services/paymentGateway'
import { customerApi } from '../services/customerApi'

const TOPUP_PRESETS = [
  { amount: 100, stars: 5, perk: null },
  { amount: 250, stars: 15, perk: null },
  { amount: 500, stars: 35, perk: '3% bonus stars' },
  { amount: 1000, stars: 80, perk: '5% wash discount' },
  { amount: 2000, stars: 180, perk: '10% VIP discount' }
]

const inputStyle = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: '10px',
  border: '1px solid var(--hairline-light-strong)',
  background: '#ffffff',
  color: 'var(--ink-primary)',
  fontSize: '13px',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 180ms var(--ease-luxury)'
}

export default function PaymentModal({
  isOpen,
  onClose,
  mode = 'topup', // 'topup' | 'deposit'
  booking = null,
  currentBalance = 0,
  onSuccess = () => {},
  notify = () => {}
}) {
  const [activeMode, setActiveMode] = useState(mode)
  const isTopUp = activeMode === 'topup'
  const targetAmount = isTopUp ? null : 200

  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.CREDIT_CARD)
  const [topUpAmount, setTopUpAmount] = useState(500)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [copiedKey, setCopiedKey] = useState(null)

  const [cardForm, setCardForm] = useState({
    cardNumber: '4123 4567 8901 4012',
    cardHolder: 'AHMED KHALED',
    expiry: '12/28',
    cvv: '321',
    saveCard: true
  })

  const [walletPhone, setWalletPhone] = useState('01012345678')
  const [instapayRef, setInstapayRef] = useState('')

  const [processing, setProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [receipt, setReceipt] = useState(null)

  // Keep local mode synced when modal re-opens with a different prop
  React.useEffect(() => {
    if (isOpen) {
      setActiveMode(mode)
      setReceipt(null)
      setErrorMsg(null)
      if (mode === 'topup' && selectedMethod === PAYMENT_METHODS.WALLET) {
        setSelectedMethod(PAYMENT_METHODS.CREDIT_CARD)
      }
    }
  }, [isOpen, mode])

  if (!isOpen) return null

  const effectiveAmount = isTopUp
    ? isCustom
      ? Number(customAmount) || 0
      : topUpAmount
    : targetAmount

  const gatewayFee =
    selectedMethod === PAYMENT_METHODS.WALLET
      ? 0
      : selectedMethod === PAYMENT_METHODS.CREDIT_CARD
        ? Math.max(5, Math.round(effectiveAmount * 0.025))
        : selectedMethod === PAYMENT_METHODS.INSTAPAY
          ? 5
          : Math.max(3, Math.round(effectiveAmount * 0.015))

  const gatewayFeeLabel =
    selectedMethod === PAYMENT_METHODS.WALLET
      ? 'Free (Wallet perk)'
      : selectedMethod === PAYMENT_METHODS.CREDIT_CARD
        ? `EGP ${gatewayFee} (2.5%)`
        : selectedMethod === PAYMENT_METHODS.INSTAPAY
          ? `EGP ${gatewayFee}`
          : `EGP ${gatewayFee} (1.5%)`

  const totalCharged = effectiveAmount + gatewayFee

  const earnedStars = isTopUp
    ? effectiveAmount >= 2000
      ? 180
      : effectiveAmount >= 1000
        ? 80
        : effectiveAmount >= 500
          ? 35
          : Math.max(5, Math.round(effectiveAmount * 0.05))
    : selectedMethod === PAYMENT_METHODS.WALLET
      ? 25
      : 10

  const unlockedDiscount =
    isTopUp && effectiveAmount >= 2000
      ? '10% VIP discount unlocked on next booking'
      : isTopUp && effectiveAmount >= 1000
        ? '5% discount unlocked on next booking'
        : null

  const cardBrand = detectCardBrand(cardForm.cardNumber)
  const cleanBookingNo = String(booking?.bookingNumber || 'BK-NEW').replace(/^#/, '')

  const handleCopy = (key, value) => {
    navigator.clipboard?.writeText(value).catch(() => {})
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
  }

  const fillTestCard = () => {
    setCardForm({
      cardNumber: '4242 4242 4242 4242',
      cardHolder: 'EGHSELHA TEST CLIENT',
      expiry: '08/29',
      cvv: '888',
      saveCard: true
    })
    setErrorMsg(null)
  }

  const handleProcessPayment = async (e) => {
    e?.preventDefault()
    setErrorMsg(null)

    if (isTopUp && (!effectiveAmount || effectiveAmount <= 0)) {
      setErrorMsg('Please select or enter a valid amount greater than 0 EGP.')
      return
    }

    if (!isTopUp && selectedMethod === PAYMENT_METHODS.WALLET) {
      if (currentBalance < 200) {
        setErrorMsg(`Insufficient wallet balance (EGP ${currentBalance.toLocaleString()}). Top up your wallet or pick another method.`)
        return
      }
    }

    setProcessing(true)

    try {
      const gatewayRes = await processPaymentTransaction({
        amount: totalCharged,
        paymentMethod: selectedMethod,
        cardData: cardForm,
        walletNumber: walletPhone,
        instapayRef
      })

      if (isTopUp) {
        await customerApi.topUpWallet(effectiveAmount)
        setReceipt({
          ...gatewayRes,
          stars: earnedStars,
          perk: unlockedDiscount,
          title: 'Wallet topped up',
          description: `EGP ${effectiveAmount.toLocaleString()} added to your EGHSELHA Wallet via ${gatewayRes.gateway}.`
        })
        notify(`Wallet topped up with EGP ${effectiveAmount.toLocaleString()} (+${earnedStars} ★)`)
        onSuccess()
      } else {
        await customerApi.payDeposit(booking.id, selectedMethod)
        setReceipt({
          ...gatewayRes,
          stars: earnedStars,
          title: 'Deposit confirmed',
          description: `Booking #${cleanBookingNo} is locked in. Your certified mobile technician is being dispatched.`
        })
        notify(`Booking #${cleanBookingNo} confirmed and deposit paid`)
        onSuccess()
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Payment failed. Please verify your payment details and try again.')
    } finally {
      setProcessing(false)
    }
  }

  const methodOptions = [
    { id: PAYMENT_METHODS.CREDIT_CARD, label: 'Card', Icon: CreditCard },
    { id: PAYMENT_METHODS.INSTAPAY, label: 'Instapay', Icon: Building2 },
    { id: PAYMENT_METHODS.VODAFONE_CASH, label: 'Mobile Wallet', Icon: Smartphone },
    ...(!isTopUp ? [{ id: PAYMENT_METHODS.WALLET, label: 'My Wallet', Icon: Wallet }] : [])
  ]

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(14, 14, 16, 0.68)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      {/* CLEAN UNIFIED WARM ALABASTER CHECKOUT SHEET (NO BLACK HEADER SEAM!) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: receipt ? '460px' : '780px',
          background: 'var(--alabaster)',
          color: 'var(--ink-primary)',
          borderRadius: '22px',
          border: '1px solid rgba(24, 24, 27, 0.14)',
          boxShadow: '0 28px 70px rgba(14, 14, 16, 0.34)',
          overflow: 'hidden',
          animation: 'slideUp 0.24s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        {/* Minimal Alabaster Top Bar */}
        <div
          style={{
            padding: '18px 24px 14px',
            borderBottom: '1px solid var(--hairline-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <span className="eyebrow" style={{ display: 'block', marginBottom: '2px' }}>
              {isTopUp ? 'EGHSELHA Wallet & Rewards' : `Booking #${cleanBookingNo}`}
            </span>
            <h3
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 400,
                lineHeight: 1.05,
                color: 'var(--ink-primary)'
              }}
            >
              {receipt ? receipt.title : isTopUp ? 'Top up your wallet' : 'Confirm booking deposit'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '999px',
              background: '#ffffff',
              border: '1px solid var(--hairline-light)',
              color: 'var(--ink-secondary)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} strokeWidth={1.7} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 24px 24px' }}>
          {receipt ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '999px',
                  background: 'var(--semantic-positive-bg)',
                  color: 'var(--semantic-positive)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 14px',
                  border: '1px solid rgba(21, 128, 61, 0.2)'
                }}
              >
                <CheckCircle2 size={28} strokeWidth={1.8} />
              </div>

              <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', margin: '0 0 18px', lineHeight: 1.55 }}>
                {receipt.description}
              </p>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--hairline-light)',
                  borderRadius: '14px',
                  padding: '16px',
                  textAlign: 'left',
                  marginBottom: '18px',
                  display: 'grid',
                  gap: '10px',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>Amount paid</span>
                  <b className="mono-num">EGP {receipt.amount.toLocaleString()}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>Reference</span>
                  <span className="mono-num" style={{ color: 'var(--bronze)', fontWeight: 600 }}>{receipt.transactionId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ink-muted)' }}>Rewards earned</span>
                  <span style={{ color: '#7a571e', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={13} fill="var(--bronze)" color="var(--bronze)" /> +{receipt.stars} Stars
                  </span>
                </div>
                {receipt.perk && (
                  <div style={{ paddingTop: '8px', borderTop: '1px solid var(--hairline-light)', fontSize: '12px', color: 'var(--semantic-positive)', fontWeight: 600 }}>
                    {receipt.perk}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="lx-btn lx-glass-btn lx-glass-obsidian"
                style={{
                  width: '100%',
                  minHeight: '46px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span>Done</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleProcessPayment}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                  gap: '22px',
                  alignItems: 'start'
                }}
              >
                {/* LEFT COLUMN: PAYMENT METHOD + DETAILS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Method Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '8px' }}>
                      Payment method
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${methodOptions.length}, 1fr)`, gap: '8px' }}>
                      {methodOptions.map(({ id, label, Icon }) => {
                        const active = selectedMethod === id
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setSelectedMethod(id)
                              setErrorMsg(null)
                            }}
                            className={`lx-select-card ${active ? 'is-selected' : ''}`}
                            style={{
                              padding: '10px 6px',
                              borderRadius: '12px',
                              color: active ? 'var(--ink-primary)' : 'var(--ink-secondary)',
                              fontSize: '11.5px',
                              fontWeight: active ? 600 : 500,
                              outline: 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Icon size={17} strokeWidth={1.7} color={active ? 'var(--bronze)' : 'currentColor'} />
                            <span>{label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* METHOD 1: CREDIT / DEBIT CARD (Sleek Compact Layout) */}
                  {selectedMethod === PAYMENT_METHODS.CREDIT_CARD && (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--hairline-light)',
                        borderRadius: '14px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '11px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <CreditCard size={14} color="var(--bronze)" />
                          {cardBrand === 'mastercard' ? 'Mastercard' : 'Visa / Mastercard'}
                        </span>
                        <button
                          type="button"
                          onClick={fillTestCard}
                          className="btn soft sm"
                          style={{ minHeight: '28px', padding: '0 10px', fontSize: '11px' }}
                        >
                          <ShieldCheck size={12} /> Fill test card
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Card number (16 digits)"
                        value={cardForm.cardNumber}
                        maxLength={19}
                        onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                        style={{ ...inputStyle, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
                        required
                      />

                      <input
                        type="text"
                        placeholder="Cardholder name"
                        value={cardForm.cardHolder}
                        onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value.toUpperCase() })}
                        style={inputStyle}
                        required
                      />

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardForm.expiry}
                          onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                          style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
                          required
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          maxLength={4}
                          value={cardForm.cvv}
                          onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                          style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* METHOD 2: INSTAPAY (Refined Editorial Transfer Card) */}
                  {selectedMethod === PAYMENT_METHODS.INSTAPAY && (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--hairline-light)',
                        borderRadius: '14px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--bronze-soft)', color: 'var(--bronze)', display: 'grid', placeItems: 'center' }}>
                            <Building2 size={16} />
                          </div>
                          <div>
                            <b style={{ display: 'block', fontSize: '13px', color: 'var(--ink-primary)' }}>Instapay Instant Transfer</b>
                            <small style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Zero transfer fees · Instant verification</small>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          background: 'var(--alabaster)',
                          border: '1px solid var(--hairline-light-strong)',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}
                      >
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)' }}>
                            Payment Address (IPA)
                          </span>
                          <strong className="mono-num" style={{ fontSize: '14px', color: 'var(--ink-primary)' }}>
                            eghselha@instapay
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('ipa', 'eghselha@instapay')}
                          className="btn outline sm"
                          style={{ minHeight: '30px', padding: '0 10px', fontSize: '11px' }}
                        >
                          {copiedKey === 'ipa' ? <><Check size={12} color="var(--semantic-positive)" /> Copied</> : <><Copy size={12} /> Copy</>}
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="Instapay reference number (optional)"
                        value={instapayRef}
                        onChange={(e) => setInstapayRef(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  )}

                  {/* METHOD 3: MOBILE WALLETS (Vodafone Cash / Orange / WE) */}
                  {selectedMethod === PAYMENT_METHODS.VODAFONE_CASH && (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--hairline-light)',
                        borderRadius: '14px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--semantic-negative-bg)', color: 'var(--semantic-negative)', display: 'grid', placeItems: 'center' }}>
                          <Smartphone size={16} />
                        </div>
                        <div>
                          <b style={{ display: 'block', fontSize: '13px', color: 'var(--ink-primary)' }}>Mobile Wallet Transfer</b>
                          <small style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>Vodafone Cash · Orange · Etisalat · WE</small>
                        </div>
                      </div>

                      <div
                        style={{
                          background: 'var(--alabaster)',
                          border: '1px solid var(--hairline-light-strong)',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}
                      >
                        <div>
                          <span style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-muted)' }}>
                            Official Wallet Number
                          </span>
                          <strong className="mono-num" style={{ fontSize: '14px', color: 'var(--ink-primary)' }}>
                            0101 234 5678
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('vfc', '01012345678')}
                          className="btn outline sm"
                          style={{ minHeight: '30px', padding: '0 10px', fontSize: '11px' }}
                        >
                          {copiedKey === 'vfc' ? <><Check size={12} color="var(--semantic-positive)" /> Copied</> : <><Copy size={12} /> Copy</>}
                        </button>
                      </div>

                      <input
                        type="tel"
                        placeholder="Your wallet phone number"
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value)}
                        style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                  )}

                  {/* METHOD 4: EGHSELHA WALLET (In Deposit Mode) */}
                  {!isTopUp && selectedMethod === PAYMENT_METHODS.WALLET && (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--hairline-light)',
                        borderRadius: '14px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--ink-muted)', display: 'block' }}>Available Wallet Balance</span>
                          <strong className="mono-num" style={{ fontSize: '22px', color: currentBalance >= 200 ? 'var(--ink-primary)' : 'var(--semantic-negative)' }}>
                            EGP {currentBalance.toLocaleString()}
                          </strong>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '999px',
                            background: 'var(--bronze-soft)',
                            color: '#7a571e',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Star size={11} fill="var(--bronze)" color="var(--bronze)" /> +25 Bonus Stars
                        </span>
                      </div>

                      {currentBalance < 200 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--semantic-negative-bg)', borderRadius: '10px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--semantic-negative)' }}>
                            Need EGP {(200 - currentBalance).toLocaleString()} more to pay from wallet.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMode('topup')
                              setSelectedMethod(PAYMENT_METHODS.CREDIT_CARD)
                              setErrorMsg(null)
                            }}
                            className="btn primary sm"
                            style={{ minHeight: '30px', padding: '0 12px', fontSize: '11px', flexShrink: 0 }}
                          >
                            <Plus size={12} /> Top up now
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: 'var(--semantic-positive)', background: 'var(--semantic-positive-bg)', padding: '9px 12px', borderRadius: '9px' }}>
                          Instant deduction of EGP 200 · Remaining balance: <b>EGP {(currentBalance - 200).toLocaleString()}</b>
                        </div>
                      )}
                    </div>
                  )}

                  {errorMsg && (
                    <div
                      style={{
                        background: 'var(--semantic-negative-bg)',
                        border: '1px solid rgba(185, 28, 28, 0.25)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        color: 'var(--semantic-negative)',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <AlertCircle size={15} style={{ flexShrink: 0 }} />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: AMOUNT / REWARDS SUMMARY + SUBMIT */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--hairline-light)',
                    borderRadius: '16px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  {isTopUp && (
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '8px' }}>
                        Select top-up amount (EGP)
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '8px' }}>
                        {TOPUP_PRESETS.map((item) => {
                          const active = !isCustom && topUpAmount === item.amount
                          return (
                            <button
                              key={item.amount}
                              type="button"
                              onClick={() => {
                                setTopUpAmount(item.amount)
                                setIsCustom(false)
                              }}
                              className={`lx-select-card ${active ? 'is-selected' : ''}`}
                              style={{
                                padding: '8px 2px',
                                borderRadius: '9px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: active ? 'var(--bronze)' : 'var(--ink-secondary)',
                                outline: 'none'
                              }}
                            >
                              +{item.amount}
                            </button>
                          )
                        })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          placeholder="Custom amount (e.g. 350)"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value)
                            setIsCustom(true)
                          }}
                          style={{ ...inputStyle, padding: '8px 12px', fontSize: '12.5px' }}
                        />
                        <span className="mono-num" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted)' }}>EGP</span>
                      </div>
                    </div>
                  )}

                  {/* Loyalty Stars & Discount Reward Callout */}
                  <div
                    style={{
                      background: 'var(--bronze-soft)',
                      border: '1px solid rgba(166, 124, 55, 0.28)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                      <span style={{ color: '#7a571e', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Sparkles size={13} color="var(--bronze)" /> Wallet Rewards
                      </span>
                      <b className="mono-num" style={{ color: '#7a571e', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={12} fill="var(--bronze)" color="var(--bronze)" /> +{earnedStars} Stars
                      </b>
                    </div>
                    <span style={{ fontSize: '11.5px', color: '#8d672b' }}>
                      {unlockedDiscount || 'Top up EGP 1,000+ for 5% off or EGP 2,000+ for 10% VIP discount.'}
                    </span>
                  </div>

                  {/* Summary Totals */}
                  <div style={{ display: 'grid', gap: '7px', fontSize: '12.5px', paddingTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-secondary)' }}>
                      <span>Amount</span>
                      <span className="mono-num" style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>
                        EGP {effectiveAmount.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-secondary)' }}>
                      <span>Gateway fee</span>
                      <span
                        className="mono-num"
                        style={{
                          color: gatewayFee === 0 ? 'var(--semantic-positive)' : 'var(--ink-primary)',
                          fontWeight: 600
                        }}
                      >
                        {gatewayFeeLabel}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--hairline-light)'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)' }}>Total charged</span>
                      <strong className="mono-num" style={{ fontSize: '20px', color: 'var(--ink-primary)' }}>
                        EGP {totalCharged.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="lx-btn lx-glass-btn lx-glass-obsidian"
                    style={{
                      width: '100%',
                      minHeight: '46px',
                      borderRadius: '999px',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      cursor: processing ? 'not-allowed' : 'pointer',
                      opacity: processing ? 0.65 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {processing ? (
                      <span>Verifying payment…</span>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>
                          {isTopUp
                            ? `Pay EGP ${totalCharged.toLocaleString()} & top up`
                            : `Pay EGP ${totalCharged.toLocaleString()} deposit`}
                        </span>
                        <ArrowRight size={15} className="lx-arrow" />
                      </>
                    )}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: 'var(--ink-muted)', fontSize: '11px' }}>
                    <ShieldCheck size={13} color="var(--semantic-positive)" />
                    <span>256-bit SSL encrypted · Instant confirmation</span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
