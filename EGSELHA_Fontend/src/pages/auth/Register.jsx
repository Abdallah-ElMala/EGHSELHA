// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import EghselhaLogo from '../../component/EghselhaLogo';
import FieldError from '../../component/FieldError';
import {
  extractApiErrors,
  EMAIL_REGEX,
  EGYPTIAN_PHONE_REGEX
} from '../../utils/validation';
import {
  User,
  Wrench,
  Mail,
  Phone,
  KeyRound,
  IdCard,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const lightInputStyle = (hasError) => ({
  width: '100%',
  padding: '11px 14px',
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

export default function Register() {
  const { registerCustomer, registerTechnician } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('customer');
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

  const handleFocus = (e, hasError) => {
    if (!hasError) {
      e.target.style.borderColor = 'var(--bronze)';
      e.target.style.boxShadow = '0 0 0 3px rgba(166, 124, 55, 0.12)';
    }
  };

  const handleBlur = (e, hasError) => {
    if (!hasError) {
      e.target.style.borderColor = 'var(--hairline-light-strong)';
      e.target.style.boxShadow = 'none';
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName || !form.fullName.trim() || form.fullName.trim().length < 3) {
      errs.fullName = 'Full name must be at least 3 characters.';
    }

    if (!form.email || !form.email.trim() || !EMAIL_REGEX.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!form.phone || !form.phone.trim() || !EGYPTIAN_PHONE_REGEX.test(form.phone.trim())) {
      errs.phone = 'Invalid Egyptian phone number (e.g. 01012345678).';
    }

    if (!form.password || form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (activeTab === 'technician') {
      if (!form.nationalId || !/^[0-9]{14}$/.test(form.nationalId.trim())) {
        errs.nationalId = 'Technician national ID must be 14 digits.';
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
      setGlobalError(err.message || 'An error occurred while creating the account. Please review your details.');
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
            backgroundImage: 'url("/car-wash-spray.jpg")',
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
              'linear-gradient(180deg, rgba(10,10,12,0.72) 0%, rgba(10,10,12,0.38) 44%, rgba(10,10,12,0.92) 100%)',
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
            Join EGHSELHA
          </p>
          <h1
            className="lx-enter lx-d2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 4.2vw, 56px)',
              fontWeight: 400,
              lineHeight: 1.03,
              letterSpacing: '-0.02em',
              color: 'var(--ivory)',
              margin: '0 0 18px 0'
            }}
          >
            Doorstep car care,
            <br />
            <span style={{ fontStyle: 'italic', color: 'rgba(245, 243, 238, 0.8)' }}>
              built around your day.
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
            Create a customer account to book on-demand detailing with live GPS tracking, or register as a certified mobile technician.
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

      {/* RIGHT HALF: Warm Alabaster Editorial Registration Canvas */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '44px 32px',
          background: 'var(--alabaster)'
        }}
      >
        <div className="lx-enter lx-d1" style={{ width: '100%', maxWidth: '430px' }}>
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
              marginBottom: '24px'
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
            Create account
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-secondary)', margin: '0 0 24px 0' }}>
            Choose your role and enter your details to get started.
          </p>

          {/* Architectural Sliding Segmented Role Switcher */}
          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--alabaster-raised)',
              border: '1px solid var(--hairline-light)',
              borderRadius: '999px',
              padding: '4px',
              marginBottom: '22px'
            }}
          >
            {/* Smooth Sliding Active Pill Indicator */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '4px',
                bottom: '4px',
                left: '4px',
                width: 'calc(50% - 4px)',
                borderRadius: '999px',
                background: '#ffffff',
                border: '1px solid rgba(24, 24, 27, 0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 2px 10px rgba(24, 24, 27, 0.08)',
                transform: activeTab === 'technician' ? 'translateX(100%)' : 'translateX(0%)',
                transition: 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1)',
                pointerEvents: 'none',
                zIndex: 0
              }}
            />

            <button
              type="button"
              onClick={() => {
                setActiveTab('customer');
                setErrors({});
              }}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '999px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'color 240ms var(--ease-luxury)',
                color: activeTab === 'customer' ? 'var(--ink-primary)' : 'var(--ink-secondary)'
              }}
            >
              <User
                size={15}
                strokeWidth={1.7}
                color={activeTab === 'customer' ? 'var(--bronze)' : 'currentColor'}
                style={{ transition: 'color 240ms var(--ease-luxury)' }}
              />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('technician');
                setErrors({});
              }}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '999px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'color 240ms var(--ease-luxury)',
                color: activeTab === 'technician' ? 'var(--ink-primary)' : 'var(--ink-secondary)'
              }}
            >
              <Wrench
                size={15}
                strokeWidth={1.7}
                color={activeTab === 'technician' ? 'var(--bronze)' : 'currentColor'}
                style={{ transition: 'color 240ms var(--ease-luxury)' }}
              />
              <span>Technician</span>
            </button>
          </div>

          {globalError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--semantic-negative-bg)',
                border: '1px solid rgba(185, 28, 28, 0.24)',
                color: 'var(--semantic-negative)'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={fieldLabelStyle}>
                <User size={14} strokeWidth={1.6} color="var(--ink-muted)" />
                Full name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onFocus={(e) => handleFocus(e, errors.fullName)}
                onBlur={(e) => handleBlur(e, errors.fullName)}
                placeholder="Ahmed Ali"
                style={lightInputStyle(errors.fullName)}
              />
              <FieldError error={errors.fullName} />
            </div>

            <div>
              <label style={fieldLabelStyle}>
                <Mail size={14} strokeWidth={1.6} color="var(--ink-muted)" />
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onFocus={(e) => handleFocus(e, errors.email)}
                onBlur={(e) => handleBlur(e, errors.email)}
                placeholder="name@example.com"
                dir="ltr"
                style={lightInputStyle(errors.email)}
              />
              <FieldError error={errors.email} />
            </div>

            <div>
              <label style={fieldLabelStyle}>
                <Phone size={14} strokeWidth={1.6} color="var(--ink-muted)" />
                Phone number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onFocus={(e) => handleFocus(e, errors.phone)}
                onBlur={(e) => handleBlur(e, errors.phone)}
                placeholder="01012345678"
                dir="ltr"
                style={lightInputStyle(errors.phone)}
              />
              <FieldError error={errors.phone} />
            </div>

            {activeTab === 'technician' && (
              <div>
                <label style={fieldLabelStyle}>
                  <IdCard size={14} strokeWidth={1.6} color="var(--ink-muted)" />
                  National ID (14 digits)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={form.nationalId}
                  onChange={(e) => handleInputChange('nationalId', e.target.value)}
                  onFocus={(e) => handleFocus(e, errors.nationalId)}
                  onBlur={(e) => handleBlur(e, errors.nationalId)}
                  placeholder="29801011234567"
                  dir="ltr"
                  style={lightInputStyle(errors.nationalId)}
                />
                <FieldError error={errors.nationalId} />
              </div>
            )}

            <div>
              <label style={fieldLabelStyle}>
                <KeyRound size={14} strokeWidth={1.6} color="var(--ink-muted)" />
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onFocus={(e) => handleFocus(e, errors.password)}
                onBlur={(e) => handleBlur(e, errors.password)}
                placeholder="••••••••"
                dir="ltr"
                style={lightInputStyle(errors.password)}
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
                marginTop: '8px',
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
                  <span>{activeTab === 'customer' ? 'Create customer account' : 'Create technician account'}</span>
                  <ArrowRight size={15} strokeWidth={1.9} className="lx-arrow" />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid var(--hairline-light)',
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--ink-secondary)'
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="lx-nav-link"
              style={{
                color: 'var(--ink-primary)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Sign in</span>
              <ArrowRight size={14} strokeWidth={1.7} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
