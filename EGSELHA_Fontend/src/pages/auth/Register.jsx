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
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const darkInputStyle = (hasError) => ({
  width: '100%',
  padding: '10px 14px',
  fontSize: '13px',
  borderRadius: '8px',
  border: hasError ? '1px solid #e5484d' : '1px solid rgba(255, 255, 255, 0.12)',
  background: '#232325',
  outline: 'none',
  color: '#f4f4f5',
  boxSizing: 'border-box',
  transition: 'border-color 150ms cubic-bezier(0.22, 1, 0.36, 1)'
});

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 500,
  color: '#a1a1a6',
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
              Doorstep car detailing, scheduled around your day
            </h1>

            <p style={{ fontSize: '14px', lineHeight: 1.65, color: '#a1a1a6', margin: 0, maxWidth: '400px' }}>
              Create a customer account to book on-demand washes with live GPS tracking, or register as a certified mobile technician.
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

        {/* Right Side: Dark Obsidian Registration Form */}
        <div
          style={{
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#19191b'
          }}
        >
          <div style={{ marginBottom: '20px' }}>
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
              Create account
            </h2>
            <p style={{ fontSize: '13px', color: '#85858b', margin: 0 }}>
              Choose your role and enter your details
            </p>
          </div>

          {/* Account Type Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#141415',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '20px',
              gap: '4px'
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
                padding: '9px 12px',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '7px',
                border: activeTab === 'customer' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 150ms cubic-bezier(0.22, 1, 0.36, 1), color 150ms cubic-bezier(0.22, 1, 0.36, 1)',
                background: activeTab === 'customer' ? '#232325' : 'transparent',
                color: activeTab === 'customer' ? '#f4f4f5' : '#85858b'
              }}
            >
              <User size={15} strokeWidth={1.6} color={activeTab === 'customer' ? '#d49b4b' : 'currentColor'} />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('technician');
                setErrors({});
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '7px',
                border: activeTab === 'technician' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 150ms cubic-bezier(0.22, 1, 0.36, 1), color 150ms cubic-bezier(0.22, 1, 0.36, 1)',
                background: activeTab === 'technician' ? '#232325' : 'transparent',
                color: activeTab === 'technician' ? '#f4f4f5' : '#85858b'
              }}
            >
              <Wrench size={15} strokeWidth={1.6} color={activeTab === 'technician' ? '#d49b4b' : 'currentColor'} />
              <span>Technician</span>
            </button>
          </div>

          {globalError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(229, 72, 77, 0.12)',
                border: '1px solid rgba(229, 72, 77, 0.3)',
                color: '#fca5a5'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={labelStyle}>
                <User size={14} strokeWidth={1.6} color="#85858b" />
                Full name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Ahmed Ali"
                style={darkInputStyle(errors.fullName)}
              />
              <FieldError error={errors.fullName} />
            </div>

            <div>
              <label style={labelStyle}>
                <Mail size={14} strokeWidth={1.6} color="#85858b" />
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="name@example.com"
                dir="ltr"
                style={darkInputStyle(errors.email)}
              />
              <FieldError error={errors.email} />
            </div>

            <div>
              <label style={labelStyle}>
                <Phone size={14} strokeWidth={1.6} color="#85858b" />
                Phone number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="01012345678"
                dir="ltr"
                style={darkInputStyle(errors.phone)}
              />
              <FieldError error={errors.phone} />
            </div>

            {activeTab === 'technician' && (
              <div>
                <label style={labelStyle}>
                  <IdCard size={14} strokeWidth={1.6} color="#85858b" />
                  National ID (14 digits)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={form.nationalId}
                  onChange={(e) => handleInputChange('nationalId', e.target.value)}
                  placeholder="29801011234567"
                  dir="ltr"
                  style={darkInputStyle(errors.nationalId)}
                />
                <FieldError error={errors.nationalId} />
              </div>
            )}

            <div>
              <label style={labelStyle}>
                <KeyRound size={14} strokeWidth={1.6} color="#85858b" />
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                style={darkInputStyle(errors.password)}
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
                marginTop: '6px',
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
                  <UserPlus size={15} strokeWidth={1.8} />
                  <span>{activeTab === 'customer' ? 'Create customer account' : 'Create technician account'}</span>
                </>
              )}
            </button>
          </form>

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
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#d49b4b',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Sign in</span>
              <ArrowRight size={14} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
