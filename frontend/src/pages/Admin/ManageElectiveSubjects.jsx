import { useEffect, useState } from 'react'
import { get, post, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ManageElectiveSubjects() {
  const [groups, setGroups] = useState([])
  const [subjects, setSubjects] = useState([])
  const [mappings, setMappings] = useState([])
  const [form, setForm] = useState({ elective_group_id: '', subject_id: '' })
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [g, s, m] = await Promise.all([
        get('/admin/elective-groups'),
        get('/admin/subjects'),
        get('/admin/elective-subjects')
      ])
      setGroups(g.map(x => ({ value: x.elective_group_id, label: `${x.name}` })))
      setSubjects(s.map(x => ({ value: x.subject_id, label: `${x.subject_code} - ${x.name}` })))
      setMappings(m)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      await post('/admin/elective-subjects', { elective_group_id: Number(form.elective_group_id), subject_id: Number(form.subject_id) })
      setForm({ elective_group_id: '', subject_id: '' })
      await load()
    } catch (err) { setError(err.message) }
  }

  const onDelete = async (id) => { if (!confirm('Remove mapping?')) return; try { await del(`/admin/elective-subjects/${id}`); await load() } catch(e){ setError(e.message) } }

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Add Subject to Group</h3>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Elective Group" name="elective_group_id" type="select" value={form.elective_group_id} onChange={onChange} options={groups} required />
          <FormInput label="Subject" name="subject_id" type="select" value={form.subject_id} onChange={onChange} options={subjects} required />
          <button className="btn" type="submit">Add</button>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Elective Subjects</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Group</th><th>Subject</th><th></th></tr>
          </thead>
          <tbody>
            {mappings.map(row => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.elective_group_id}</td>
                <td>{row.subject_id}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn secondary" onClick={()=>onDelete(row.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


