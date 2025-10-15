import { useEffect, useState } from 'react'
import { get } from '../../api/apiClient'
import TimetableTable from '../../components/TimetableTable'

export default function StudentDashboard() {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}')
  const [slots, setSlots] = useState([])
  const [today, setToday] = useState([])
  const [batchInfo, setBatchInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { 
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [slotsData, todayData, batchData] = await Promise.all([
        get('/timeslots').catch(() => []),
        auth.linked_batch_id ? get(`/student/${auth.linked_batch_id}/today`).catch(() => []) : Promise.resolve([]),
        auth.linked_batch_id ? get(`/batches/${auth.linked_batch_id}`).catch(() => null) : Promise.resolve(null)
      ])
      setSlots(slotsData)
      setToday(todayData)
      setBatchInfo(batchData)
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

  if (!auth.linked_batch_id) {
    return (
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Welcome, Student</h3>
        <div style={{ color: 'crimson' }}>
          No batch linked to your account. Please contact your administrator to link your account to a batch.
        </div>
      </div>
    )
  }

  return (
    <div className="grid">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Welcome, Student</h3>
        {batchInfo && (
          <div className="muted" style={{ marginBottom: 16 }}>
            Batch: {batchInfo.name} ({batchInfo.intake_year})
          </div>
        )}
        {error && <div style={{ color: 'crimson', marginBottom: 16 }}>{error}</div>}
        <TimetableTable days={days} timeSlots={slots} entries={today} highlightToday />
      </div>
    </div>
  )
}


