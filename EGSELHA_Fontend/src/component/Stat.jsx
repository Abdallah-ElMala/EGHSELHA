import { TrendingUp, MoreHorizontal } from 'lucide-react'

export default function Stat({ icon: Icon, label, value, change, tone = 'blue' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={20} /></div>
      <div className="stat-info">
        <span>{label}</span>
        <strong>{value}</strong>
        <small className="positive"><TrendingUp size={13} /> {change}</small>
      </div>
      <MoreHorizontal className="stat-more" size={18} />
    </div>
  )
}
