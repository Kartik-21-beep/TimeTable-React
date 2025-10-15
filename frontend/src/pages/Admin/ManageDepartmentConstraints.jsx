import { useEffect, useState } from 'react'
import { get, post, put, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageDepartmentConstraints() {
  const [items, setItems] = useState([])
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ 
    id: null, 
    department_id: '', 
    working_start: '09:00:00', 
    working_end: '17:30:00', 
    lunch_start: '13:00:00', 
    lunch_end: '14:30:00', 
    max_classes_per_day: 6, 
    slot_duration_minutes: 60, 
    no_weekends: true 
  })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [deps, constraints] = await Promise.all([get('/admin/departments'), get('/admin/departmentconstraints')])
      setDepartments(deps.map(d => ({ value: d.department_id, label: `${d.code} - ${d.name}` })))
      setItems(constraints)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }
  const reset = () => setForm({ 
    id: null, 
    department_id: '', 
    working_start: '09:00:00', 
    working_end: '17:30:00', 
    lunch_start: '13:00:00', 
    lunch_end: '14:30:00', 
    max_classes_per_day: 6, 
    slot_duration_minutes: 60, 
    no_weekends: true 
  })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { 
      department_id: Number(form.department_id), 
      working_start: form.working_start, 
      working_end: form.working_end, 
      lunch_start: form.lunch_start, 
      lunch_end: form.lunch_end, 
      max_classes_per_day: Number(form.max_classes_per_day), 
      slot_duration_minutes: Number(form.slot_duration_minutes), 
      no_weekends: !!form.no_weekends 
    }
    try {
      if (form.id) await put(`/admin/departmentconstraints/${form.id}`, payload)
      else await post('/admin/departmentconstraints', payload)
      reset(); await load()
    } catch (err) { setError(err.message) }
  }

  const onEdit = (row) => setForm({ 
    id: row.id, 
    department_id: row.department_id, 
    working_start: row.working_start, 
    working_end: row.working_end, 
    lunch_start: row.lunch_start, 
    lunch_end: row.lunch_end, 
    max_classes_per_day: row.max_classes_per_day, 
    slot_duration_minutes: row.slot_duration_minutes, 
    no_weekends: !!row.no_weekends 
  })
  const onDelete = async (id) => { if (!confirm('Delete constraints?')) return; try { await del(`/admin/departmentconstraints/${id}`); await load() } catch(e){ setError(e.message) } }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{form.id ? 'Edit Department Constraints' : 'Create Department Constraints'}</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Department" name="department_id" type="select" value={form.department_id} onChange={onChange} options={departments} required />
          <div className="form-row inline">
            <FormInput label="Working Start" name="working_start" type="time" value={form.working_start} onChange={onChange} />
            <FormInput label="Working End" name="working_end" type="time" value={form.working_end} onChange={onChange} />
          </div>
          <div className="form-row inline">
            <FormInput label="Lunch Start" name="lunch_start" type="time" value={form.lunch_start} onChange={onChange} />
            <FormInput label="Lunch End" name="lunch_end" type="time" value={form.lunch_end} onChange={onChange} />
          </div>
          <div className="form-row inline">
            <FormInput label="Max Classes/Day" name="max_classes_per_day" type="number" min={1} max={12} value={form.max_classes_per_day} onChange={onChange} />
            <FormInput label="Slot Duration (min)" name="slot_duration_minutes" type="number" min={30} max={120} value={form.slot_duration_minutes} onChange={onChange} />
          </div>
          <div className="form-row">
            <label><input type="checkbox" name="no_weekends" checked={!!form.no_weekends} onChange={onChange} /> No Weekends</label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{form.id ? 'Update' : 'Create'}</button>
            {form.id && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Department Constraints</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Department</th><th>Working Hours</th><th>Lunch</th><th>Max/Day</th><th>Slot</th><th>Weekends</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.department_id}</td>
                <td>{row.working_start} - {row.working_end}</td>
                <td>{row.lunch_start} - {row.lunch_end}</td>
                <td>{row.max_classes_per_day}</td>
                <td>{row.slot_duration_minutes}min</td>
                <td>{row.no_weekends ? 'No' : 'Yes'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn ghost" onClick={()=>onEdit(row)}>Edit</button>{' '}
                  <button className="btn secondary" onClick={()=>onDelete(row.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
