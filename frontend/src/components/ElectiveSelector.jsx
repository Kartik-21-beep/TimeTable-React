export default function ElectiveSelector({ options, selectedIds, onChange, maxChoices }) {
  const toggle = (id) => {
    const isSelected = selectedIds.includes(id)
    let next
    if (isSelected) next = selectedIds.filter(s => s !== id)
    else next = [...selectedIds, id]
    if (maxChoices && next.length > maxChoices) return
    onChange(next)
  }
  return (
    <div className="grid">
      {options.map(opt => (
        <label key={opt.value} className="card" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={selectedIds.includes(opt.value)} onChange={() => toggle(opt.value)} />
          <div>
            <div style={{ fontWeight: 600 }}>{opt.label}</div>
            {opt.meta && <div style={{ color: '#6b7280', fontSize: 12 }}>{opt.meta}</div>}
          </div>
        </label>
      ))}
      {maxChoices ? <div style={{ color: '#6b7280', fontSize: 12 }}>Max choices: {maxChoices}</div> : null}
    </div>
  )
}


