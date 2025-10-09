import { useEffect, useState } from 'react'
import { get, post, put, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageDepartments() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ department_id: null, code: '', name: '' })
  const [error, setError] = useState('')

  const load = async () => {
    try { setItems(await get('/admin/departments')) } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const reset = () => setForm({ department_id: null, code: '', name: '' })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (form.department_id) await put(`/admin/departments/${form.department_id}`, { code: form.code, name: form.name })
      else await post('/admin/departments', { code: form.code, name: form.name })
      reset();
      await load()
    } catch (err) { setError(err.message) }
  }

  const onEdit = (row) => setForm({ department_id: row.department_id, code: row.code, name: row.name })
  const onDelete = async (id) => { if (!confirm('Delete department?')) return; try { await del(`/admin/departments/${id}`); await load() } catch(e){ setError(e.message) } }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{form.department_id ? 'Edit Department' : 'Create Department'}</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Code" name="code" value={form.code} onChange={onChange} required placeholder="CSE" />
          <FormInput label="Name" name="name" value={form.name} onChange={onChange} required placeholder="Computer Science & Engineering" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{form.department_id ? 'Update' : 'Create'}</button>
            {form.department_id && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Departments</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Code</th><th>Name</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.department_id}>
                <td>{row.department_id}</td>
                <td>{row.code}</td>
                <td>{row.name}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn ghost" onClick={()=>onEdit(row)}>Edit</button>{' '}
                  <button className="btn secondary" onClick={()=>onDelete(row.department_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


