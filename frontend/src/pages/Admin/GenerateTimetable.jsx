import { useEffect, useState } from 'react'
import { get, post } from '../../api/apiClient'
import FormInput from '../../components/FormInput'
import TimetableTable from '../../components/TimetableTable'

export default function GenerateTimetable() {
  const [departments, setDepartments] = useState([])
  const [programs, setPrograms] = useState([])
  const [batches, setBatches] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [subjects, setSubjects] = useState([])
  const [faculty, setFaculty] = useState([])
  const [assignments, setAssignments] = useState([])
  const [academicTerms, setAcademicTerms] = useState([])
  const [form, setForm] = useState({ department_id: '', program_id: '', batch_id: '', academic_year: '', respect_lunch: true, no_weekends: true, persist: true })
  const [result, setResult] = useState([])
  const [message, setMessage] = useState('')
  const [reviewOk, setReviewOk] = useState(false)

  useEffect(() => {
    async function load() {
      const [deps, progs, bats, slots, terms] = await Promise.all([
        get('/admin/departments'),
        get('/admin/programs'),
        get('/admin/batches'),
        get('/timeslots'),
        get('/admin/academic-terms')
      ])
      setDepartments(deps.map(d => ({ value: d.department_id, label: `${d.code} - ${d.name}` })))
      setPrograms(progs.map(p => ({ value: p.program_id, label: `${p.code} - ${p.name}` })))
      setBatches(bats.map(b => ({ value: b.batch_id, label: b.name })))
      setAcademicTerms(terms.map(t => ({ value: t.academic_year, label: `${t.academic_year} (${t.term_type})` })))
      // Use slots from backend, sort them with lunch break in correct position
      const allSlots = slots || []
      
      // Define the correct order
      const orderMap = {
        'first': 1, 'second': 2, 'third': 3, 'fourth': 4,
        'fifth': 5, 'sixth': 6, 'seventh': 7, 'lunch': 4.5
      }
      
      // Sort slots by their logical order
      const sorted = allSlots.sort((a, b) => {
        const labelA = (a.label || '').toLowerCase()
        const labelB = (b.label || '').toLowerCase()
        
        // Extract order numbers from labels
        const orderA = Object.keys(orderMap).find(key => labelA.includes(key))
        const orderB = Object.keys(orderMap).find(key => labelB.includes(key))
        
        if (orderA && orderB) {
          return orderMap[orderA] - orderMap[orderB]
        }
        
        // Fallback to time-based sorting
        return a.start_time.localeCompare(b.start_time)
      })
      
      setTimeSlots(sorted)
    }
    load()
  }, [])

  // Load subjects and faculty when selection changes
  useEffect(() => {
    async function loadLists() {
      if (!form.program_id) return
      // Find current semester(s) for this program by year parity
      // For simplicity, fetch all subjects under all semesters of program
      const allSemesters = await get('/admin/semesters')
      const semIds = allSemesters.filter(s => s.program_id === Number(form.program_id)).map(s => s.semester_id)
      const subjLists = await Promise.all(semIds.map(id => get(`/admin/list/subjects?semester_id=${id}`)))
      const flat = subjLists.flat()
      setSubjects(flat)
      setFaculty(await get('/admin/list/active-faculty'))
      // Initialize empty assignments per subject if not present
      setAssignments(prev => {
        const map = new Map(prev.map(a => [a.subject_id, a]))
        for (const s of flat) {
          if (!map.has(s.subject_id)) map.set(s.subject_id, { subject_id: s.subject_id, faculty_id: '', block_hours: s.type === 'Practical' ? 2 : 1 })
        }
        return Array.from(map.values())
      })
    }
    loadLists()
  }, [form.program_id])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const onSubmit = async (e) => {
    e.preventDefault(); setMessage('Generating...')
    setReviewOk(false)
    // Require at least one assignment with a selected faculty
    const selected = assignments.filter(a => a && a.faculty_id)
    if (selected.length === 0) {
      setMessage('Select at least one subject and assign a faculty before generating.')
      setResult([])
      return
    }
    const data = await post('/timetable/generate', {
      department_id: Number(form.department_id),
      program_id: Number(form.program_id),
      batch_id: Number(form.batch_id),
      academic_year: form.academic_year,
      respect_lunch: !!form.respect_lunch,
      no_weekends: !!form.no_weekends,
      assignments: selected,
      persist: !!form.persist
    })
    console.log('Timetable generation response:', data)
    console.log('Entries received:', data.entries)
    console.log('Time slots:', timeSlots)
    console.log('Days:', days)
    
    // Debug: Check timeslot_id matching
    if (data.entries) {
      data.entries.forEach(entry => {
        const matchingSlot = timeSlots.find(slot => slot.timeslot_id === entry.timeslot_id)
        console.log(`Entry: ${entry.subject_name} on ${entry.day_of_week} with timeslot_id ${entry.timeslot_id}`, 
                   matchingSlot ? `matches slot: ${matchingSlot.label}` : 'NO MATCHING SLOT FOUND')
      })
    }
    setResult(data.entries || [])
    setMessage(data.message || data.status || (data.entries?.length ? 'Generated' : 'No entries placed'))
  }

  const onReview = async () => {
    try {
      const review = await post('/timetable/review', {
        academic_year: form.academic_year,
        program_id: Number(form.program_id),
        batch_id: Number(form.batch_id)
      })
      setReviewOk(true)
      setMessage('Review OK: no conflicts detected in existing timetable scope.')
    } catch (e) {
      setReviewOk(false)
      setMessage(e.message || 'Review failed')
    }
  }

  const onSave = async () => {
    // Save last generated result by calling generate with persist=true
    return onSubmit({ preventDefault: () => {} })
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
            <FormInput label="Academic Year" name="academic_year" type="select" value={form.academic_year} onChange={onChange} options={academicTerms} required />
          </div>
          <div className="form-row">
            <label><input type="checkbox" name="respect_lunch" checked={!!form.respect_lunch} onChange={onChange} /> Respect lunch</label>
          </div>
          <div className="form-row">
            <label><input type="checkbox" name="no_weekends" checked={!!form.no_weekends} onChange={onChange} /> No weekends</label>
          </div>
          <div className="form-row">
            <label><input type="checkbox" name="persist" checked={!!form.persist} onChange={onChange} /> Save to TimetableEntries</label>
          </div>
          {subjects.length > 0 && (
            <div style={{ margin: '12px 0' }}>
              <h4>Assignments per Subject</h4>
              <table>
                <thead>
                  <tr><th>Subject</th><th>Type</th><th>Faculty</th><th>Block Hours</th></tr>
                </thead>
                <tbody>
                  {subjects.map(s => {
                    const a = assignments.find(x => x.subject_id === s.subject_id) || { subject_id: s.subject_id, faculty_id: '', block_hours: s.type === 'Practical' ? 2 : 1 }
                    return (
                      <tr key={s.subject_id}>
                        <td>{s.subject_code} — {s.name}</td>
                        <td>{s.type}</td>
                        <td>
                          <select value={a.faculty_id} onChange={(e)=>setAssignments(assignments.map(x=>x.subject_id===s.subject_id?{...a, faculty_id: e.target.value}:x))}>
                            <option value="">Select faculty</option>
                            {faculty.map(f => <option key={f.faculty_id} value={f.faculty_id}>{f.name}</option>)}
                          </select>
                        </td>
                        <td>
                          <input type="number" min={1} max={4} value={a.block_hours}
                            onChange={(e)=>setAssignments(assignments.map(x=>x.subject_id===s.subject_id?{...a, block_hours: Number(e.target.value)}:x))} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <button className="btn" type="submit">Generate</button>
          <div style={{ display: 'inline-flex', gap: 8, marginLeft: 8 }}>
            <button className="btn secondary" type="button" onClick={onReview}>Review</button>
            <button className="btn" type="button" onClick={onSave} disabled={!reviewOk}>Save</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Result</h3>
        <TimetableTable days={days} timeSlots={timeSlots} entries={result} />
      </div>
    </div>
  )
}


