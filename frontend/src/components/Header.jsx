import { useNavigate } from 'react-router-dom'

const INK = '#1c252b'
const SLATE = '#5c6b72'
const HAIRLINE = '#d8dce0'
const PAPER = '#f7f6f3'
const ACCENT = '#7a2e2e'

export default function Header({ role }) {
  const navigate = useNavigate()

  const onLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('auth')
    localStorage.removeItem('token')
    // Navigate to login page and replace the current history entry
    navigate('/login', { replace: true })
  }

  // Registry-style role codes, same visual language as the dashboard's stat tags
  const roleCode = {
    'Admin': 'ADM',
    'Faculty': 'FAC',
    'Viewer': 'VWR'
  }
  const code = roleCode[role] || 'USR'

  return (
    <header
      className="header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 4px',
        borderBottom: `2px solid ${INK}`,
        fontFamily: "'Inter', sans-serif",
        color: INK
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: '17px', fontWeight: 600, letterSpacing: '-0.2px', color: '#000' }}>
          Smart Timetable Scheduler
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {role && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 5px 5px 10px'
          }}>
            <span style={{ fontSize: '13px', color: SLATE }}>{role}</span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '10px',
              letterSpacing: '1px',
              color: ACCENT,
              border: `1px solid ${ACCENT}55`,
              padding: '3px 6px',
              minWidth: '32px',
              textAlign: 'center'
            }}>
              {code}
            </span>
          </div>
        )}

        <button
          onClick={onLogout}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            color: INK,
            background: 'transparent',
            border: `1px solid ${HAIRLINE}`,
            padding: '7px 14px',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = INK
            e.currentTarget.style.color = PAPER
            e.currentTarget.style.borderColor = INK
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = INK
            e.currentTarget.style.borderColor = HAIRLINE
          }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}
