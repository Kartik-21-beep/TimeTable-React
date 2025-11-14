import { useEffect, useState } from 'react'
import { get, post, put, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManagePrograms() {
  const [items, setItems] = useState([])
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ program_id: null, department_id: '', code: '', name: '', duration_years: 2, active: true })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [deps, progs] = await Promise.all([get('/admin/departments'), get('/admin/programs')])
      setDepartments(deps.map(d => ({ value: d.department_id, label: `${d.code} - ${d.name}` })))
      setItems(progs)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }
  const reset = () => setForm({ program_id: null, department_id: '', code: '', name: '', duration_years: 2, active: true })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { department_id: Number(form.department_id), code: form.code, name: form.name, duration_years: Number(form.duration_years), active: !!form.active }
    try {
      if (form.program_id) await put(`/admin/programs/${form.program_id}`, payload)
      else await post('/admin/programs', payload)
      reset(); await load()
    } catch (err) { setError(err.message) }
  }

  const onEdit = (row) => setForm({ program_id: row.program_id, department_id: row.department_id, code: row.code, name: row.name, duration_years: row.duration_years, active: !!row.active })
  const onDelete = async (id) => { if (!confirm('Delete program?')) return; try { await del(`/admin/programs/${id}`); await load() } catch(e){ setError(e.message) } }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{form.program_id ? 'Edit Program' : 'Create Program'}</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Department" name="department_id" type="select" value={form.department_id} onChange={onChange} options={departments} required />
          <FormInput label="Code" name="code" value={form.code} onChange={onChange} required placeholder="MCA" />
          <FormInput label="Name" name="name" value={form.name} onChange={onChange} required placeholder="Master of Computer Applications" />
          <FormInput label="Duration (years)" name="duration_years" type="number" min={1} max={6} value={form.duration_years} onChange={onChange} required />
          <div className="form-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                name="active" 
                checked={!!form.active} 
                onChange={onChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ cursor: 'default', userSelect: 'none' }}>Active</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{form.program_id ? 'Update' : 'Create'}</button>
            {form.program_id && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <h3 style={{ marginTop: 0 }}>Programs</h3>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ minWidth: '700px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ minWidth: '50px' }}>ID</th>
                <th style={{ minWidth: '100px' }}>Department</th>
                <th style={{ minWidth: '80px' }}>Code</th>
                <th style={{ minWidth: '150px' }}>Name</th>
                <th style={{ minWidth: '80px' }}>Duration</th>
                <th style={{ minWidth: '70px' }}>Active</th>
                <th style={{ minWidth: '150px', textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(row => (
                <tr key={row.program_id}>
                  <td>{row.program_id}</td>
                  <td>{row.department_id}</td>
                  <td>{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.duration_years}</td>
                  <td>{row.active ? 'Yes' : 'No'}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className="btn ghost" onClick={()=>onEdit(row)} style={{ marginRight: '8px' }}>Edit</button>
                    <button className="btn secondary" onClick={()=>onDelete(row.program_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


