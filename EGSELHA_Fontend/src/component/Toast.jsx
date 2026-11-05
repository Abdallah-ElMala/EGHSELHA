import { CheckCircle2 } from 'lucide-react'
import { useTech } from '../context/TechnicianContext'

export default function Toast() {
  const { notice } = useTech()
  if (!notice) return null
  return (
    <div className="toast"><CheckCircle2 size={18} />{notice}</div>
  )
}
