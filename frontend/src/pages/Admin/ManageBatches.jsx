import { useEffect, useState } from 'react'
import { get, post, put, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageBatches() {
  const [items, setItems] = useState([])
  const [programs, setPrograms] = useState([])
  const [form, setForm] = useState({ batch_id: null, program_id: '', name: '', intake_year: '' })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [progs, batches] = await Promise.all([get('/admin/programs'), get('/admin/batches')])
      setPrograms(progs.map(p => ({ value: p.program_id, label: `${p.code} - ${p.name}` })))
      setItems(batches)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const reset = () => setForm({ batch_id: null, program_id: '', name: '', intake_year: '' })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { program_id: Number(form.program_id), name: form.name, intake_year: form.intake_year }
    try {
      if (form.batch_id) await put(`/admin/batches/${form.batch_id}`, payload)
      else await post('/admin/batches', payload)
      reset(); await load()
    } catch (err) { setError(err.message) }
  }

  const onEdit = (row) => setForm({ batch_id: row.batch_id, program_id: row.program_id, name: row.name, intake_year: row.intake_year })
  const onDelete = async (id) => { if (!confirm('Delete batch?')) return; try { await del(`/admin/batches/${id}`); await load() } catch(e){ setError(e.message) } }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{form.batch_id ? 'Edit Batch' : 'Create Batch'}</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Program" name="program_id" type="select" value={form.program_id} onChange={onChange} options={programs} required />
          <FormInput label="Name" name="name" value={form.name} onChange={onChange} required placeholder="MCA-2025-A" />
          <FormInput label="Intake Year" name="intake_year" type="number" min={2000} max={2100} value={form.intake_year} onChange={onChange} required />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{form.batch_id ? 'Update' : 'Create'}</button>
            {form.batch_id && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Batches</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Program</th><th>Name</th><th>Intake</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.batch_id}>
                <td>{row.batch_id}</td>
                <td>{row.program_id}</td>
                <td>{row.name}</td>
                <td>{row.intake_year}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn ghost" onClick={()=>onEdit(row)}>Edit</button>{' '}
                  <button className="btn secondary" onClick={()=>onDelete(row.batch_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


