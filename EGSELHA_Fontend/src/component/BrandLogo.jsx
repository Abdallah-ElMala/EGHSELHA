export default function BrandLogo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      role="img"
      aria-label="EGHSELHA brand mark"
    >
      {/* Warm Obsidian squircle with subtle brushed-bronze rim */}
      <rect
        x="12"
        y="12"
        width="232"
        height="232"
        rx="58"
        fill="#141416"
        stroke="rgba(198, 146, 73, 0.36)"
        strokeWidth="6"
      />
      {/* Friendly, confident lowercase 'e' in Warm Alabaster */}
      <path
        fill="#F6F5F1"
        fillRule="evenodd"
        d="M124 62 C80 62 52 92 52 132 C52 174 82 202 130 202 C160 202 182 190 194 172 L170 154 C162 166 148 172 130 172 C104 172 88 158 86 138 H196 C198 132 198 126 198 122 C198 84 170 62 124 62 Z M86 114 C90 96 104 86 124 86 C146 86 160 96 164 114 Z"
      />
      {/* Brushed Bronze 4-point gleam star */}
      <path
        fill="#C69249"
        d="M192 40 C194 54 200 60 214 62 C200 64 194 70 192 84 C190 70 184 64 170 62 C184 60 190 54 192 40 Z"
      />
      {/* Warm Brushed Bronze underline swoop */}
      <path
        fill="#C69249"
        d="M98 184 C116 190 142 190 162 180 C166 178 172 184 166 190 C146 202 116 202 94 194 C88 192 92 182 98 184 Z"
      />
    </svg>
  )
}
