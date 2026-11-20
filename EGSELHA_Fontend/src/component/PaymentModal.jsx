import React, { useState } from 'react'
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  ArrowRight,
  Smartphone,
  Wallet,
  Building2,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import {
  PAYMENT_METHODS,
  formatCardNumber,
  formatExpiry,
  detectCardBrand,
  processPaymentTransaction
} from '../services/paymentGateway'
import { customerApi } from '../services/customerApi'

const TOPUP_PRESETS = [100, 250, 500, 1000, 2000]

export default function PaymentModal({
  isOpen,
  onClose,
  mode = 'topup', // 'topup' | 'deposit'
  booking = null,
  currentBalance = 0,
  onSuccess = () => {},
  notify = () => {}
}) {
  if (!isOpen) return null

  const isTopUp = mode === 'topup'
  const targetAmount = isTopUp ? null : 200

  // State
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS.CREDIT_CARD)
  const [topUpAmount, setTopUpAmount] = useState(500)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  // Credit Card Form State
  const [cardForm, setCardForm] = useState({
    cardNumber: '4123 4567 8901 4012',
    cardHolder: 'AHMED KHALED',
    expiry: '12/28',
    cvv: '321',
    saveCard: true
  })

  // Mobile Wallet State
  const [walletPhone, setWalletPhone] = useState('01012345678')

  // Instapay State
  const [instapayRef, setInstapayRef] = useState('')

  // Processing & Confirmation State
  const [processing, setProcessing] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [receipt, setReceipt] = useState(null)

  const effectiveAmount = isTopUp
    ? isCustom
      ? Number(customAmount) || 0
      : topUpAmount
    : targetAmount

  const cardBrand = detectCardBrand(cardForm.cardNumber)

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
      setErrorMsg('يرجى تحديد مبلغ صالح للشحن (أكبر من 0 جنيه).')
      return
    }

    if (!isTopUp && selectedMethod === PAYMENT_METHODS.WALLET) {
      if (currentBalance < 200) {
        setErrorMsg(`رصيد محفظتك (${currentBalance} ج.م) غير كافٍ لسداد العربون (200 ج.م). يرجى اختيار الدفع بالفيزا أو شحن المحفظة.`)
        return
      }
    }

    setProcessing(true)

    try {
      // 1. Process simulated gateway verification & 3D Secure
      const gatewayRes = await processPaymentTransaction({
        amount: effectiveAmount,
        paymentMethod: selectedMethod,
        cardData: cardForm,
        walletNumber: walletPhone,
        instapayRef
      })

      // 2. Commit transaction to backend database
      if (isTopUp) {
        await customerApi.topUpWallet(effectiveAmount)
        setReceipt({
          ...gatewayRes,
          title: 'تم شحن المحفظة بنجاح!',
          description: `تم إيداع مبلغ ${effectiveAmount.toLocaleString()} ج.م في رصيدك لدى إغسلها عبر ${gatewayRes.gateway}.`
        })
        notify(`تم شحن المحفظة بنجاح بمبلغ ${effectiveAmount.toLocaleString()} ج.م`)
        onSuccess()
      } else {
        // Pay deposit for booking
        await customerApi.payDeposit(booking.id, selectedMethod)
        setReceipt({
          ...gatewayRes,
          title: 'تم دفع العربون وتأكيد الحجز!',
          description: `تم سداد عربون الحجز #${booking.bookingNumber} بنجاح. سيتم توجيه أقرب فني مجهز فوراً.`
        })
        notify(`تم تأكيد الحجز #${booking.bookingNumber} وسداد العربون بنجاح`)
        onSuccess()
      }
    } catch (err) {
      setErrorMsg(err?.message || 'تعذر إتمام عملية الدفع. يرجى مراجعة بيانات البطاقة والمحاولة مجدداً.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(6, 12, 24, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          background: '#ffffff',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(7, 23, 44, 0.35)',
          border: '1px solid #e2e8f0',
          animation: 'slideUp 0.25s ease'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #07172c 0%, #0d2847 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(14, 165, 233, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, fontFamily: 'Manrope, sans-serif' }}>
                {isTopUp ? 'شحن رصيد المحفظة (Wallet Top-Up)' : 'سداد عربون الحجز (Pay Deposit)'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#93c5fd' }}>
                {isTopUp
                  ? 'بوابة دفع آمنة ومشفرة · فيزا، ماستركارد، ومحافظ إلكترونية'
                  : `حجز رقم: ${booking?.bookingNumber || 'BK-NEW'} · عربون إجباري 200 ج.م`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#cbd5e1',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '78vh', overflowY: 'auto' }}>
          {receipt ? (
            /* Success Receipt View */
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '4px solid #bbf7d0'
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#102a40', margin: '0 0 6px' }}>
                {receipt.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
                {receipt.description}
              </p>

              {/* Receipt Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '18px',
                  textAlign: 'left',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>المبلغ المدفوع:</span>
                  <b style={{ fontSize: '15px', color: '#0f172a' }}>
                    {receipt.amount.toLocaleString()} {receipt.currency}
                  </b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>رقم المعاملة (Ref):</span>
                  <code style={{ fontSize: '12px', color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                    {receipt.transactionId}
                  </code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>بوابة الدفع:</span>
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>
                    {receipt.gateway}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>الحالة:</span>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '9999px', fontWeight: 800 }}>
                    ناجحة ومؤكدة بنكياً ✓
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="landing-btn-signup"
                style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '12px' }}
              >
                تم والعودة للتطبيق
              </button>
            </div>
          ) : (
            /* Main Payment Form */
            <form onSubmit={handleProcessPayment}>
              {/* Top-up Amount Selector (If in Topup mode) */}
              {isTopUp && (
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                    اختر مبلغ الشحن (EGP):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    {TOPUP_PRESETS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setTopUpAmount(amt)
                          setIsCustom(false)
                        }}
                        style={{
                          border: !isCustom && topUpAmount === amt ? '2px solid #0284c7' : '1px solid #cbd5e1',
                          background: !isCustom && topUpAmount === amt ? '#e0f2fe' : '#ffffff',
                          color: !isCustom && topUpAmount === amt ? '#0284c7' : '#475569',
                          fontWeight: 700,
                          fontSize: '12px',
                          padding: '10px 4px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount option */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      placeholder="أو اكتب مبلغاً آخر (مثال: 350)"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setIsCustom(true)
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: isCustom ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>EGP</span>
                  </div>
                </div>
              )}

              {/* Payment Methods Tabs */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                  طريقة السداد:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: isTopUp ? '1fr 1fr 1fr' : 'repeat(4, 1fr)', gap: '8px' }}>
                  {/* Option 1: Credit Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod(PAYMENT_METHODS.CREDIT_CARD)}
                    style={{
                      border: selectedMethod === PAYMENT_METHODS.CREDIT_CARD ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      background: selectedMethod === PAYMENT_METHODS.CREDIT_CARD ? '#f0f9ff' : '#ffffff',
                      color: selectedMethod === PAYMENT_METHODS.CREDIT_CARD ? '#0284c7' : '#475569',
                      padding: '10px 6px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CreditCard size={18} />
                    <span>فيزا / ماستركارد</span>
                  </button>

                  {/* Option 2: Instapay */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod(PAYMENT_METHODS.INSTAPAY)}
                    style={{
                      border: selectedMethod === PAYMENT_METHODS.INSTAPAY ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      background: selectedMethod === PAYMENT_METHODS.INSTAPAY ? '#f0f9ff' : '#ffffff',
                      color: selectedMethod === PAYMENT_METHODS.INSTAPAY ? '#0284c7' : '#475569',
                      padding: '10px 6px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Building2 size={18} />
                    <span>إنستاباي (Instapay)</span>
                  </button>

                  {/* Option 3: Mobile Wallet */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod(PAYMENT_METHODS.VODAFONE_CASH)}
                    style={{
                      border: selectedMethod === PAYMENT_METHODS.VODAFONE_CASH ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      background: selectedMethod === PAYMENT_METHODS.VODAFONE_CASH ? '#f0f9ff' : '#ffffff',
                      color: selectedMethod === PAYMENT_METHODS.VODAFONE_CASH ? '#0284c7' : '#475569',
                      padding: '10px 6px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Smartphone size={18} />
                    <span>فودافون كاش</span>
                  </button>

                  {/* Option 4: In-app Wallet (For Deposit only) */}
                  {!isTopUp && (
                    <button
                      type="button"
                      onClick={() => setSelectedMethod(PAYMENT_METHODS.WALLET)}
                      style={{
                        border: selectedMethod === PAYMENT_METHODS.WALLET ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: selectedMethod === PAYMENT_METHODS.WALLET ? '#f0f9ff' : '#ffffff',
                        color: selectedMethod === PAYMENT_METHODS.WALLET ? '#0284c7' : '#475569',
                        padding: '10px 6px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Wallet size={18} />
                      <span>رصيد محفظتي</span>
                    </button>
                  )}
                </div>
              </div>

              {/* METHOD 1: CREDIT CARD / VISA FORM */}
              {selectedMethod === PAYMENT_METHODS.CREDIT_CARD && (
                <div>
                  {/* Interactive Visual Credit Card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #0b1f3a 0%, #173860 50%, #081a33 100%)',
                      borderRadius: '18px',
                      padding: '20px 24px',
                      color: '#ffffff',
                      marginBottom: '18px',
                      boxShadow: '0 12px 25px rgba(11, 31, 58, 0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* EMV Chip */}
                        <div
                          style={{
                            width: '36px',
                            height: '26px',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, #fef08a 0%, #eab308 100%)',
                            border: '1px solid #ca8a04'
                          }}
                        />
                        {/* Contactless waves */}
                        <span style={{ fontSize: '16px', opacity: 0.8 }}>) ) )</span>
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
                        {cardBrand === 'mastercard' ? 'Mastercard' : 'VISA'}
                      </span>
                    </div>

                    <div style={{ fontSize: '18px', letterSpacing: '2.5px', fontFamily: 'monospace', fontWeight: 700, marginBottom: '16px' }}>
                      {cardForm.cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px' }}>
                      <div>
                        <span style={{ display: 'block', opacity: 0.7, fontSize: '9px' }}>CARD HOLDER</span>
                        <b style={{ letterSpacing: '0.5px' }}>{cardForm.cardHolder || 'FULL NAME'}</b>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', opacity: 0.7, fontSize: '9px' }}>EXPIRES</span>
                        <b>{cardForm.expiry || 'MM/YY'}</b>
                      </div>
                    </div>
                  </div>

                  {/* Quick Fill Test Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>أدخل بيانات البطاقة البنكية:</span>
                    <button
                      type="button"
                      onClick={fillTestCard}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        color: '#0284c7',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={12} />
                      <span>ملء ببطاقة تجريبية (Test Card)</span>
                    </button>
                  </div>

                  {/* Card Form Inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <input
                        type="text"
                        placeholder="رقم البطاقة (16 رقم)"
                        value={cardForm.cardNumber}
                        maxLength={19}
                        onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          fontFamily: 'monospace',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="اسم حامل البطاقة (باللغة الإنجليزية كما على البطاقة)"
                        value={cardForm.cardHolder}
                        onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value.toUpperCase() })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <input
                        type="text"
                        placeholder="تاريخ الانتهاء (MM/YY)"
                        maxLength={5}
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                      <input
                        type="password"
                        placeholder="رمز الأمان (CVV 3 أرقام)"
                        maxLength={4}
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 2: INSTAPAY */}
              {selectedMethod === PAYMENT_METHODS.INSTAPAY && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', marginBottom: '8px' }}>
                    <Building2 size={18} />
                    <b style={{ fontSize: '13px' }}>الدفع الفوري عبر شبكة إنستاباي (Instapay)</b>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px' }}>
                    قم بتحويل المبلغ المطلوب عبر تطبيق إنستاباي إلى العنوان التالي:
                  </p>
                  <div style={{ background: '#fff', border: '1px dashed #0284c7', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>عنوان الدفع اللحظي (IPA):</span>
                    <strong style={{ fontSize: '14px', color: '#0284c7' }}>eghselha@instapay</strong>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="رقم مرجع التحويل من إنستاباي (اختياري للتأكيد الفوري)"
                      value={instapayRef}
                      onChange={(e) => setInstapayRef(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* METHOD 3: VODAFONE CASH */}
              {selectedMethod === PAYMENT_METHODS.VODAFONE_CASH && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', marginBottom: '8px' }}>
                    <Smartphone size={18} />
                    <b style={{ fontSize: '13px' }}>الدفع عبر المحافظ الإلكترونية (فودافون كاش / أورنج / وي)</b>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px' }}>
                    حول المبلغ المطلوب إلى رقم محفظة إغسلها الرسمية:
                  </p>
                  <div style={{ background: '#fff', border: '1px dashed #ef4444', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>رقم المحفظة:</span>
                    <strong style={{ fontSize: '15px', color: '#b91c1c', letterSpacing: '1px' }}>0101 234 5678</strong>
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="رقم هاتفك الذي قمت بالتحويل منه"
                      value={walletPhone}
                      onChange={(e) => setWalletPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* METHOD 4: IN-APP WALLET */}
              {!isTopUp && selectedMethod === PAYMENT_METHODS.WALLET && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#15803d' }}>رصيد محفظتك المتاح:</span>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#166534', margin: '4px 0 0' }}>
                        {currentBalance.toLocaleString()} EGP
                      </h4>
                    </div>
                    <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontWeight: 700 }}>
                      خصم فوري 200 ج.م
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message Alert */}
              {errorMsg && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#b91c1c',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Summary Breakdown */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '18px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                  <span>المبلغ المطلوب:</span>
                  <span style={{ fontWeight: 600 }}>{effectiveAmount.toLocaleString()} EGP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                  <span>رسوم البوابة (Gateway Fee):</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>0.00 EGP (مجاناً)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#0f172a', fontWeight: 800, paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <span>إجمالي الخصم:</span>
                  <span style={{ color: '#0284c7' }}>{effectiveAmount.toLocaleString()} EGP</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="landing-btn-signup"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '14px',
                  borderRadius: '12px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  opacity: processing ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري الاتصال بالبنك والتحقق الآمن (3DS)...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>
                      {isTopUp
                        ? `تأكيد ودفع ${effectiveAmount.toLocaleString()} ج.م بالفيزا`
                        : `سداد العربون (${effectiveAmount} ج.م) وتأكيد الحجز`}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', color: '#94a3b8', fontSize: '11px' }}>
                <ShieldCheck size={14} color="#16a34a" />
                <span>دفع مشفر بأمان 256-bit SSL وفق معايير البنك المركزي المصري PCI-DSS</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
