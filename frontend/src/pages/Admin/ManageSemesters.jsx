import { useEffect, useState } from 'react'
import { get, post, put, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageSemesters() {
  const [items, setItems] = useState([])
  const [programs, setPrograms] = useState([])
  const [form, setForm] = useState({ semester_id: null, program_id: '', semester_number: 1, is_final: false, generate_timetable: true })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [progs, sems] = await Promise.all([get('/admin/programs'), get('/admin/semesters')])
      setPrograms(progs.map(p => ({ value: p.program_id, label: `${p.code} - Semesters` })))
      setItems(sems)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }
  const reset = () => setForm({ semester_id: null, program_id: '', semester_number: 1, is_final: false, generate_timetable: true })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { program_id: Number(form.program_id), semester_number: Number(form.semester_number), is_final: !!form.is_final, generate_timetable: !!form.generate_timetable }
    try {
      if (form.semester_id) await put(`/admin/semesters/${form.semester_id}`, payload)
      else await post('/admin/semesters', payload)
      reset(); await load()
    } catch (err) { setError(err.message) }
  }

  const onEdit = (row) => setForm({ semester_id: row.semester_id, program_id: row.program_id, semester_number: row.semester_number, is_final: !!row.is_final, generate_timetable: !!row.generate_timetable })
  const onDelete = async (id) => { if (!confirm('Delete semester?')) return; try { await del(`/admin/semesters/${id}`); await load() } catch(e){ setError(e.message) } }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{form.semester_id ? 'Edit Semester' : 'Create Semester'}</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Program" name="program_id" type="select" value={form.program_id} onChange={onChange} options={programs} required />
          <FormInput label="Semester Number" name="semester_number" type="number" min={1} max={12} value={form.semester_number} onChange={onChange} required />
          <div className="form-row">
            <label><input type="checkbox" name="is_final" checked={!!form.is_final} onChange={onChange} /> Is Final</label>
          </div>
          <div className="form-row">
            <label><input type="checkbox" name="generate_timetable" checked={!!form.generate_timetable} onChange={onChange} /> Generate Timetable</label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{form.semester_id ? 'Update' : 'Create'}</button>
            {form.semester_id && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Semesters</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Program</th><th>Number</th><th>Type</th><th>Final</th><th>Generate</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.semester_id}>
                <td>{row.semester_id}</td>
                <td>{row.program_id}</td>
                <td>{row.semester_number}</td>
                <td>{row.semester_type}</td>
                <td>{row.is_final ? 'Yes' : 'No'}</td>
                <td>{row.generate_timetable ? 'Yes' : 'No'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn ghost" onClick={()=>onEdit(row)}>Edit</button>{' '}
                  <button className="btn secondary" onClick={()=>onDelete(row.semester_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


