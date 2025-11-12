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
  
  const roleBadge = {
    'Admin': { emoji: '👨‍💼', color: '#3b82f6' },
    'Faculty': { emoji: '👨‍🏫', color: '#8b5cf6' },
    'Viewer': { emoji: '👨‍🎓', color: '#10b981' }
  }
  
  const currentRole = roleBadge[role] || { emoji: '👤', color: '#64748b' }
  
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 600
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
          </svg>
        </div>
        <div>Smart Timetable Scheduler</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {role && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '6px 12px',
            background: `${currentRole.color}15`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: currentRole.color
          }}>
            <span>{currentRole.emoji}</span>
            <span>{role}</span>
          </div>
        )}
        <button className="btn ghost" onClick={onLogout} style={{ fontSize: '14px' }}>
          Logout
        </button>
      </div>
    </header>
  )
}


