export default function BrandLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="14" fill="#1C1C1F" stroke="#2F2F34" strokeWidth="1.5" />
      <path
        d="M15 39.5c.9-4.2 3.3-8.8 7-10.4 4.3-1.8 11.7-1.8 16 0 3.7 1.6 6.1 6.2 7 10.4l1.2 1.2c1 1 1.4 2.2 1.4 3.5v4.2a2 2 0 0 1-2 2h-2.4a2 2 0 0 1-2-2v-1.2H22.8v1.2a2 2 0 0 1-2 2h-2.4a2 2 0 0 1-2-2v-4.2c0-1.3.4-2.5 1.4-3.5l1.2-1.2Z"
        fill="#F4F4F5"
      />
      <path
        d="M23.6 35.2 26.2 29c.4-1 1.4-1.6 2.5-1.6h6.6c1.1 0 2.1.6 2.5 1.6l2.6 6.2H23.6Z"
        fill="#1C1C1F"
      />
      <circle cx="23" cy="41.4" r="2.1" fill="#D49B4B" />
      <circle cx="41" cy="41.4" r="2.1" fill="#D49B4B" />
      <path
        d="M18 19.5c8.5-4.5 19.5-4.5 28 0"
        stroke="#D49B4B"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}
