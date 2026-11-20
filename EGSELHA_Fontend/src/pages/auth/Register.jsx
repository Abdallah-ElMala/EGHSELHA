// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../component/BrandLogo';
import FieldError from '../../component/FieldError';
import {
  extractApiErrors,
  EMAIL_REGEX,
  EGYPTIAN_PHONE_REGEX
} from '../../utils/validation';
import {
  UserPlus,
  User,
  Wrench,
  Mail,
  Phone,
  KeyRound,
  IdCard,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Car,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function Register() {
  const { registerCustomer, registerTechnician } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'technician'
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    nationalId: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName || !form.fullName.trim() || form.fullName.trim().length < 3) {
      errs.fullName = 'الاسم بالكامل يجب أن يكون 3 أحرف على الأقل.';
    }

    if (!form.email || !form.email.trim() || !EMAIL_REGEX.test(form.email.trim())) {
      errs.email = 'يرجى إدخال بريد إلكتروني صالح.';
    }

    if (!form.phone || !form.phone.trim() || !EGYPTIAN_PHONE_REGEX.test(form.phone.trim())) {
      errs.phone = 'رقم الهاتف المصري غير صحيح (مثال: 01012345678).';
    }

    if (!form.password || form.password.length < 6) {
      errs.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
    }

    if (activeTab === 'technician') {
      if (!form.nationalId || !/^[0-9]{14}$/.test(form.nationalId.trim())) {
        errs.nationalId = 'الرقم القومي للفني يجب أن يتكون من 14 رقماً.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError(null);

    try {
      if (activeTab === 'customer') {
        await registerCustomer({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password
        });
        navigate('/customer', { replace: true });
      } else {
        await registerTechnician({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          nationalId: form.nationalId.trim()
        });
        navigate('/technician', { replace: true });
      }
    } catch (err) {
      const apiErrors = extractApiErrors(err);
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      }
      setGlobalError(err.message || 'حدث خطأ أثناء إنشاء الحساب. يرجى مراجعة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f7fb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'DM Sans', 'Manrope', -apple-system, sans-serif"
      }}
      dir="rtl"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1080px',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(7, 27, 45, 0.08)',
          border: '1px solid #e9eef4',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          minHeight: '660px'
        }}
      >
        {/* Left Side: Brand Showcase */}
        <div
          style={{
            background: 'linear-gradient(165deg, #07172c 0%, #0c2942 55%, #051425 100%)',
            color: '#fff',
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
              <BrandLogo size={46} variant="blue" />
              <div>
                <b style={{ display: 'block', fontSize: '20px', letterSpacing: '0.5px', fontFamily: 'Manrope, sans-serif', color: '#fff' }}>
                  إغسـلـهـا · EGHSELHA
                </b>
                <small style={{ display: 'block', fontSize: '11px', color: '#60b4ff', fontWeight: 600, letterSpacing: '0.8px', marginTop: '2px' }}>
                  DOORSTEP MOBILE CAR WASH
                </small>
              </div>
            </Link>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(8, 124, 240, 0.16)',
                border: '1px solid rgba(8, 124, 240, 0.35)',
                borderRadius: '30px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#60b4ff',
                marginBottom: '20px'
              }}
            >
              <Sparkles size={14} />
              <span>انضم إلى آلاف العملاء والفنيين في القاهرة</span>
            </div>

            <h1
              style={{
                font: '800 28px Manrope, sans-serif',
                color: '#ffffff',
                lineHeight: 1.35,
                margin: '0 0 14px 0',
                letterSpacing: '-0.5px'
              }}
            >
              ابدأ تجربتك المميزة مع إغسلها اليوم
            </h1>

            <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#9fb4c7', margin: 0, maxWidth: '440px' }}>
              سواء كنت تبحث عن غسيل فاخر لسيارتك عند باب منزلك، أو ترغب في الانضمام كفني محترف بعوائد مجزية، فمكانك معنا.
            </p>
          </div>

          <div style={{ margin: '36px 0', display: 'grid', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '12px 16px',
                borderRadius: '14px'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(8, 124, 240, 0.2)',
                  color: '#60b4ff',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                <User size={20} />
              </div>
              <div>
                <b style={{ fontSize: '13px', color: '#fff', display: 'block' }}>للعملاء</b>
                <small style={{ fontSize: '11px', color: '#8fa5bc' }}>حجز فوري، باقات متنوعة، ومحفظة إلكترونية بنقاط ولاء</small>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '12px 16px',
                borderRadius: '14px'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#6ee7b7',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                <Wrench size={20} />
              </div>
              <div>
                <b style={{ fontSize: '13px', color: '#fff', display: 'block' }}>للفنيين</b>
                <small style={{ fontSize: '11px', color: '#8fa5bc' }}>مهام يومية مستمرة، تسوية أرباح سريعة، ومعدات متقدمة</small>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '11px',
              color: '#6e859b'
            }}
          >
            <span>© 2026 EGHSELHA Platform</span>
            <span>بوابتك لخدمة غسيل سيارات ذكية</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div
          style={{
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#ffffff'
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#087cf0',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                marginBottom: '14px'
              }}
            >
              ← العودة إلى الصفحة الرئيسية (Home)
            </Link>
            <h2
              style={{
                font: '800 24px Manrope, sans-serif',
                color: '#102a40',
                margin: '0 0 6px 0',
                letterSpacing: '-0.4px'
              }}
            >
              إنشاء حساب جديد
            </h2>
            <p style={{ fontSize: '12px', color: '#8493a2', margin: 0 }}>
              اختر نوع الحساب وأدخل بياناتك للبدء فوراً
            </p>
          </div>

          {/* Account Type Tabs matching EGHSELHA design */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '14px',
              padding: '4px',
              marginBottom: '22px'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('customer');
                setErrors({});
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                background: activeTab === 'customer' ? '#ffffff' : 'transparent',
                color: activeTab === 'customer' ? '#087cf0' : '#64748b',
                boxShadow: activeTab === 'customer' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              <User size={15} />
              <span>تسجيل كعميل</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('technician');
                setErrors({});
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                background: activeTab === 'technician' ? '#ffffff' : 'transparent',
                color: activeTab === 'technician' ? '#087cf0' : '#64748b',
                boxShadow: activeTab === 'technician' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              <Wrench size={15} />
              <span>انضمام كفني</span>
            </button>
          </div>

          {globalError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c'
              }}
            >
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                <User size={14} color="#64748b" />
                الاسم بالكامل
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="أحمد علي"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: '13px',
                  borderRadius: '12px',
                  border: errors.fullName ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  background: errors.fullName ? '#fffbfb' : '#ffffff',
                  outline: 'none',
                  color: '#1e293b',
                  boxSizing: 'border-box'
                }}
              />
              <FieldError error={errors.fullName} />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                <Mail size={14} color="#64748b" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: '13px',
                  borderRadius: '12px',
                  border: errors.email ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  background: errors.email ? '#fffbfb' : '#ffffff',
                  outline: 'none',
                  color: '#1e293b',
                  boxSizing: 'border-box'
                }}
              />
              <FieldError error={errors.email} />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                <Phone size={14} color="#64748b" />
                رقم الهاتف المحمول
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="01012345678"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: '13px',
                  borderRadius: '12px',
                  border: errors.phone ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  background: errors.phone ? '#fffbfb' : '#ffffff',
                  outline: 'none',
                  color: '#1e293b',
                  boxSizing: 'border-box'
                }}
              />
              <FieldError error={errors.phone} />
            </div>

            {activeTab === 'technician' && (
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                  <IdCard size={14} color="#64748b" />
                  الرقم القومي (14 رقماً)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={form.nationalId}
                  onChange={(e) => handleInputChange('nationalId', e.target.value)}
                  placeholder="29801011234567"
                  dir="ltr"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: '13px',
                    borderRadius: '12px',
                    border: errors.nationalId ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    background: errors.nationalId ? '#fffbfb' : '#ffffff',
                    outline: 'none',
                    color: '#1e293b',
                    boxSizing: 'border-box'
                  }}
                />
                <FieldError error={errors.nationalId} />
              </div>
            )}

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
                <KeyRound size={14} color="#64748b" />
                كلمة المرور
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: '13px',
                  borderRadius: '12px',
                  border: errors.password ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  background: errors.password ? '#fffbfb' : '#ffffff',
                  outline: 'none',
                  color: '#1e293b',
                  boxSizing: 'border-box'
                }}
              />
              <FieldError error={errors.password} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '12px',
                background: '#087cf0',
                color: '#ffffff',
                boxShadow: '0 6px 18px rgba(8, 124, 240, 0.32)',
                cursor: 'pointer',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <div style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>{activeTab === 'customer' ? 'تسجيل حساب عميل جديد' : 'تقديم طلب الانضمام كفني'}</span>
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              fontSize: '12px',
              color: '#64748b'
            }}
          >
            لديك حساب بالفعل؟{' '}
            <Link
              to="/login"
              style={{
                color: '#087cf0',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>تسجيل الدخول</span>
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
