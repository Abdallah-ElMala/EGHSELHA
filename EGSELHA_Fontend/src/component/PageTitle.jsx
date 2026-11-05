export default function PageTitle({ eyebrow, title, desc, action }) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  )
}
