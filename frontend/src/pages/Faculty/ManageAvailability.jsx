import { useEffect, useState } from 'react'
import { get, put } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageAvailability() {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}')
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  useEffect(() => {
    if (auth.linked_faculty_id) {
      loadAvailability()
    }
  }, [auth.linked_faculty_id])

  const loadAvailability = async () => {
    try {
      const data = await get(`/faculty/availability/${auth.linked_faculty_id}`)
      setAvailability(data)
    } catch (e) {
      console.error('Failed to load availability:', e)
      setMessage('Failed to load availability data')
    }
  }

  const getDayAvailability = (day) => {
    return availability.find(a => a.day_of_week === day) || { 
      day_of_week: day, 
      start_time: '09:00:00', 
      end_time: '17:00:00', 
      is_recurring: true, 
      note: '' 
    }
  }

  const updateDayAvailability = (day, field, value) => {
    setAvailability(prev => {
      const existing = prev.find(a => a.day_of_week === day)
      if (existing) {
        return prev.map(a => a.day_of_week === day ? { ...a, [field]: value } : a)
      } else {
        return [...prev, { 
          day_of_week: day, 
          start_time: '09:00:00', 
          end_time: '17:00:00', 
          is_recurring: true, 
          note: '', 
          [field]: value 
        }]
      }
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await put(`/faculty/availability/${auth.linked_faculty_id}`, availability)
      setMessage('Availability saved successfully!')
    } catch (err) {
      setMessage('Failed to save availability: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!auth.linked_faculty_id) {
    return (
      <div className="card">
        <h3>Manage Availability</h3>
        <p style={{ color: 'crimson' }}>No faculty ID linked to your account. Contact admin.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Set My Availability</h3>
      {message && <div style={{ color: message.includes('Failed') ? 'crimson' : 'green' }}>{message}</div>}
      
      <form className="form" onSubmit={onSubmit}>
        {days.map(day => {
          const dayData = getDayAvailability(day)
          return (
            <div key={day} className="card" style={{ marginBottom: 12 }}>
              <h4 style={{ marginTop: 0 }}>{day}</h4>
              <div className="form-row inline">
                <FormInput 
                  label="Start Time" 
                  name={`${day}_start`} 
                  type="time" 
                  value={dayData.start_time} 
                  onChange={(e) => updateDayAvailability(day, 'start_time', e.target.value)} 
                />
                <FormInput 
                  label="End Time" 
                  name={`${day}_end`} 
                  type="time" 
                  value={dayData.end_time} 
                  onChange={(e) => updateDayAvailability(day, 'end_time', e.target.value)} 
                />
              </div>
              <div className="form-row">
                <label>
                  <input 
                    type="checkbox" 
                    checked={dayData.is_recurring} 
                    onChange={(e) => updateDayAvailability(day, 'is_recurring', e.target.checked)} 
                  /> 
                  Available this day
                </label>
              </div>
              <FormInput 
                label="Note (optional)" 
                name={`${day}_note`} 
                value={dayData.note || ''} 
                onChange={(e) => updateDayAvailability(day, 'note', e.target.value)} 
                placeholder="e.g., Only morning classes"
              />
            </div>
          )
        })}
        
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Availability'}
          </button>
          <button className="btn ghost" type="button" onClick={loadAvailability}>
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
