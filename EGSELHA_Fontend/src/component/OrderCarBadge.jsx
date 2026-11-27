export default function OrderCarBadge({ size = 42 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      role="img"
      aria-label="EGHSELHA Order Car Emblem"
    >
      {/* Matching Obsidian squircle tile with warm bronze hairline */}
      <rect
        x="12"
        y="12"
        width="232"
        height="232"
        rx="56"
        fill="#141416"
        stroke="rgba(198, 146, 73, 0.34)"
        strokeWidth="6"
      />
      {/* Warm bronze wash-gleam arc over the roof */}
      <path
        d="M66 84 C102 64 154 64 190 84"
        stroke="#C69249"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Subtle 4-point bronze sparkle */}
      <path
        fill="#C69249"
        d="M196 42 C198 52 202 56 212 58 C202 60 198 64 196 74 C194 64 190 60 180 58 C190 56 194 52 196 42 Z"
      />
      {/* Sleek, friendly front-view car silhouette in Warm Alabaster */}
      <path
        fill="#F6F5F1"
        d="M54 148 C58 128 68 110 82 102 C100 94 156 94 174 102 C188 110 198 128 202 148 L208 154 C212 158 214 164 214 170 V188 C214 194 209 199 203 199 H192 C186 199 181 194 181 188 V182 H75 V188 C75 194 70 199 64 199 H53 C47 199 42 194 42 188 V170 C42 164 44 158 48 154 Z"
      />
      {/* Dark obsidian windshield cutout */}
      <path
        fill="#141416"
        d="M84 138 L94 114 C96 109 101 106 107 106 H149 C155 106 160 109 162 114 L172 138 Z"
      />
      {/* Warm bronze headlights */}
      <circle cx="80" cy="162" r="10" fill="#C69249" />
      <circle cx="176" cy="162" r="10" fill="#C69249" />
      {/* Clean grille pill */}
      <rect x="108" y="157" width="40" height="10" rx="5" fill="#141416" />
    </svg>
  )
}
