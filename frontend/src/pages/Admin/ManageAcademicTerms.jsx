import { useEffect, useState } from 'react'
import { get, post, put, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageAcademicTerms() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ 
    term_id: null, 
    academic_year: '', 
    term_type: 'Odd', 
    start_date: '', 
    end_date: '', 
    is_active: true 
  })
  const [error, setError] = useState('')

  const load = async () => {
    try { 
      setItems(await get('/admin/academic-terms'))
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }
  const reset = () => setForm({ 
    term_id: null, 
    academic_year: '', 
    term_type: 'Odd', 
    start_date: '', 
    end_date: '', 
    is_active: true 
  })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { 
      academic_year: form.academic_year, 
      term_type: form.term_type, 
      start_date: form.start_date, 
      end_date: form.end_date, 
      is_active: !!form.is_active 
    }
    try {
      if (form.term_id) await put(`/admin/academic-terms/${form.term_id}`, payload)
      else await post('/admin/academic-terms', payload)
      reset(); await load()
    } catch (err) { setError(err.message) }
  }

  const onEdit = (row) => setForm({ 
    term_id: row.term_id, 
    academic_year: row.academic_year, 
    term_type: row.term_type, 
    start_date: row.start_date, 
    end_date: row.end_date, 
    is_active: row.is_active 
  })
  const onDelete = async (id) => { 
    if (!confirm('Delete academic term?')) return; 
    try { await del(`/admin/academic-terms/${id}`); await load() } 
    catch(e){ setError(e.message) } 
  }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{form.term_id ? 'Edit Academic Term' : 'Create Academic Term'}</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Academic Year" name="academic_year" value={form.academic_year} onChange={onChange} placeholder="2025-26" required />
          <FormInput label="Term Type" name="term_type" type="select" value={form.term_type} onChange={onChange} options={[
            { value: 'Odd', label: 'Odd Semester' },
            { value: 'Even', label: 'Even Semester' }
          ]} />
          <div className="form-row inline">
            <FormInput label="Start Date" name="start_date" type="date" value={form.start_date} onChange={onChange} required />
            <FormInput label="End Date" name="end_date" type="date" value={form.end_date} onChange={onChange} required />
          </div>
          <div className="form-row">
            <label><input type="checkbox" name="is_active" checked={!!form.is_active} onChange={onChange} /> Active Term</label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">{form.term_id ? 'Update' : 'Create'}</button>
            {form.term_id && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Academic Terms</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Academic Year</th><th>Term Type</th><th>Start Date</th><th>End Date</th><th>Active</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.term_id} style={{ backgroundColor: row.is_active ? '#f0f9ff' : 'transparent' }}>
                <td>{row.term_id}</td>
                <td>{row.academic_year}</td>
                <td>{row.term_type}</td>
                <td>{row.start_date}</td>
                <td>{row.end_date}</td>
                <td>{row.is_active ? '✓' : '✗'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn ghost" onClick={()=>onEdit(row)}>Edit</button>{' '}
                  <button className="btn secondary" onClick={()=>onDelete(row.term_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
