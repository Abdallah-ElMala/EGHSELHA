// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../component/BrandLogo';
import FieldError from '../../component/FieldError';
import { extractApiErrors, EMAIL_REGEX } from '../../utils/validation';
import {
  LogIn,
  KeyRound,
  Mail,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Car,
  Droplets,
  Clock,
  User,
  Wrench,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';

export default function Login() {
  const { login, verifyTwoFactor, googleLogin, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState(null);

  // 2FA Challenge State
  const [twoFactorActive, setTwoFactorActive] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorEmail, setTwoFactorEmail] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState(null);

  const demoAccounts = [
    {
      role: 'عميل (Customer)',
      badge: 'عميل',
      email: 'ahmed.khaled@example.com',
      pass: 'demo123',
      icon: User,
      color: '#087cf0',
      bg: '#eaf4ff'
    },
    {
      role: 'فني (Technician)',
      badge: 'فني',
      email: 'mostafa.ali@email.com',
      pass: 'demo123',
      icon: Wrench,
      color: '#10b981',
      bg: '#e6f8f0'
    },
    {
      role: 'مدير (Admin)',
      badge: 'مدير',
      email: 'admin@eghselha.com',
      pass: 'admin123',
      icon: ShieldCheck,
      color: '#7c3aed',
      bg: '#f3edff'
    }
  ];

  const handleDemoFill = (acc) => {
    setForm({ email: acc.email, password: acc.pass });
    setErrors({});
    setGlobalMessage({
      type: 'info',
      text: `تم اختيار بيانات حساب ${acc.role} بنجاح.`
    });
  };

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
    if (!form.email || !form.email.trim()) {
      errs.email = 'البريد الإلكتروني مطلوب.';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errs.email = 'صيغة البريد الإلكتروني غير صحيحة.';
    }

    if (!form.password) {
      errs.password = 'كلمة المرور مطلوبة.';
    } else if (form.password.length < 6) {
      errs.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }

    const r = (role || '').toUpperCase();
    if (r === 'ADMIN') navigate('/admin', { replace: true });
    else if (r === 'TECHNICIAN') navigate('/technician', { replace: true });
    else navigate('/customer', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalMessage(null);

    try {
      const res = await login(form.email.trim(), form.password);

      if (res.requiresTwoFactor) {
        setTwoFactorActive(true);
        setTwoFactorEmail(form.email.trim());
        setGlobalMessage({
          type: 'info',
          text: 'تم إرسال رمز التحقق بخطوتين (2FA) إلى بريدك الإلكتروني.'
        });
        setLoading(false);
        return;
      }

      redirectAfterLogin(res.user?.role);
    } catch (err) {
      const apiErrors = extractApiErrors(err);
      if (Object.keys(apiErrors).length > 0) {
        setErrors(apiErrors);
      }
      setGlobalMessage({
        type: 'error',
        text: err.message || 'بيانات الدخول غير صحيحة، يرجى التحقق من البريد وكلمة المرور.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.trim().length !== 6) {
      setErrors({ twoFactorCode: 'يرجى إدخال رمز التحقق المكون من 6 أرقام.' });
      return;
    }

    setLoading(true);
    try {
      const res = await verifyTwoFactor(twoFactorEmail, twoFactorCode.trim());
      redirectAfterLogin(res.user?.role);
    } catch (err) {
      setErrors({ twoFactorCode: err.message || 'رمز التحقق غير صحيح أو انتهت صلاحيته.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setGlobalMessage(null);
    try {
      const res = await googleLogin('mock-google-token-demo-' + Date.now());
      redirectAfterLogin(res.user?.role);
    } catch (err) {
      setGlobalMessage({ type: 'error', text: err.message || 'فشل تسجيل الدخول بواسطة Google.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotEmail = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !EMAIL_REGEX.test(forgotEmail.trim())) {
      setForgotMessage({ type: 'error', text: 'يرجى إدخال بريد إلكتروني صحيح.' });
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(forgotEmail.trim());
      setForgotStep(2);
      setForgotMessage({
        type: 'success',
        text: 'تم إرسال رمز استعادة كلمة المرور إلى بريدك الإلكتروني.'
      });
    } catch (err) {
      setForgotMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء إرسال البريد.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword || newPassword !== confirmPassword) {
      setForgotMessage({ type: 'error', text: 'يرجى التأكد من ملء جميع الحقول وتطابق كلمتي المرور.' });
      return;
    }
    setLoading(true);
    try {
      await resetPassword({
        email: forgotEmail.trim(),
        token: resetToken.trim(),
        newPassword,
        confirmPassword
      });
      setForgotMessage({
        type: 'success',
        text: 'تمت إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بها.'
      });
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForm((prev) => ({ ...prev, email: forgotEmail, password: '' }));
      }, 1800);
    } catch (err) {
      setForgotMessage({ type: 'error', text: err.message || 'فشلت إعادة تعيين كلمة المرور.' });
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
      {/* Outer Card Container with Modern Split View */}
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
          minHeight: '640px'
        }}
      >
        {/* Left Side: Brand Showcase & Features (Navy Gradient matching EGHSELHA wireframe) */}
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
          {/* Subtle Background Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(8, 124, 240, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
              filter: 'blur(40px)'
            }}
          />

          {/* Top Brand Bar */}
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
              <span>غسيل سيارات متنقل أينما كنت في القاهرة</span>
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
              سيارتك بتلمع عند باب بيتك بأعلى معايير الاحترافية
            </h1>

            <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#9fb4c7', margin: 0, maxWidth: '440px' }}>
              سجّل دخولك الآن للوصول إلى حجوزاتك، وتتبع الفني مباشرة على الخريطة، وإدارة محفظتك ومركباتك بسهولة وسرعة وأمان.
            </p>
          </div>

          {/* Feature Highlights Grid */}
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
                <Car size={20} />
              </div>
              <div>
                <b style={{ fontSize: '13px', color: '#fff', display: 'block' }}>غسيل عند باب بيتك</b>
                <small style={{ fontSize: '11px', color: '#8fa5bc' }}>فانات خدمة مجهزة بالكامل بالماء والكهرباء</small>
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
                <ShieldCheck size={20} />
              </div>
              <div>
                <b style={{ fontSize: '13px', color: '#fff', display: 'block' }}>توثيق وأمان مشدد</b>
                <small style={{ fontSize: '11px', color: '#8fa5bc' }}>تشفير JWT مع حماية Refresh Token والتحقق بخطوتين</small>
              </div>
            </div>
          </div>

          {/* Bottom Brand Meta */}
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
            <span>القاهرة · التجمع · الشيخ زايد · المعادي</span>
          </div>
        </div>

        {/* Right Side: Interactive Login Form Panel */}
        <div
          style={{
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#ffffff'
          }}
        >
          {/* Header Title */}
          <div style={{ marginBottom: '24px' }}>
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
              تسجيل الدخول إلى حسابك
            </h2>
            <p style={{ fontSize: '12px', color: '#8493a2', margin: 0 }}>
              أدخل بريدك الإلكتروني وكلمة المرور للمتابعة
            </p>
          </div>

          {/* Quick Demo Accounts Pills (Figma / EGHSELHA Interactive Style) */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #edf2f7',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '22px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#087cf0" />
                حسابات تجريبية سريعة (نقرة واحدة):
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.badge}
                    type="button"
                    onClick={() => handleDemoFill(acc)}
                    style={{
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      borderRadius: '12px',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = acc.color;
                      e.currentTarget.style.background = acc.bg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <Icon size={16} color={acc.color} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>
                      {acc.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global Alert Notification */}
          {globalMessage && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                marginBottom: '18px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                background: globalMessage.type === 'error' ? '#fef2f2' : '#eff6ff',
                border: `1px solid ${globalMessage.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
                color: globalMessage.type === 'error' ? '#b91c1c' : '#1d4ed8'
              }}
            >
              {globalMessage.type === 'error' ? (
                <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
              ) : (
                <CheckCircle2 size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
              )}
              <span>{globalMessage.text}</span>
            </div>
          )}

          {/* 2FA Form or Standard Login Form */}
          {twoFactorActive ? (
            <form onSubmit={handleVerify2FA} style={{ display: 'grid', gap: '16px' }}>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '14px',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 10px auto'
                  }}
                >
                  <ShieldCheck size={24} />
                </div>
                <b style={{ fontSize: '14px', color: '#166534', display: 'block' }}>التحقق بخطوتين (2FA)</b>
                <small style={{ fontSize: '11px', color: '#15803d', display: 'block', marginTop: '4px' }}>
                  أدخل الرمز المكون من 6 أرقام المرسل إلى: <br />
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{twoFactorEmail}</span>
                </small>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  رمز التحقق (6 أرقام)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px',
                    textAlign: 'center',
                    letterSpacing: '8px',
                    fontSize: '22px',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    borderRadius: '12px',
                    border: errors.twoFactorCode ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
                <FieldError error={errors.twoFactorCode} />
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
                  color: '#fff',
                  boxShadow: '0 6px 18px rgba(8, 124, 240, 0.35)',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'جاري التحقق...' : 'تأكيد الرمز وتسجيل الدخول'}
              </button>

              <button
                type="button"
                onClick={() => setTwoFactorActive(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginTop: '4px'
                }}
              >
                ← العودة إلى تسجيل الدخول العادي
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#475569',
                    marginBottom: '6px'
                  }}
                >
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
                    padding: '12px 14px',
                    fontSize: '13px',
                    borderRadius: '12px',
                    border: errors.email ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    background: errors.email ? '#fffbfb' : '#ffffff',
                    outline: 'none',
                    color: '#1e293b',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) e.target.style.borderColor = '#087cf0';
                  }}
                  onBlur={(e) => {
                    if (!errors.email) e.target.style.borderColor = '#cbd5e1';
                  }}
                />
                <FieldError error={errors.email} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#475569'
                    }}
                  >
                    <KeyRound size={14} color="#64748b" />
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotEmail(form.email);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#087cf0',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '13px',
                    borderRadius: '12px',
                    border: errors.password ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    background: errors.password ? '#fffbfb' : '#ffffff',
                    outline: 'none',
                    color: '#1e293b',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (!errors.password) e.target.style.borderColor = '#087cf0';
                  }}
                  onBlur={(e) => {
                    if (!errors.password) e.target.style.borderColor = '#cbd5e1';
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
                  marginTop: '4px',
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
                    <LogIn size={16} />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>أو عبر</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              {/* Google OAuth Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>المتابعة باستخدام Google</span>
              </button>
            </form>
          )}

          {/* Footer Register Link */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              fontSize: '12px',
              color: '#64748b'
            }}
          >
            ليس لديك حساب بعد؟{' '}
            <Link
              to="/register"
              style={{
                color: '#087cf0',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>إنشاء حساب جديد</span>
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (Matching EGHSELHA App.css modal-overlay & modal-card) */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>استعادة كلمة المرور</h3>
                <p>
                  {forgotStep === 1
                    ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رمز الاستعادة.'
                    : 'أدخل الرمز المرسل إلى بريدك مع كلمة المرور الجديدة.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {forgotMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    fontSize: '11px',
                    background: forgotMessage.type === 'error' ? '#fef2f2' : '#eff6ff',
                    border: `1px solid ${forgotMessage.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
                    color: forgotMessage.type === 'error' ? '#b91c1c' : '#1d4ed8'
                  }}
                >
                  {forgotMessage.text}
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleSendForgotEmail} style={{ display: 'grid', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      dir="ltr"
                      required
                      style={{
                        width: '100%',
                        padding: '11px 13px',
                        fontSize: '13px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn outline"
                      onClick={() => setShowForgotModal(false)}
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn primary"
                      style={{ background: '#087cf0' }}
                    >
                      {loading ? 'جاري الإرسال...' : 'إرسال رمز الاستعادة'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      رمز التحقق المرسل
                    </label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="123456"
                      dir="ltr"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '13px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      كلمة المرور الجديدة
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '13px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '13px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                    <button
                      type="button"
                      className="btn outline"
                      onClick={() => setShowForgotModal(false)}
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn primary"
                      style={{ background: '#087cf0' }}
                    >
                      {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
