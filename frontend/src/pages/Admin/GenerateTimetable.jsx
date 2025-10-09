import { useEffect, useState } from 'react'
import { get, post } from '../../api/apiClient'
import FormInput from '../../components/FormInput'
import TimetableTable from '../../components/TimetableTable'

export default function GenerateTimetable() {
  const [departments, setDepartments] = useState([])
  const [programs, setPrograms] = useState([])
  const [batches, setBatches] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [form, setForm] = useState({ department_id: '', program_id: '', batch_id: '', academic_year: '', respect_lunch: true, no_weekends: true })
  const [result, setResult] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const [deps, progs, bats, slots] = await Promise.all([
        get('/admin/departments'),
        get('/admin/programs'),
        get('/admin/batches'),
        get('/timeslots')
      ])
      setDepartments(deps.map(d => ({ value: d.department_id, label: `${d.code} - ${d.name}` })))
      setPrograms(progs.map(p => ({ value: p.program_id, label: `${p.code} - ${p.name}` })))
      setBatches(bats.map(b => ({ value: b.batch_id, label: b.name })))
      setTimeSlots(slots)
    }
    load()
  }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const onSubmit = async (e) => {
    e.preventDefault(); setMessage('Generating...')
    const data = await post('/timetable/generate', {
      department_id: Number(form.department_id),
      program_id: Number(form.program_id),
      batch_id: Number(form.batch_id),
      academic_year: form.academic_year,
      respect_lunch: !!form.respect_lunch,
      no_weekends: !!form.no_weekends
    })
    setResult(data.entries || [])
    setMessage(data.status || 'Generated')
  }

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  return (
    <div className="grid">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Generate Timetable</h3>
        {message && <div style={{ color: '#6b7280' }}>{message}</div>}
        <form className="form" onSubmit={onSubmit}>
          <div className="form-row inline">
            <FormInput label="Department" name="department_id" type="select" value={form.department_id} onChange={onChange} options={departments} required />
            <FormInput label="Program" name="program_id" type="select" value={form.program_id} onChange={onChange} options={programs} required />
          </div>
          <div className="form-row inline">
            <FormInput label="Batch" name="batch_id" type="select" value={form.batch_id} onChange={onChange} options={batches} required />
            <FormInput label="Academic Year" name="academic_year" placeholder="2025-26" value={form.academic_year} onChange={onChange} required />
          </div>
          <div className="form-row">
            <label><input type="checkbox" name="respect_lunch" checked={!!form.respect_lunch} onChange={onChange} /> Respect lunch</label>
          </div>
          <div className="form-row">
            <label><input type="checkbox" name="no_weekends" checked={!!form.no_weekends} onChange={onChange} /> No weekends</label>
          </div>
          <button className="btn" type="submit">Generate</button>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Result</h3>
        <TimetableTable days={days} timeSlots={timeSlots} entries={result} />
      </div>
    </div>
  )
}


