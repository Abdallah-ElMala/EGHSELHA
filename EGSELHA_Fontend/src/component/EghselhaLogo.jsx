import React from 'react'

export default function EghselhaLogo({ size = 38, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Stylized Car Wash Icon matching mockup */}
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(56,189,248,0.45)]"
        >
          {/* Water Foam Arch & Bubbles */}
          <path
            d="M 12 52 C 12 18, 48 8, 88 42"
            stroke="url(#washGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="1 0"
          />
          <circle cx="20" cy="24" r="3" fill="#38bdf8" opacity="0.9" />
          <circle cx="34" cy="14" r="4" fill="#60a5fa" opacity="0.8" />
          <circle cx="50" cy="11" r="3.5" fill="#bae6fd" opacity="0.95" />
          <circle cx="66" cy="14" r="4.5" fill="#38bdf8" opacity="0.85" />
          <circle cx="80" cy="24" r="3" fill="#60a5fa" opacity="0.8" />

          {/* Car Silhouette */}
          <path
            d="M 16 50 
               C 18 43, 26 42, 34 42 
               L 43 31 
               C 46 27, 56 26, 68 28 
               L 78 40 
               C 85 41, 91 44, 91 50 
               C 91 53, 89 55, 85 55 
               L 19 55 
               C 16 55, 15 52, 16 50 Z"
            fill="url(#carGradient)"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Windshield / Windows */}
          <path
            d="M 45 34 L 56 32 C 63 32, 70 34, 74 40 L 41 40 Z"
            fill="#081b36"
            stroke="#7dd3fc"
            strokeWidth="1.2"
          />

          {/* Wheels */}
          <circle cx="32" cy="54" r="7" fill="#050d1a" stroke="#38bdf8" strokeWidth="2.8" />
          <circle cx="32" cy="54" r="2.8" fill="#ffffff" />
          <circle cx="74" cy="54" r="7" fill="#050d1a" stroke="#38bdf8" strokeWidth="2.8" />
          <circle cx="74" cy="54" r="2.8" fill="#ffffff" />

          {/* Water Splash Ripple under car */}
          <path
            d="M 8 59 C 24 59, 32 63, 50 60 C 68 57, 78 63, 94 60"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          <defs>
            <linearGradient id="washGradient" x1="12" y1="10" x2="88" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="0.5" stopColor="#60a5fa" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="carGradient" x1="20" y1="28" x2="85" y2="55" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284c7" />
              <stop offset="0.6" stopColor="#0369a1" />
              <stop offset="1" stopColor="#0c4a6e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="leading-tight">
          <span className="block font-black text-white text-[17px] tracking-[0.08em] font-['Manrope',sans-serif]">
            EGHSELHA
          </span>
          <span className="block text-[10px] text-sky-400 font-semibold tracking-wider -mt-0.5 uppercase">
            Car Wash At Your Doorstep
          </span>
        </div>
      )}
    </div>
  )
}
