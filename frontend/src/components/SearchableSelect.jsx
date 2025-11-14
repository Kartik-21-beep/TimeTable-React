import { useState, useRef, useEffect } from 'react'

export default function SearchableSelect({ 
  id, 
  name, 
  value, 
  onChange, 
  options = [], 
  required, 
  disabled,
  placeholder = "Search and select..."
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(opt => 
        String(opt.label).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(opt.value).toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    }
  }, [searchTerm, options])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Focus search input when dropdown opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      }, 100)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = options.find(opt => String(opt.value) === String(value))
  const displayValue = selectedOption ? selectedOption.label : placeholder

  const handleSelect = (optionValue) => {
    const event = {
      target: {
        name: name,
        value: optionValue
      }
    }
    onChange(event)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div 
      ref={dropdownRef}
      style={{
        position: 'relative',
        width: '100%'
      }}
    >
      {/* Selected Value Display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          padding: '10px 12px',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          background: disabled ? 'var(--bg)' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s',
          minHeight: '42px'
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = 'var(--primary)'
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = 'var(--border)'
          }
        }}
      >
        <span style={{ 
          color: selectedOption ? 'var(--text)' : 'var(--muted)',
          fontSize: '14px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1
        }}>
          {displayValue}
        </span>
        <span style={{ 
          fontSize: '12px', 
          color: 'var(--muted)',
          marginLeft: '8px',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            maxHeight: '300px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Search Input */}
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false)
                  setSearchTerm('')
                }
              }}
            />
          </div>

          {/* Options List */}
          <div 
            className="searchable-select-dropdown"
            style={{
              maxHeight: '240px',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--muted)',
                fontSize: '14px'
              }}>
                No options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value)
                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-50)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text)',
                      fontSize: '14px',
                      transition: 'all 0.15s',
                      borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'var(--bg)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    {opt.label}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Hidden select for form validation */}
      <select
        id={id}
        name={name}
        value={value ?? ''}
        onChange={() => {}}
        required={required}
        disabled={disabled}
        style={{ display: 'none' }}
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

