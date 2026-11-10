export default function BrandLogo({ size = 40, variant = 'blue' }) {
  const isPurple = variant === 'purple'
  const start = isPurple ? '#3b82f6' : '#0ea5e9'
  const mid = isPurple ? '#2563eb' : '#087cf0'
  const end = isPurple ? '#1d4ed8' : '#0353a4'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`brand-bg-${variant}`} x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={start} />
          <stop offset="55%" stopColor={mid} />
          <stop offset="100%" stopColor={end} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#brand-bg-${variant})`} />
      <circle cx="48" cy="15" r="3.5" fill="#bae6fd" opacity="0.9" />
      <path d="M51 22c1.7 2.1 2.4 3.4 2.4 4.5a2.4 2.4 0 1 1-4.8 0c0-1.1.7-2.4 2.4-4.5Z" fill="#e0f2fe" />
      <path
        d="M18.5 35.5c.8-4 3-8.7 6.3-10.3 3.9-1.8 10.5-1.8 14.4 0 3.3 1.6 5.5 6.3 6.3 10.3l1.1 1.1c1 1 1.4 2.2 1.4 3.6v5.8a2.4 2.4 0 0 1-2.4 2.4h-2.3a2.4 2.4 0 0 1-2.4-2.4V44.8H23.1V46a2.4 2.4 0 0 1-2.4 2.4h-2.3a2.4 2.4 0 0 1-2.4-2.4v-5.8c0-1.4.4-2.6 1.4-3.6l1.1-1.1Z"
        fill="#ffffff"
      />
      <path
        d="M23.8 34.4 26.2 28c.4-1 1.4-1.7 2.5-1.7h6.6c1.1 0 2.1.7 2.5 1.7l2.4 6.4H23.8Z"
        fill={mid}
        opacity="0.88"
      />
      <circle cx="23.2" cy="39.8" r="2.2" fill={mid} />
      <circle cx="40.8" cy="39.8" r="2.2" fill={mid} />
      <path d="M16 18l1.2 2.6L19.8 21.8l-2.6 1.2L16 25.6l-1.2-2.6-2.6-1.2 2.6-1.2L16 18Z" fill="#ffffff" opacity="0.95" />
    </svg>
  )
}
