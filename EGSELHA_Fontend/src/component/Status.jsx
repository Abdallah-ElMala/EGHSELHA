export default function Status({ value }) {
  const cls = value.toLowerCase().replaceAll(' ', '-')
  return <span className={`status ${cls}`}>{value}</span>
}
