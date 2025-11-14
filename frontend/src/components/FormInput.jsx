import SearchableSelect from './SearchableSelect'

export default function FormInput({ label, type = 'text', value, onChange, name, placeholder, options, required, min, max, step, disabled }) {
  return (
    <div className="form-row">
      {label && <label htmlFor={name}>{label}</label>}
      {type === 'select' ? (
        <SearchableSelect
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          options={options || []}
          required={required}
          disabled={disabled}
          placeholder={placeholder || "Search and select..."}
        />
      ) : (
        <input id={name} name={name} type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder} required={required} min={min} max={max} step={step} disabled={disabled} />
      )}
    </div>
  )
}


