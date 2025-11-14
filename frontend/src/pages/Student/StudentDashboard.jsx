import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
  const todayClasses = today.length
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
        Loading...
      </div>
    )
  }

  if (!auth.linked_batch_id) {
    return (
      <div style={{ padding: '32px', borderLeft: '4px solid #ef4444', background: '#fef2f2', borderRadius: '4px' }}>
        <h2 style={{ marginTop: 0, fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>Welcome, Student</h2>
        <div style={{ color: '#dc2626', marginTop: '16px' }}>
          No batch linked to your account. Please contact your administrator to link your account to a batch.
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Minimal Header */}
      <div style={{ marginBottom: '32px', paddingBottom: '16px', borderBottom: '2px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-1px' }}>
              Student Dashboard
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
              {currentDate}
            </p>
          </div>
        </div>
      </div>

      {/* Compact Stats - Line Style */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '16px',
          borderLeft: '4px solid #10b981',
          background: 'linear-gradient(to right, #10b98108, transparent)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Today's Classes
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981' }}>{todayClasses}</div>
        </div>
        <div style={{
          padding: '16px',
          borderLeft: '4px solid #3b82f6',
          background: 'linear-gradient(to right, #3b82f608, transparent)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Batch Name
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>{batchInfo?.name || 'N/A'}</div>
        </div>
        <div style={{
          padding: '16px',
          borderLeft: '4px solid #8b5cf6',
          background: 'linear-gradient(to right, #8b5cf608, transparent)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Intake Year
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#8b5cf6' }}>{batchInfo?.intake_year || 'N/A'}</div>
        </div>
      </div>

      {/* Today's Timetable - Minimal Style */}
      <div style={{ 
        marginBottom: '32px',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '16px 20px', 
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
              Today's Schedule
            </h2>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
              Your classes for today
            </p>
          </div>
          <Link to="/student/timetable" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '6px 12px',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--primary)'
            }}
            >
              View Full →
            </div>
          </Link>
        </div>
        
        {error && (
          <div style={{ 
            padding: '12px 20px', 
            background: '#fef2f2', 
            borderBottom: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        {todayClasses === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: 'var(--muted)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>No classes scheduled for today</div>
          </div>
        ) : (
          <div style={{ padding: '20px' }}>
            <TimetableTable days={days} timeSlots={slots} entries={today} highlightToday />
          </div>
        )}
      </div>

      {/* Compact Action Links */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/student/timetable" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{
            padding: '16px 20px',
            border: '2px solid #10b981',
            borderRadius: '8px',
            background: '#fff',
            transition: 'all 0.2s',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#10b981'
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.color = 'inherit'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          >
            <span style={{ fontSize: '20px' }}>📅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>My Timetable</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>View complete weekly schedule</div>
            </div>
            <span style={{ fontSize: '18px', opacity: 0.6 }}>→</span>
          </div>
        </Link>
        <Link to="/student/electives" style={{ textDecoration: 'none', flex: 1 }}>
          <div style={{
            padding: '16px 20px',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            background: '#fff',
            transition: 'all 0.2s',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3b82f6'
            e.currentTarget.style.color = '#fff'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.color = 'inherit'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          >
            <span style={{ fontSize: '20px' }}>✅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>Choose Electives</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Select your elective subjects</div>
            </div>
            <span style={{ fontSize: '18px', opacity: 0.6 }}>→</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
