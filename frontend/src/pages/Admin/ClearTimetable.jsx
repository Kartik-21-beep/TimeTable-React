import { useEffect, useState } from 'react'
import { get, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'

export default function ClearTimetable() {
  const [departments, setDepartments] = useState([])
  const [programs, setPrograms] = useState([])
  const [batches, setBatches] = useState([])
  const [terms, setTerms] = useState([])
  const [form, setForm] = useState({ academic_year: '', department_id: '', program_id: '', batch_id: '', semester_id: '' })
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState([])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  useEffect(() => {
    async function load() {
      const [deps, progs, bats, t] = await Promise.all([
        get('/admin/departments'),
        get('/admin/programs'),
        get('/admin/batches'),
        get('/admin/academic-terms')
      ])
      setDepartments(deps.map(d => ({ value: d.department_id, label: `${d.code} - ${d.name}` })))
      setPrograms(progs.map(p => ({ value: p.program_id, label: `${p.code} - ${p.name}` })))
      setBatches(bats.map(b => ({ value: b.batch_id, label: b.name })))
      setTerms(t.map(a => ({ value: a.academic_year, label: `${a.academic_year} (${a.term_type})` })))
    }
    load()
  }, [])

  const onClear = async (e) => {
    e.preventDefault()
    setMessage('Clearing...')
    const params = new URLSearchParams()
    if (form.academic_year) params.append('academic_year', form.academic_year)
    if (form.program_id) params.append('program_id', Number(form.program_id))
    if (form.batch_id) params.append('batch_id', Number(form.batch_id))
    if (form.department_id) params.append('department_id', Number(form.department_id))
    if (form.semester_id) params.append('semester_id', Number(form.semester_id))
    try {
      const res = await del(`/timetable/clear?${params.toString()}`)
      setMessage(`Deleted ${res.deleted || 0} entries and reseeded IDs.`)
      setRows([])
    } catch (e) { setMessage(e.message || 'Clear failed') }
  }

  const onLoadTimetable = async () => {
    setMessage('Loading timetable...')
    try {
      if (!form.batch_id) { setMessage('Select Batch'); return }
      const all = await get(`/timetable/view/${Number(form.batch_id)}`)
      const filtered = (all || []).filter(r => (
        (!form.academic_year || r.academic_year === form.academic_year) &&
        (!form.program_id || r.program_id === Number(form.program_id)) &&
        (!form.department_id || r.department_id === Number(form.department_id))
      ))
      setRows(filtered)
      setMessage(`Loaded ${filtered.length} entries`)
    } catch (e) { setMessage(e.message || 'Load failed') }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Clear Timetable</h3>
      {message && <div style={{ color: '#6b7280' }}>{message}</div>}
      <form className="form" onSubmit={onClear}>
        <div className="form-row inline">
          <FormInput label="Department" name="department_id" type="select" value={form.department_id} onChange={onChange} options={departments} />
          <FormInput label="Program" name="program_id" type="select" value={form.program_id} onChange={onChange} options={programs} required />
        </div>
        <div className="form-row inline">
          <FormInput label="Batch" name="batch_id" type="select" value={form.batch_id} onChange={onChange} options={batches} required />
          <FormInput label="Academic Year" name="academic_year" type="select" value={form.academic_year} onChange={onChange} options={terms} required />
        </div>
        <FormInput label="Semester ID (optional)" name="semester_id" value={form.semester_id} onChange={onChange} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" type="button" onClick={onLoadTimetable}>Load Timetable</button>
          <button className="btn secondary" type="submit">Delete Timetable</button>
        </div>
      </form>

      {rows.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Timetable Preview</h4>
          <table>
            <thead>
              <tr>
                <th>Day</th><th>Slot</th><th>Start</th><th>End</th><th>Subject</th><th>Faculty</th><th>Room</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.day_of_week}</td>
                  <td>{r.timeslot_id}</td>
                  <td>{r.start_time}</td>
                  <td>{r.end_time}</td>
                  <td>{r.subject_id}</td>
                  <td>{r.faculty_id}</td>
                  <td>{r.room_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


