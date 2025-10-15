import { useEffect, useState } from 'react'
import { get } from '../../api/apiClient'
import TimetableTable from '../../components/TimetableTable'

export default function FacultyDashboard() {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}')
  const [slots, setSlots] = useState([])
  const [today, setToday] = useState([])
  const [facultyInfo, setFacultyInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { 
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [slotsData, todayData, facultyData] = await Promise.all([
        get('/timeslots').catch(() => []),
        auth.linked_faculty_id ? get(`/faculty/${auth.linked_faculty_id}/today`).catch(() => []) : Promise.resolve([]),
        auth.linked_faculty_id ? get(`/faculty/${auth.linked_faculty_id}`).catch(() => null) : Promise.resolve(null)
      ])
      setSlots(slotsData)
      setToday(todayData)
      setFacultyInfo(facultyData)
    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  if (loading) {
    return (
      <div className="card">
        <h3>Loading...</h3>
      </div>
    )
  }

  if (!auth.linked_faculty_id) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Welcome, Faculty</h3>
        <div style={{ color: 'crimson' }}>
          No faculty profile linked to your account. Please contact your administrator to link your account to a faculty profile.
        </div>
      </div>
    )
  }

  return (
    <div className="grid">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Welcome, Faculty</h3>
        {facultyInfo && (
          <div className="muted" style={{ marginBottom: 16 }}>
            Faculty: {facultyInfo.name} ({facultyInfo.email || 'No email'})
          </div>
        )}
        <div className="muted">Quick view of today</div>
        {error && <div style={{ color: 'crimson', marginBottom: 16 }}>{error}</div>}
        <TimetableTable days={days} timeSlots={slots} entries={today} highlightToday />
      </div>
    </div>
  )
}


