import { useEffect, useState } from 'react'
import { get, post, put, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageTimeSlots() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ timeslot_id: null, start_time: '', end_time: '', label: '' })
  const [error, setError] = useState('')

  const load = async () => {
    try { setItems(await get('/admin/timeslots')) } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const reset = () => setForm({ timeslot_id: null, start_time: '', end_time: '', label: '' })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { start_time: form.start_time, end_time: form.end_time, label: form.label || `${form.start_time.slice(0,5)}-${form.end_time.slice(0,5)}` }
    try {
      if (form.timeslot_id) await put(`/admin/timeslots/${form.timeslot_id}`, payload)
      else await post('/admin/timeslots', payload)
      reset(); await load()
    } catch (err) { setError(err.message) }
  }

  const onEdit = (row) => setForm({ timeslot_id: row.timeslot_id, start_time: row.start_time, end_time: row.end_time, label: row.label })
  const onDelete = async (id) => { if (!confirm('Delete time slot?')) return; try { await del(`/admin/timeslots/${id}`); await load() } catch(e){ setError(e.message) } }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{form.timeslot_id ? 'Edit Time Slot' : 'Create Time Slot'}</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <div className="form-row inline">
            <FormInput label="Start Time" name="start_time" type="time" value={form.start_time} onChange={onChange} required />
            <FormInput label="End Time" name="end_time" type="time" value={form.end_time} onChange={onChange} required />
          </div>
          <FormInput label="Label" name="label" value={form.label} onChange={onChange} placeholder="09:00-10:00" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{form.timeslot_id ? 'Update' : 'Create'}</button>
            {form.timeslot_id && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Time Slots</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Start Time</th><th>End Time</th><th>Label</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.timeslot_id}>
                <td>{row.timeslot_id}</td>
                <td>{row.start_time}</td>
                <td>{row.end_time}</td>
                <td>{row.label}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn ghost" onClick={()=>onEdit(row)}>Edit</button>{' '}
                  <button className="btn secondary" onClick={()=>onDelete(row.timeslot_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
