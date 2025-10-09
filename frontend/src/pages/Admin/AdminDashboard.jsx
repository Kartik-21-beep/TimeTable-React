import { useEffect, useState } from 'react'
import { get } from '../../api/apiClient'
import TimetableTable from '../../components/TimetableTable'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ departments: 0, programs: 0, batches: 0, faculty: 0, subjects: 0 })
  const [todayPreview, setTodayPreview] = useState([])
  const [slots, setSlots] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const [deps, progs, bats, facs, subs, slotsRes, today] = await Promise.all([
          get('/admin/departments'),
          get('/admin/programs'),
          get('/admin/batches'),
          get('/admin/faculty'),
          get('/admin/subjects'),
          get('/timeslots'),
          get('/timetable/today')
        ])
        setCounts({ departments: deps.length, programs: progs.length, batches: bats.length, faculty: facs.length, subjects: subs.length })
        setSlots(slotsRes)
        setTodayPreview(today)
      } catch {}
    }
    load()
  }, [])

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  return (
    <div className="grid two">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Overview</h3>
        <div className="grid three">
          <Stat label="Departments" value={counts.departments} />
          <Stat label="Programs" value={counts.programs} />
          <Stat label="Batches" value={counts.batches} />
          <Stat label="Faculty" value={counts.faculty} />
          <Stat label="Subjects" value={counts.subjects} />
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Today's timetable</h3>
        <TimetableTable days={days} timeSlots={slots} entries={todayPreview} highlightToday />
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  )
}


