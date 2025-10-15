import { useNavigate } from 'react-router-dom'

export default function Header({ role }) {
  const navigate = useNavigate()
  const onLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('auth')
    localStorage.removeItem('token')
    // Navigate to login page and replace the current history entry
    navigate('/login', { replace: true })
  }
  return (
    <header className="header">
      <div style={{ fontWeight: 600 }}>Smart Timetable Scheduler</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#6b7280' }}>{role ? `Role: ${role}` : ''}</span>
        <button className="btn ghost" onClick={onLogout}>Logout</button>
      </div>
    </header>
  )
}


