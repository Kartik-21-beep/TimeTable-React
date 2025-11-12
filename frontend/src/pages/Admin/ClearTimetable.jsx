import { useEffect, useState } from 'react'
import { get, del } from '../../api/apiClient'
import FormInput from '../../components/FormInput'
import TimetableTable from '../../components/TimetableTable'

export default function ClearTimetable() {
  const [departments, setDepartments] = useState([])
  const [programs, setPrograms] = useState([])
  const [batches, setBatches] = useState([])
  const [terms, setTerms] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [form, setForm] = useState({ academic_year: '', department_id: '', program_id: '', batch_id: '', semester_id: '' })
  const [message, setMessage] = useState('')
  const [rows, setRows] = useState([])
  const [entries, setEntries] = useState([])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  useEffect(() => {
    async function load() {
      const [deps, progs, bats, t, slots] = await Promise.all([
        get('/admin/departments'),
        get('/admin/programs'),
        get('/admin/batches'),
        get('/admin/academic-terms'),
        get('/timeslots')
      ])
      setDepartments(deps.map(d => ({ value: d.department_id, label: `${d.code} - ${d.name}` })))
      setPrograms(progs.map(p => ({ value: p.program_id, label: `${p.code} - ${p.name}` })))
      setBatches(bats.map(b => ({ value: b.batch_id, label: b.name })))
      setTerms(t.map(a => ({ value: a.academic_year, label: `${a.academic_year} (${a.term_type})` })))
      
      // Sort time slots
      const orderMap = { 'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5, 'sixth': 6, 'seventh': 7, 'lunch': 4.5 }
      const sorted = (slots || []).sort((a, b) => {
        const labelA = (a.label || '').toLowerCase()
        const labelB = (b.label || '').toLowerCase()
        const orderA = Object.keys(orderMap).find(key => labelA.includes(key))
        const orderB = Object.keys(orderMap).find(key => labelB.includes(key))
        const numA = orderA ? orderMap[orderA] : 0
        const numB = orderB ? orderMap[orderB] : 0
        if (numA !== numB) return numA - numB
        return a.timeslot_id - b.timeslot_id
      })
      setTimeSlots(sorted)
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
      setMessage(`✅ Deleted ${res.deleted || 0} entries and reset primary keys successfully.`)
      setRows([])
      setEntries([])
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
      
      // If associations aren't loaded, fetch subject and faculty names separately
      const subjectIds = [...new Set(filtered.map(r => r.subject_id).filter(Boolean))]
      const facultyIds = [...new Set(filtered.map(r => r.faculty_id).filter(Boolean))]
      const roomIds = [...new Set(filtered.map(r => r.room_id).filter(Boolean))]
      
      // Fetch names if we have IDs but no associations
      let subjectMap = {}
      let facultyMap = {}
      let roomMap = {}
      
      // Check if associations are missing
      const hasAssociations = filtered.length > 0 && filtered[0]?.Subject?.name && filtered[0]?.Faculty?.name
      
      if (subjectIds.length > 0 && !hasAssociations) {
        try {
          const subjects = await get('/admin/subjects')
          subjectMap = Object.fromEntries(subjects.map(s => [s.subject_id, s.name || s.subject_code || `Subject #${s.subject_id}`]))
        } catch (e) { console.error('Failed to fetch subjects:', e) }
      }
      
      if (facultyIds.length > 0 && !hasAssociations) {
        try {
          const faculty = await get('/admin/faculty')
          facultyMap = Object.fromEntries(faculty.map(f => [f.faculty_id, f.name || `Faculty #${f.faculty_id}`]))
        } catch (e) { console.error('Failed to fetch faculty:', e) }
      }
      
      if (roomIds.length > 0 && !hasAssociations) {
        try {
          const rooms = await get('/admin/classrooms')
          roomMap = Object.fromEntries(rooms.map(r => [r.room_id, r.name || `Room #${r.room_id}`]))
        } catch (e) { console.error('Failed to fetch rooms:', e) }
      }
      
      // Transform data for TimetableTable component
      const transformed = filtered.map(r => {
        const subject = r.Subject || r.subject || {}
        const faculty = r.Faculty || r.faculty || {}
        const classroom = r.Classroom || r.classroom || {}
        
        // Extract names with fallbacks
        const subjectName = subject.name 
          || (r.subject_id && subjectMap[r.subject_id])
          || r.subject_name 
          || (r.subject_id ? `Subject #${r.subject_id}` : 'Unknown Subject')
        
        const facultyName = faculty.name
          || (r.faculty_id && facultyMap[r.faculty_id])
          || r.faculty_name
          || (r.faculty_id ? `Faculty #${r.faculty_id}` : 'Unknown Faculty')
        
        const roomName = classroom.name
          || (r.room_id && roomMap[r.room_id])
          || r.room_name
          || (r.room_id ? `Room #${r.room_id}` : 'Unknown Room')
        
        return {
          day_of_week: r.day_of_week,
          timeslot_id: r.timeslot_id,
          subject_name: subjectName,
          faculty_name: facultyName,
          room_name: roomName
        }
      })
      setEntries(transformed)
      
      if (filtered.length === 0) {
        setMessage('No timetable entries found matching the selected criteria.')
      } else {
        setMessage(`✅ Loaded ${filtered.length} entries. Timetable displayed below.`)
      }
    } catch (e) { 
      console.error('Load timetable error:', e)
      setMessage(e.message || 'Load failed') 
    }
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

      {entries.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ marginBottom: 16 }}>Timetable Preview</h4>
          <div style={{ 
            overflowX: 'auto', 
            borderRadius: '8px', 
            border: '1px solid #e5e7eb',
            background: 'white'
          }}>
            <TimetableTable 
              days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']}
              timeSlots={timeSlots}
              entries={entries}
              highlightToday={false}
            />
          </div>
          <div style={{ 
            marginTop: '16px',
            padding: '12px',
            background: '#f9fafb',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            <strong>Total Entries:</strong> {entries.length} | 
            <strong> Unique Subjects:</strong> {new Set(entries.map(e => e.subject_name)).size} | 
            <strong> Unique Faculty:</strong> {new Set(entries.map(e => e.faculty_name)).size}
          </div>
        </div>
      )}
    </div>
  )
}


