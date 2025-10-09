export default function FormInput({ label, type = 'text', value, onChange, name, placeholder, options, required, min, max, step }) {
  return (
    <div className="form-row">
      {label && <label htmlFor={name}>{label}</label>}
      {type === 'select' ? (
        <select id={name} name={name} value={value ?? ''} onChange={onChange} required={required}>
          <option value="">Select</option>
          {(options || []).map((opt) => (
            <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} required={required} min={min} max={max} step={step} />
      )}
    </div>
  )
}


