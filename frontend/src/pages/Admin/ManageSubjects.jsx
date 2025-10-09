import { useEffect, useState } from 'react'
import { get, post, put, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageSubjects() {
  const [items, setItems] = useState([])
  const [semesters, setSemesters] = useState([])
  const [form, setForm] = useState({ subject_id: null, semester_id: '', subject_code: '', name: '', type: 'Lecture', weekly_hours: 0, is_elective: false })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [sems, subs] = await Promise.all([get('/admin/semesters'), get('/admin/subjects')])
      setSemesters(sems.map(s => ({ value: s.semester_id, label: `Sem ${s.semester_number} (${s.semester_type})` })))
      setItems(subs)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }
  const reset = () => setForm({ subject_id: null, semester_id: '', subject_code: '', name: '', type: 'Lecture', weekly_hours: 0, is_elective: false })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { semester_id: Number(form.semester_id), subject_code: form.subject_code, name: form.name, type: form.type, weekly_hours: Number(form.weekly_hours), is_elective: !!form.is_elective }
    try {
      if (form.subject_id) await put(`/admin/subjects/${form.subject_id}`, payload)
      else await post('/admin/subjects', payload)
      reset(); await load()
    } catch (err) { setError(err.message) }
  }

  const onEdit = (row) => setForm({ subject_id: row.subject_id, semester_id: row.semester_id, subject_code: row.subject_code, name: row.name, type: row.type, weekly_hours: row.weekly_hours, is_elective: !!row.is_elective })
  const onDelete = async (id) => { if (!confirm('Delete subject?')) return; try { await del(`/admin/subjects/${id}`); await load() } catch(e){ setError(e.message) } }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{form.subject_id ? 'Edit Subject' : 'Create Subject'}</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Semester" name="semester_id" type="select" value={form.semester_id} onChange={onChange} options={semesters} required />
          <FormInput label="Subject Code" name="subject_code" value={form.subject_code} onChange={onChange} required placeholder="MCA501" />
          <FormInput label="Name" name="name" value={form.name} onChange={onChange} required placeholder="Advanced Algorithms" />
          <FormInput label="Type" name="type" type="select" value={form.type} onChange={onChange} options={[ 'Lecture','Tutorial','Practical','Studio' ].map(v=>({ value:v, label:v }))} />
          <FormInput label="Weekly Hours" name="weekly_hours" type="number" min={0} max={30} value={form.weekly_hours} onChange={onChange} />
          <div className="form-row">
            <label><input type="checkbox" name="is_elective" checked={!!form.is_elective} onChange={onChange} /> Is Elective</label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{form.subject_id ? 'Update' : 'Create'}</button>
            {form.subject_id && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Subjects</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Semester</th><th>Code</th><th>Name</th><th>Type</th><th>Hrs</th><th>Elective</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.subject_id}>
                <td>{row.subject_id}</td>
                <td>{row.semester_id}</td>
                <td>{row.subject_code}</td>
                <td>{row.name}</td>
                <td>{row.type}</td>
                <td>{row.weekly_hours}</td>
                <td>{row.is_elective ? 'Yes' : 'No'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn ghost" onClick={()=>onEdit(row)}>Edit</button>{' '}
                  <button className="btn secondary" onClick={()=>onDelete(row.subject_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


