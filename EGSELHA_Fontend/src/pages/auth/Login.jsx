// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EghselhaLogo from '../../component/EghselhaLogo';
import FieldError from '../../component/FieldError';
import { extractApiErrors, EMAIL_REGEX } from '../../utils/validation';
import {
  KeyRound,
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  User,
  Wrench,
  ShieldCheck,
  X
} from 'lucide-react';

const lightInputStyle = (hasError) => ({
  width: '100%',
  padding: '12px 14px',
  fontSize: '14px',
  borderRadius: '10px',
  border: hasError ? '1px solid var(--semantic-negative)' : '1px solid var(--hairline-light-strong)',
  background: '#ffffff',
  outline: 'none',
  color: 'var(--ink-primary)',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-sans)',
  transition: 'border-color 180ms var(--ease-luxury), box-shadow 180ms var(--ease-luxury)'
});

const fieldLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 500,
  color: 'var(--ink-secondary)',
  marginBottom: '6px'
};

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
      icon: User
    },
    {
      role: 'Technician',
      badge: 'Technician',
      email: 'mostafa.ali@email.com',
      pass: 'demo123',
      icon: Wrench
    },
    {
      role: 'Admin',
      badge: 'Admin',
      email: 'admin@eghselha.com',
      pass: 'admin123',
      icon: ShieldCheck
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
      navigate(from && from.startsWith('/admin') ? from : '/admin', { replace: true });
      return;
    }
    if (r === 'TECHNICIAN') {
      navigate(from && from.startsWith('/technician') ? from : '/technician', { replace: true });
      return;
    }
    if (r === 'CUSTOMER') {
      navigate(from && from.startsWith('/customer') ? from : '/customer', { replace: true });
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
      dir="ltr"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        background: 'var(--alabaster)',
        color: 'var(--ink-primary)'
      }}
    >
      {/* LEFT HALF: Full-Bleed Cinematic Editorial Panel */}
      <div
        style={{
          position: 'relative',
          minHeight: '360px',
          background: '#0a0a0c',
          color: 'var(--ivory)',
          padding: '40px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/wet-luxury-car.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(10,10,12,0.72) 0%, rgba(10,10,12,0.36) 44%, rgba(10,10,12,0.92) 100%)',
            zIndex: 1
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <EghselhaLogo size={34} showText={true} />
          </Link>
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '480px', marginTop: '48px' }}>
          <p
            className="lx-enter lx-d1"
            style={{
              fontSize: '12px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--bronze-dark)',
              margin: '0 0 14px 0',
              fontWeight: 500
            }}
          >
            Mobile Automotive Atelier
          </p>
          <h1
            className="lx-enter lx-d2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 4.4vw, 60px)',
              fontWeight: 400,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              color: 'var(--ivory)',
              margin: '0 0 18px 0'
            }}
          >
            Welcome back.
            <br />
            <span style={{ fontStyle: 'italic', color: 'rgba(245, 243, 238, 0.8)' }}>
              Your driveway awaits.
            </span>
          </h1>
          <p
            className="lx-enter lx-d3"
            style={{
              fontSize: '14px',
              lineHeight: 1.65,
              color: 'rgba(245, 243, 238, 0.72)',
              margin: '0 0 36px 0',
              maxWidth: '400px'
            }}
          >
            Sign in to manage bookings, follow your assigned technician live on the map, and access your saved vehicles and wallet.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '18px',
              borderTop: '1px solid rgba(245, 243, 238, 0.14)',
              fontSize: '12px',
              color: 'rgba(245, 243, 238, 0.56)'
            }}
          >
            <span>© 2026 EGHSELHA</span>
            <span>On-demand mobile detailing</span>
          </div>
        </div>
      </div>

      {/* RIGHT HALF: Warm Alabaster Editorial Form Canvas */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 32px',
          background: 'var(--alabaster)'
        }}
      >
        <div className="lx-enter lx-d1" style={{ width: '100%', maxWidth: '420px' }}>
          <Link
            to="/"
            className="lx-nav-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--ink-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '28px'
            }}
          >
            <ArrowLeft size={14} strokeWidth={1.7} />
            <span>Back to home</span>
          </Link>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '42px',
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--ink-primary)',
              margin: '0 0 8px 0'
            }}
          >
            Sign in
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', margin: '0 0 28px 0' }}>
            Enter your credentials to access your portal.
          </p>

          {/* Quick Demo Accounts */}
          <div
            style={{
              background: 'var(--alabaster-raised)',
              border: '1px solid var(--hairline-light)',
              borderRadius: '14px',
              padding: '12px',
              marginBottom: '24px'
            }}
          >
            <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
                Quick demo access
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isActive = form.email === acc.email;
                return (
                  <button
                    key={acc.badge}
                    type="button"
                    onClick={() => handleDemoFill(acc)}
                    style={{
                      border: isActive ? '1px solid var(--bronze)' : '1px solid var(--hairline-light)',
                      background: isActive ? 'var(--bronze-soft)' : '#ffffff',
                      borderRadius: '10px',
                      padding: '10px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'border-color 180ms var(--ease-luxury), background-color 180ms var(--ease-luxury), transform 180ms var(--ease-luxury)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--bronze)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isActive ? 'var(--bronze)' : 'var(--hairline-light)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Icon size={15} strokeWidth={1.7} color={isActive ? 'var(--bronze)' : 'var(--ink-secondary)'} />
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--ink-primary)' }}>
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
                borderRadius: '10px',
                marginBottom: '18px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                background: globalMessage.type === 'error' ? 'var(--semantic-negative-bg)' : 'var(--bronze-soft)',
                border: `1px solid ${globalMessage.type === 'error' ? 'rgba(185, 28, 28, 0.24)' : 'rgba(166, 124, 55, 0.28)'}`,
                color: globalMessage.type === 'error' ? 'var(--semantic-negative)' : '#7a571e'
              }}
            >
              {globalMessage.type === 'error' ? (
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <span>{globalMessage.text}</span>
            </div>
          )}

          {/* 2FA Form or Standard Login Form */}
          {twoFactorActive ? (
            <form onSubmit={handleVerify2FA} style={{ display: 'grid', gap: '18px' }}>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--hairline-light)',
                  borderRadius: '14px',
                  padding: '20px',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'var(--bronze-soft)',
                    color: 'var(--bronze)',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 10px auto'
                  }}
                >
                  <ShieldCheck size={20} strokeWidth={1.7} />
                </div>
                <b style={{ fontSize: '15px', color: 'var(--ink-primary)', display: 'block', fontWeight: 600 }}>
                  Two-factor verification
                </b>
                <small style={{ fontSize: '13px', color: 'var(--ink-secondary)', display: 'block', marginTop: '4px' }}>
                  Enter the 6-digit code sent to <span className="mono-num" style={{ color: 'var(--ink-primary)' }}>{twoFactorEmail}</span>
                </small>
              </div>

              <div>
                <label style={fieldLabelStyle}>Verification code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  style={{
                    ...lightInputStyle(errors.twoFactorCode),
                    textAlign: 'center',
                    letterSpacing: '8px',
                    fontSize: '20px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600
                  }}
                />
                <FieldError error={errors.twoFactorCode} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="lx-btn lx-glass-btn lx-glass-obsidian"
                style={{
                  width: '100%',
                  minHeight: '48px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <span>{loading ? 'Verifying…' : 'Confirm code & sign in'}</span>
                {!loading && <ArrowRight size={15} strokeWidth={1.9} className="lx-arrow" />}
              </button>

              <button
                type="button"
                onClick={() => setTwoFactorActive(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink-secondary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
              <div>
                <label style={fieldLabelStyle}>
                  <Mail size={14} strokeWidth={1.6} color="var(--ink-muted)" />
                  Email address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  style={lightInputStyle(errors.email)}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = 'var(--bronze)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(166, 124, 55, 0.12)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = 'var(--hairline-light-strong)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                <FieldError error={errors.email} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ ...fieldLabelStyle, marginBottom: 0 }}>
                    <KeyRound size={14} strokeWidth={1.6} color="var(--ink-muted)" />
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
                      color: 'var(--bronze)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  style={lightInputStyle(errors.password)}
                  onFocus={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = 'var(--bronze)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(166, 124, 55, 0.12)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = 'var(--hairline-light-strong)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                <FieldError error={errors.password} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="lx-btn lx-glass-btn lx-glass-obsidian"
                style={{
                  width: '100%',
                  minHeight: '48px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginTop: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loading ? 0.65 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid var(--ivory)',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}
                  />
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={15} strokeWidth={1.9} className="lx-arrow" />
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
              borderTop: '1px solid var(--hairline-light)',
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--ink-secondary)'
            }}
          >
            New to EGHSELHA?{' '}
            <Link
              to="/register"
              className="lx-nav-link"
              style={{
                color: 'var(--ink-primary)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Create an account</span>
              <ArrowRight size={14} strokeWidth={1.7} />
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          onClick={() => setShowForgotModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(14, 14, 16, 0.72)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'var(--alabaster)',
              borderRadius: '16px',
              border: '1px solid var(--hairline-light-strong)',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '24px 24px 16px',
                borderBottom: '1px solid var(--hairline-light)'
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    fontWeight: 400,
                    margin: '0 0 6px 0',
                    color: 'var(--ink-primary)'
                  }}
                >
                  Reset password
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {forgotStep === 1
                    ? 'Enter your registered email and we will send you a verification code.'
                    : 'Enter the code sent to your email along with your new password.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                aria-label="Close"
                style={{ background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} strokeWidth={1.7} />
              </button>
            </div>

            <div style={{ padding: '22px 24px 24px' }}>
              {forgotMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    background: forgotMessage.type === 'error' ? 'var(--semantic-negative-bg)' : 'var(--bronze-soft)',
                    border: `1px solid ${forgotMessage.type === 'error' ? 'rgba(185, 28, 28, 0.24)' : 'rgba(166, 124, 55, 0.28)'}`,
                    color: forgotMessage.type === 'error' ? 'var(--semantic-negative)' : '#7a571e'
                  }}
                >
                  {forgotMessage.text}
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleSendForgotEmail} style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={fieldLabelStyle}>Email address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      dir="ltr"
                      required
                      style={lightInputStyle(false)}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="btn outline"
                      style={{ borderRadius: '999px' }}
                      onClick={() => setShowForgotModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="lx-btn lx-glass-btn lx-glass-obsidian"
                      style={{
                        minHeight: '40px',
                        padding: '0 22px',
                        borderRadius: '999px',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      <span>{loading ? 'Sending…' : 'Send reset code'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'grid', gap: '14px' }}>
                  <div>
                    <label style={fieldLabelStyle}>Verification code</label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="123456"
                      dir="ltr"
                      required
                      style={lightInputStyle(false)}
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      required
                      style={lightInputStyle(false)}
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>Confirm password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      dir="ltr"
                      required
                      style={lightInputStyle(false)}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="button"
                      className="btn outline"
                      style={{ borderRadius: '999px' }}
                      onClick={() => setShowForgotModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="lx-btn lx-glass-btn lx-glass-obsidian"
                      style={{
                        minHeight: '40px',
                        padding: '0 22px',
                        borderRadius: '999px',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      <span>{loading ? 'Saving…' : 'Save new password'}</span>
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
