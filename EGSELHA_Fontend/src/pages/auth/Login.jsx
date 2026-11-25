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
  Droplets,
  Clock,
  User,
  Wrench,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';

export default function Login() {
  const { login, verifyTwoFactor, forgotPassword, resetPassword } = useAuth();
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
      role: 'Customer',
      badge: 'Customer',
      email: 'ahmed.khaled@example.com',
      pass: 'demo123',
      icon: User,
      color: '#087cf0',
      bg: '#eaf4ff'
    },
    {
      role: 'Technician',
      badge: 'Technician',
      email: 'mostafa.ali@email.com',
      pass: 'demo123',
      icon: Wrench,
      color: '#10b981',
      bg: '#e6f8f0'
    },
    {
      role: 'Admin',
      badge: 'Admin',
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
    if (location.state?.from) {
      location.state.from = null;
    }
    setGlobalMessage({
      type: 'info',
      text: `Selected demo account: ${acc.role}.`
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
      errs.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errs.email = 'Invalid email address format.';
    }

    if (!form.password) {
      errs.password = 'Password is required.';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    const r = (role || '').toUpperCase();

    if (r === 'ADMIN') {
      if (from && from.startsWith('/admin')) {
        navigate(from, { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
      return;
    }

    if (r === 'TECHNICIAN') {
      if (from && from.startsWith('/technician')) {
        navigate(from, { replace: true });
      } else {
        navigate('/technician', { replace: true });
      }
      return;
    }

    if (r === 'CUSTOMER') {
      if (from && from.startsWith('/customer')) {
        navigate(from, { replace: true });
      } else {
        navigate('/customer', { replace: true });
      }
      return;
    }

    navigate('/', { replace: true });
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
          text: 'A two-factor authentication code (2FA) has been sent to your email.'
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
        text: err.message || 'Invalid credentials. Please verify your email and password.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.trim().length !== 6) {
      setErrors({ twoFactorCode: 'Please enter the 6-digit verification code.' });
      return;
    }

    setLoading(true);
    try {
      const res = await verifyTwoFactor(twoFactorEmail, twoFactorCode.trim());
      redirectAfterLogin(res.user?.role);
    } catch (err) {
      setErrors({ twoFactorCode: err.message || 'Invalid or expired verification code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotEmail = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !EMAIL_REGEX.test(forgotEmail.trim())) {
      setForgotMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(forgotEmail.trim());
      setForgotStep(2);
      setForgotMessage({
        type: 'success',
        text: 'Password reset code has been sent to your email.'
      });
    } catch (err) {
      setForgotMessage({ type: 'error', text: err.message || 'An error occurred while sending the email.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword || newPassword !== confirmPassword) {
      setForgotMessage({ type: 'error', text: 'Please ensure all fields are filled and passwords match.' });
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
        text: 'Password reset successful! You can now log in.'
      });
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForm((prev) => ({ ...prev, email: forgotEmail, password: '' }));
      }, 1800);
    } catch (err) {
      setForgotMessage({ type: 'error', text: err.message || 'Password reset failed.' });
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
                  EGHSELHA
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
              <span>Mobile Car Detailing Anywhere Across Cairo</span>
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
              Showroom Shine at Your Doorstep with Premium Quality
            </h1>

            <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#9fb4c7', margin: 0, maxWidth: '440px' }}>
              Sign in to manage bookings, track assigned technicians live on GPS, and access your garage and wallet with confidence.
            </p>
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
            <span>Cairo · New Cairo · Sheikh Zayed · Maadi</span>
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
              ← Back to Home
            </Link>
            <h2
              style={{
                font: '800 24px Manrope, sans-serif',
                color: '#102a40',
                margin: '0 0 6px 0',
                letterSpacing: '-0.4px'
              }}
            >
              Sign In to Your Account
            </h2>
            <p style={{ fontSize: '12px', color: '#8493a2', margin: 0 }}>
              Enter your email and password to continue
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
                Quick Demo Accounts (1-Click):
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
                <b style={{ fontSize: '14px', color: '#166534', display: 'block' }}>Two-Factor Authentication (2FA)</b>
                <small style={{ fontSize: '11px', color: '#15803d', display: 'block', marginTop: '4px' }}>
                  Enter the 6-digit verification code sent to: <br />
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{twoFactorEmail}</span>
                </small>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Verification Code (6 Digits)
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
                {loading ? 'Verifying...' : 'Confirm Code & Log In'}
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
                ← Back to standard login
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
                  Email Address
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
                    Password
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
                    Forgot Password?
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
                    <span>Sign In</span>
                  </>
                )}
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
            Don't have an account yet?{' '}
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
              <span>Create an account</span>
              <ArrowRight size={14} />
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
                <h3>Reset Password</h3>
                <p>
                  {forgotStep === 1
                    ? 'Enter your registered email and we will send you a verification code.'
                    : 'Enter the code sent to your email along with your new password.'}
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
                      Email Address
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
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn primary"
                      style={{ background: '#087cf0' }}
                    >
                      {loading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Verification Code
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
                      New Password
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
                      Confirm Password
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
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn primary"
                      style={{ background: '#087cf0' }}
                    >
                      {loading ? 'Saving...' : 'Save New Password'}
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
