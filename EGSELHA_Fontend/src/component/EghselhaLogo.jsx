import React from 'react'
import BrandLogo from './BrandLogo'

export default function EghselhaLogo({ size = 36, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <BrandLogo size={size} />
      {showText && (
        <div className="leading-tight">
          <span
            style={{
              display: 'block',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              letterSpacing: '0.06em',
              color: '#F4F4F5'
            }}
          >
            EGHSELHA
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              color: '#A1A1A6',
              fontWeight: 400,
              marginTop: '1px'
            }}
          >
            Mobile auto detailing
          </span>
        </div>
      )}
    </div>
  )
}
