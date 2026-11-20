import { AlertCircle } from 'lucide-react'

export default function FieldError({ error }) {
  if (!error) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        color: '#dc2626',
        fontSize: '11px',
        fontWeight: 600,
        marginTop: '5px',
        lineHeight: 1.3
      }}
    >
      <AlertCircle size={13} style={{ flexShrink: 0 }} />
      <span>{error}</span>
    </div>
  )
}
