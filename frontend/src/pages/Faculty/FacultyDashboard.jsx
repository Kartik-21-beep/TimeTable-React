import { useEffect, useState } from 'react'
import { get } from '../../api/apiClient'
import TimetableTable from '../../components/TimetableTable'

export default function FacultyDashboard() {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}')
  const [slots, setSlots] = useState([])
  const [today, setToday] = useState([])
  useEffect(() => { (async () => { try { setSlots(await get('/timeslots')); setToday(await get(`/faculty/${auth.linked_faculty_id}/today`)) } catch {} })() }, [])
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return (
    <div className="grid">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Welcome, Faculty</h3>
        <div className="muted">Quick view of today</div>
        <TimetableTable days={days} timeSlots={slots} entries={today} highlightToday />
      </div>
    </div>
  )
}


