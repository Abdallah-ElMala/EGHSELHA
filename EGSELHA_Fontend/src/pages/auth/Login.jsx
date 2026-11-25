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
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  User,
  Wrench,
  ShieldCheck,
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
      color: '#141415',
      bg: '#f4f4f5'
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
        background: '#0f0f10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'DM Sans', 'Manrope', -apple-system, sans-serif"
      }}
      dir="ltr"
    >
      {/* Outer Card Container — Dark Obsidian Split View */}
      <div
        style={{
          width: '100%',
          maxWidth: '1040px',
          background: '#19191b',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          minHeight: '640px'
        }}
      >
        {/* Left Side: Obsidian Brand Showcase */}
        <div
          style={{
            background: '#141415',
            color: '#f4f4f5',
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
              <BrandLogo size={40} />
              <div>
                <b style={{ display: 'block', fontSize: '17px', fontWeight: 600, letterSpacing: '0.06em', fontFamily: 'Manrope, sans-serif', color: '#f4f4f5' }}>
                  EGHSELHA
                </b>
                <small style={{ display: 'block', fontSize: '11px', color: '#85858b', marginTop: '2px' }}>
                  Mobile auto detailing
                </small>
              </div>
            </Link>

            <h1
              style={{
                font: '500 32px/1.18 Manrope, sans-serif',
                color: '#f4f4f5',
                margin: '0 0 16px 0',
                letterSpacing: '-0.02em'
              }}
            >
              On-demand car care at your doorstep
            </h1>

            <p style={{ fontSize: '14px', lineHeight: 1.65, color: '#a1a1a6', margin: 0, maxWidth: '400px' }}>
              Sign in to manage bookings, track assigned technicians live on the map, and access your saved vehicles and wallet.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              color: '#737378'
            }}
          >
            <span>© 2026 EGHSELHA</span>
            <span>On-demand mobile detailing</span>
          </div>
        </div>

        {/* Right Side: Dark Obsidian Login Form Panel */}
        <div
          style={{
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#19191b'
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#a1a1a6',
                fontSize: '12px',
                fontWeight: 500,
                textDecoration: 'none',
                marginBottom: '16px'
              }}
            >
              <ArrowLeft size={14} strokeWidth={1.6} />
              <span>Back to home</span>
            </Link>
            <h2
              style={{
                font: '500 24px/1.2 Manrope, sans-serif',
                color: '#f4f4f5',
                margin: '0 0 6px 0',
                letterSpacing: '-0.02em'
              }}
            >
              Sign in
            </h2>
            <p style={{ fontSize: '13px', color: '#85858b', margin: 0 }}>
              Enter your email and password to continue
            </p>
          </div>

          {/* Quick Demo Accounts */}
          <div
            style={{
              background: '#141415',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '20px'
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#a1a1a6' }}>
                Demo accounts
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
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      background: '#232325',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'border-color 150ms cubic-bezier(0.22, 1, 0.36, 1), background-color 150ms cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212, 155, 75, 0.5)';
                      e.currentTarget.style.background = '#2a2a2e';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.background = '#232325';
                    }}
                  >
                    <Icon size={15} strokeWidth={1.6} color="#d49b4b" />
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#ededed' }}>
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
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                background: globalMessage.type === 'error' ? 'rgba(229, 72, 77, 0.12)' : 'rgba(212, 155, 75, 0.12)',
                border: `1px solid ${globalMessage.type === 'error' ? 'rgba(229, 72, 77, 0.3)' : 'rgba(212, 155, 75, 0.3)'}`,
                color: globalMessage.type === 'error' ? '#fca5a5' : '#e5b56c'
              }}
            >
              {globalMessage.type === 'error' ? (
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              ) : (
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              )}
              <span>{globalMessage.text}</span>
            </div>
          )}

          {/* 2FA Form or Standard Login Form */}
          {twoFactorActive ? (
            <form onSubmit={handleVerify2FA} style={{ display: 'grid', gap: '16px' }}>
              <div
                style={{
                  background: '#141415',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#232325',
                    color: '#d49b4b',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 10px auto'
                  }}
                >
                  <ShieldCheck size={20} strokeWidth={1.6} />
                </div>
                <b style={{ fontSize: '14px', color: '#f4f4f5', display: 'block', fontWeight: 600 }}>Two-factor verification</b>
                <small style={{ fontSize: '12px', color: '#a1a1a6', display: 'block', marginTop: '4px' }}>
                  Enter the 6-digit code sent to <span style={{ color: '#ededed', fontFamily: 'monospace' }}>{twoFactorEmail}</span>
                </small>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#a1a1a6', marginBottom: '6px' }}>
                  Verification code
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
                    fontSize: '20px',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: errors.twoFactorCode ? '1px solid #e5484d' : '1px solid rgba(255, 255, 255, 0.12)',
                    outline: 'none',
                    background: '#232325',
                    color: '#f4f4f5',
                    boxSizing: 'border-box'
                  }}
                />
                <FieldError error={errors.twoFactorCode} />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  minHeight: '42px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: '#f4f4f5',
                  border: '1px solid #f4f4f5',
                  color: '#141415',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Verifying…' : 'Confirm code & sign in'}
              </button>

              <button
                type="button"
                onClick={() => setTwoFactorActive(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a1a1a6',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Back to sign in
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
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#a1a1a6',
                    marginBottom: '6px'
                  }}
                >
                  <Mail size={14} strokeWidth={1.6} color="#85858b" />
                  Email address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: errors.email ? '1px solid #e5484d' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: '#232325',
                    outline: 'none',
                    color: '#f4f4f5',
                    boxSizing: 'border-box',
                    transition: 'border-color 150ms cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) e.target.style.borderColor = '#d49b4b';
                  }}
                  onBlur={(e) => {
                    if (!errors.email) e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
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
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#a1a1a6'
                    }}
                  >
                    <KeyRound size={14} strokeWidth={1.6} color="#85858b" />
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
                      color: '#d49b4b',
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
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: errors.password ? '1px solid #e5484d' : '1px solid rgba(255, 255, 255, 0.12)',
                    background: '#232325',
                    outline: 'none',
                    color: '#f4f4f5',
                    boxSizing: 'border-box',
                    transition: 'border-color 150ms cubic-bezier(0.22, 1, 0.36, 1)'
                  }}
                  onFocus={(e) => {
                    if (!errors.password) e.target.style.borderColor = '#d49b4b';
                  }}
                  onBlur={(e) => {
                    if (!errors.password) e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  }}
                />
                <FieldError error={errors.password} />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  minHeight: '42px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: '#f4f4f5',
                  border: '1px solid #f4f4f5',
                  color: '#141415',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 150ms cubic-bezier(0.22, 1, 0.36, 1)'
                }}
              >
                {loading ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid #141415', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <>
                    <LogIn size={15} strokeWidth={1.8} />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Register Link */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
              fontSize: '13px',
              color: '#85858b'
            }}
          >
            Don't have an account yet?{' '}
            <Link
              to="/register"
              style={{
                color: '#d49b4b',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Create an account</span>
              <ArrowRight size={14} strokeWidth={1.6} />
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
                    color: forgotMessage.type === 'error' ? '#b91c1c' : '#141415'
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
                      style={{ background: '#141415' }}
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
                      style={{ background: '#141415' }}
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
