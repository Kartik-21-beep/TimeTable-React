import { useEffect, useState } from 'react'
import { get, post } from '../../api/apiClient'
import FormInput from '../../components/FormInput'
import SearchableSelect from '../../components/SearchableSelect'
import TimetableTable from '../../components/TimetableTable'

export default function GenerateTimetable() {
  const [departments, setDepartments] = useState([])
  const [programs, setPrograms] = useState([])
  const [batches, setBatches] = useState([])
  const [semesters, setSemesters] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [subjects, setSubjects] = useState([])
  const [faculty, setFaculty] = useState([])
  const [assignments, setAssignments] = useState([])
  const [academicTerms, setAcademicTerms] = useState([])
  const [form, setForm] = useState({ department_id: '', program_id: '', semester_id: '', batch_id: '', academic_year: '', respect_lunch: true, no_weekends: true, persist: true })
  const [result, setResult] = useState([])
  const [message, setMessage] = useState('')
  const [reviewOk, setReviewOk] = useState(false)
  const [reviewData, setReviewData] = useState(null)
  const [conflicts, setConflicts] = useState([])

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

  // Load semesters when program changes
  useEffect(() => {
    async function loadSemesters() {
      if (!form.program_id) {
        setSemesters([])
        setSubjects([])
        setAssignments([])
        return
      }
      const allSemesters = await get('/admin/semesters')
      const programSemesters = allSemesters
        .filter(s => s.program_id === Number(form.program_id))
        .map(s => ({ value: s.semester_id, label: `Semester ${s.semester_number} (${s.semester_type})` }))
      setSemesters(programSemesters)
      
      // Reset semester selection if current semester doesn't belong to new program
      if (form.semester_id) {
        const currentSemExists = allSemesters.some(s => 
          s.semester_id === Number(form.semester_id) && s.program_id === Number(form.program_id)
        )
        if (!currentSemExists) {
          setForm(prev => ({ ...prev, semester_id: '' }))
        }
      }
    }
    loadSemesters()
  }, [form.program_id])

  // Load subjects when semester is selected
  useEffect(() => {
    async function loadSubjects() {
      if (!form.semester_id) {
        setSubjects([])
        setAssignments([])
        return
      }
      // Fetch subjects for the selected semester only
      const semesterSubjects = await get(`/admin/list/subjects?semester_id=${form.semester_id}`)
      setSubjects(semesterSubjects || [])
      setFaculty(await get('/admin/list/active-faculty'))
      // Initialize empty assignments per subject
      setAssignments((semesterSubjects || []).map(s => ({
        subject_id: s.subject_id,
        faculty_id: '',
        block_hours: s.type === 'Practical' ? 2 : 1
      })))
    }
    loadSubjects()
  }, [form.semester_id])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const onSubmit = async (e) => {
    e.preventDefault(); setMessage('Generating...')
    setReviewOk(false)
    setConflicts([])
    setReviewData(null)
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
    if (!result || result.length === 0) {
      setMessage('Please generate a timetable first before reviewing.')
      setReviewOk(false)
      setConflicts([])
      setReviewData(null)
      return
    }
    
    try {
      // Get faculty map to convert names to IDs
      const facultyMap = Object.fromEntries(faculty.map(f => [f.name, f.faculty_id]))
      
      // Prepare new entries for review
      const newEntries = result.map(entry => ({
        subject_name: entry.subject_name || entry.subject,
        faculty_name: entry.faculty_name || entry.faculty,
        room_name: entry.room_name || entry.room,
        day_of_week: entry.day_of_week,
        timeslot_id: entry.timeslot_id
      }))
      
      const review = await post('/timetable/review', {
        academic_year: form.academic_year,
        program_id: Number(form.program_id),
        batch_id: Number(form.batch_id),
        new_entries: newEntries
      })
      
      setReviewData(review)
      setConflicts(review.conflicts || [])
      
      if (review.ok && review.conflictsCount === 0) {
        setReviewOk(true)
        setMessage('✅ Timetable is correct! No conflicts detected with existing timetables.')
      } else {
        setReviewOk(false)
        setMessage(`⚠️ ${review.conflictsCount || 0} conflict(s) detected. Please review the details below.`)
      }
    } catch (e) {
      setReviewOk(false)
      setConflicts([])
      setReviewData(null)
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
        {message && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: '8px',
            marginBottom: '16px',
            background: reviewOk ? '#d1fae5' : message.includes('⚠️') ? '#fef3c7' : '#fee2e2',
            color: reviewOk ? '#065f46' : message.includes('⚠️') ? '#92400e' : '#991b1b',
            border: `1px solid ${reviewOk ? '#10b981' : message.includes('⚠️') ? '#f59e0b' : '#ef4444'}`
          }}>
            {message}
          </div>
        )}
        {conflicts.length > 0 && (
          <div style={{ 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '16px',
            background: '#fee2e2',
            border: '1px solid #ef4444'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#991b1b', fontSize: '16px' }}>
              ⚠️ Conflicts Detected ({conflicts.length}):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {conflicts.map((conflict, idx) => (
                <div key={idx} style={{ 
                  padding: '12px', 
                  background: 'white', 
                  borderRadius: '6px',
                  border: '1px solid #fca5a5'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#991b1b' }}>
                    {conflict.type === 'faculty_conflict' ? '👤 Faculty Conflict' : '🏢 Room Conflict'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#7f1d1d', marginBottom: '6px' }}>
                    <strong>New Entry:</strong> {conflict.new_entry.subject} by {conflict.new_entry.faculty} 
                    on {conflict.new_entry.day} at slot {conflict.new_entry.timeslot_id}
                  </div>
                  <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                    <strong>Conflicts With:</strong> {conflict.existing_entry.subject} by {conflict.existing_entry.faculty}
                    {conflict.existing_entry.room && ` in ${conflict.existing_entry.room}`}
                    {' '}on {conflict.existing_entry.day} at slot {conflict.existing_entry.timeslot_id}
                    {' '}(Academic Year: {conflict.existing_entry.academic_year}, 
                    Program: {conflict.existing_entry.program_id}, Batch: {conflict.existing_entry.batch_id})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <form className="form" onSubmit={onSubmit}>
          <div className="form-row inline">
            <FormInput label="Department" name="department_id" type="select" value={form.department_id} onChange={onChange} options={departments} required />
            <FormInput label="Program" name="program_id" type="select" value={form.program_id} onChange={onChange} options={programs} required />
          </div>
          <div className="form-row inline">
            <FormInput label="Semester" name="semester_id" type="select" value={form.semester_id} onChange={onChange} options={semesters} required disabled={!form.program_id} />
            <FormInput label="Batch" name="batch_id" type="select" value={form.batch_id} onChange={onChange} options={batches} required />
          </div>
          <div className="form-row inline">
            <FormInput label="Academic Year" name="academic_year" type="select" value={form.academic_year} onChange={onChange} options={academicTerms} required />
          </div>
          <div className="form-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                name="respect_lunch" 
                checked={!!form.respect_lunch} 
                onChange={onChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ cursor: 'default', userSelect: 'none' }}>Respect lunch</span>
            </div>
          </div>
          <div className="form-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                name="no_weekends" 
                checked={!!form.no_weekends} 
                onChange={onChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ cursor: 'default', userSelect: 'none' }}>No weekends</span>
            </div>
          </div>
          <div className="form-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                name="persist" 
                checked={!!form.persist} 
                onChange={onChange}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ cursor: 'default', userSelect: 'none' }}>Save to TimetableEntries</span>
            </div>
          </div>
          {!form.semester_id && form.program_id && (
            <div style={{ 
              margin: '12px 0', 
              padding: '12px', 
              background: '#fef3c7', 
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              color: '#92400e'
            }}>
              ⚠️ Please select a Semester to see subjects for that semester.
            </div>
          )}
          {form.semester_id && subjects.length === 0 && (
            <div style={{ 
              margin: '12px 0', 
              padding: '12px', 
              background: '#fee2e2', 
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#991b1b'
            }}>
              ℹ️ No subjects found for the selected semester. Please add subjects to this semester first.
            </div>
          )}
          {subjects.length > 0 && (
            <div style={{ margin: '12px 0' }}>
              <h4>Assignments per Subject ({subjects.length} subjects)</h4>
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
                          <SearchableSelect
                            value={a.faculty_id || ''}
                            onChange={(e)=>setAssignments(assignments.map(x=>x.subject_id===s.subject_id?{...a, faculty_id: e.target.value}:x))}
                            options={[{ value: '', label: 'Select faculty' }, ...faculty.map(f => ({ value: f.faculty_id, label: f.name }))]}
                            placeholder="Select faculty"
                          />
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


