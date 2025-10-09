import { useEffect, useState } from 'react'
import { get, post, put, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageElectiveGroups() {
  const [items, setItems] = useState([])
  const [departments, setDepartments] = useState([])
  const [semesters, setSemesters] = useState([])
  const [form, setForm] = useState({ elective_group_id: null, name: '', department_id: '', semester_id: '', max_choices_per_batch: 1 })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [deps, sems, groups] = await Promise.all([get('/admin/departments'), get('/admin/semesters'), get('/admin/elective-groups')])
      setDepartments(deps.map(d => ({ value: d.department_id, label: `${d.code} - ${d.name}` })))
      setSemesters(sems.map(s => ({ value: s.semester_id, label: `Sem ${s.semester_number} (${s.semester_type})` })))
      setItems(groups)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const reset = () => setForm({ elective_group_id: null, name: '', department_id: '', semester_id: '', max_choices_per_batch: 1 })

  const onSubmit = async (e) => {
    e.preventDefault(); setError('')
    const payload = { name: form.name, department_id: form.department_id ? Number(form.department_id) : null, semester_id: form.semester_id ? Number(form.semester_id) : null, max_choices_per_batch: Number(form.max_choices_per_batch) }
    try {
      if (form.elective_group_id) await put(`/admin/elective-groups/${form.elective_group_id}`, payload)
      else await post('/admin/elective-groups', payload)
      reset(); await load()
    } catch (err) { setError(err.message) }
  }

  const onEdit = (row) => setForm({ elective_group_id: row.elective_group_id, name: row.name, department_id: row.department_id || '', semester_id: row.semester_id || '', max_choices_per_batch: row.max_choices_per_batch })
  const onDelete = async (id) => { if (!confirm('Delete group?')) return; try { await del(`/admin/elective-groups/${id}`); await load() } catch(e){ setError(e.message) } }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{form.elective_group_id ? 'Edit Elective Group' : 'Create Elective Group'}</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Name" name="name" value={form.name} onChange={onChange} required />
          <FormInput label="Department" name="department_id" type="select" value={form.department_id} onChange={onChange} options={departments} />
          <FormInput label="Semester" name="semester_id" type="select" value={form.semester_id} onChange={onChange} options={semesters} />
          <FormInput label="Max Choices per Batch" name="max_choices_per_batch" type="number" min={1} max={10} value={form.max_choices_per_batch} onChange={onChange} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{form.elective_group_id ? 'Update' : 'Create'}</button>
            {form.elective_group_id && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Elective Groups</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Dept</th><th>Semester</th><th>Max Choices</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.elective_group_id}>
                <td>{row.elective_group_id}</td>
                <td>{row.name}</td>
                <td>{row.department_id}</td>
                <td>{row.semester_id}</td>
                <td>{row.max_choices_per_batch}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn ghost" onClick={()=>onEdit(row)}>Edit</button>{' '}
                  <button className="btn secondary" onClick={()=>onDelete(row.elective_group_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


