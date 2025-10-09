import { useEffect, useState } from 'react'
import { get } from '../../api/apiClient'
import FormInput from '../../components/FormInput'
import TimetableTable from '../../components/TimetableTable'

export default function MyTimetable() {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}')
  const [academicYear, setAcademicYear] = useState('')
  const [term, setTerm] = useState('Odd')
  const [slots, setSlots] = useState([])
  const [entries, setEntries] = useState([])

  useEffect(() => { (async () => { try { setSlots(await get('/timeslots')) } catch {} })() }, [])

  const load = async () => {
    try { setEntries(await get(`/faculty/${auth.linked_faculty_id}/timetable?year=${academicYear}&term=${term}`)) } catch {}
  }

  return (
    <div className="grid">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>My Timetable</h3>
        <div className="toolbar">
          <FormInput label="Academic Year" name="academic_year" value={academicYear} onChange={(e)=>setAcademicYear(e.target.value)} placeholder="2025-26" />
          <FormInput label="Term" name="term" type="select" value={term} onChange={(e)=>setTerm(e.target.value)} options={[{ value:'Odd', label:'Odd' },{ value:'Even', label:'Even' }]} />
          <button className="btn" onClick={load}>Load</button>
        </div>
        <TimetableTable days={['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']} timeSlots={slots} entries={entries} />
      </div>
    </div>
  )
}


