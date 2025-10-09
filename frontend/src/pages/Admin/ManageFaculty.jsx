import { useEffect, useState } from 'react'
import { get, post, put, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageFaculty() {
  const [items, setItems] = useState([])
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ faculty_id: null, name: '', email: '', primary_department_id: '', max_load_per_week: 12, is_active: true })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [deps, facs] = await Promise.all([get('/admin/departments'), get('/admin/faculty')])
      setDepartments(deps.map(d => ({ value: d.department_id, label: `${d.code} - ${d.name}` })))
      setItems(facs)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }
  const reset = () => setForm({ faculty_id: null, name: '', email: '', primary_department_id: '', max_load_per_week: 12, is_active: true })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { name: form.name, email: form.email || null, primary_department_id: form.primary_department_id ? Number(form.primary_department_id) : null, max_load_per_week: Number(form.max_load_per_week), is_active: !!form.is_active }
    try {
      if (form.faculty_id) await put(`/admin/faculty/${form.faculty_id}`, payload)
      else await post('/admin/faculty', payload)
      reset(); await load()
    } catch (err) { setError(err.message) }
  }

  const onEdit = (row) => setForm({ faculty_id: row.faculty_id, name: row.name, email: row.email || '', primary_department_id: row.primary_department_id || '', max_load_per_week: row.max_load_per_week, is_active: !!row.is_active })
  const onDelete = async (id) => { if (!confirm('Delete faculty?')) return; try { await del(`/admin/faculty/${id}`); await load() } catch(e){ setError(e.message) } }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{form.faculty_id ? 'Edit Faculty' : 'Create Faculty'}</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Name" name="name" value={form.name} onChange={onChange} required />
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={onChange} />
          <FormInput label="Primary Department" name="primary_department_id" type="select" value={form.primary_department_id} onChange={onChange} options={departments} />
          <FormInput label="Max Load / week" name="max_load_per_week" type="number" min={0} max={40} value={form.max_load_per_week} onChange={onChange} />
          <div className="form-row">
            <label><input type="checkbox" name="is_active" checked={!!form.is_active} onChange={onChange} /> Active</label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{form.faculty_id ? 'Update' : 'Create'}</button>
            {form.faculty_id && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Faculty</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Dept</th><th>Max Load</th><th>Active</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.faculty_id}>
                <td>{row.faculty_id}</td>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.primary_department_id}</td>
                <td>{row.max_load_per_week}</td>
                <td>{row.is_active ? 'Yes' : 'No'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn ghost" onClick={()=>onEdit(row)}>Edit</button>{' '}
                  <button className="btn secondary" onClick={()=>onDelete(row.faculty_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


