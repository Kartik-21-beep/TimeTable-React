import { useEffect, useState } from 'react'
import { get, post, put, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageClassrooms() {
  const [items, setItems] = useState([])
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ room_id: null, name: '', code: '', type: 'Classroom', capacity: 0, department_id: '' })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [deps, rooms] = await Promise.all([get('/admin/departments'), get('/admin/classrooms')])
      setDepartments(deps.map(d => ({ value: d.department_id, label: `${d.code} - ${d.name}` })))
      setItems(rooms)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const reset = () => setForm({ room_id: null, name: '', code: '', type: 'Classroom', capacity: 0, department_id: '' })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { name: form.name, code: form.code || null, type: form.type, capacity: Number(form.capacity), department_id: form.department_id ? Number(form.department_id) : null }
    try {
      if (form.room_id) await put(`/admin/classrooms/${form.room_id}`, payload)
      else await post('/admin/classrooms', payload)
      reset(); await load()
    } catch (err) { setError(err.message) }
  }

  const onEdit = (row) => setForm({ room_id: row.room_id, name: row.name, code: row.code || '', type: row.type, capacity: row.capacity, department_id: row.department_id || '' })
  const onDelete = async (id) => { if (!confirm('Delete classroom?')) return; try { await del(`/admin/classrooms/${id}`); await load() } catch(e){ setError(e.message) } }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{form.room_id ? 'Edit Classroom' : 'Create Classroom'}</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Name" name="name" value={form.name} onChange={onChange} required />
          <FormInput label="Code" name="code" value={form.code} onChange={onChange} placeholder="R-101" />
          <FormInput label="Type" name="type" type="select" value={form.type} onChange={onChange} options={[ 'Classroom','Lab','Studio' ].map(v=>({ value:v, label:v }))} />
          <FormInput label="Capacity" name="capacity" type="number" min={0} max={500} value={form.capacity} onChange={onChange} />
          <FormInput label="Department" name="department_id" type="select" value={form.department_id} onChange={onChange} options={departments} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{form.room_id ? 'Update' : 'Create'}</button>
            {form.room_id && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Classrooms</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Code</th><th>Type</th><th>Cap</th><th>Dept</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.room_id}>
                <td>{row.room_id}</td>
                <td>{row.name}</td>
                <td>{row.code}</td>
                <td>{row.type}</td>
                <td>{row.capacity}</td>
                <td>{row.department_id}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn ghost" onClick={()=>onEdit(row)}>Edit</button>{' '}
                  <button className="btn secondary" onClick={()=>onDelete(row.room_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


