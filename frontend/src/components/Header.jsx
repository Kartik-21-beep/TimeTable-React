import { useNavigate } from 'react-router-dom'

export default function Header({ role }) {
  const navigate = useNavigate()
  const onLogout = () => {
    localStorage.removeItem('auth')
    navigate('/login')
  }
  return (
    <header className="header">
      <div style={{ fontWeight: 600 }}>Timetable Scheduler</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#6b7280' }}>{role ? `Role: ${role}` : ''}</span>
        <button className="btn ghost" onClick={onLogout}>Logout</button>
      </div>
    </header>
  )
}


