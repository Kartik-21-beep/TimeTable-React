import { Link, useLocation } from 'react-router-dom'

const INK = '#1c252b'
const SLATE = '#5c6b72'
const HAIRLINE = '#d8dce0'
const PAPER = '#f7f6f3'
const ACCENT = '#7a2e2e'

export default function Sidebar({ role }) {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/admin/dashboard' || path === '/faculty/dashboard' || path === '/student/dashboard') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const NavLink = ({ to, index, children }) => {
    const active = isActive(to)
    return (
      <Link
        to={to}
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '10px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13.5px',
          fontWeight: active ? 600 : 400,
          color: '#000',
          textDecoration: 'none',
          padding: '8px 12px 8px 14px',
          borderLeft: `2px solid ${active ? ACCENT : 'transparent'}`,
          backgroundColor: active ? PAPER : 'transparent',
          transition: 'background-color 0.15s ease, border-color 0.15s ease'
        }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = PAPER }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '10.5px',
          color: active ? ACCENT : SLATE,
          minWidth: '15px'
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        {children}
      </Link>
    )
  }

  const Section = ({ title, items }) => (
    <div style={{ marginBottom: '22px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '0 12px 6px 14px',
        borderBottom: `1px solid ${HAIRLINE}`,
        marginBottom: '2px',
        paddingBottom: '7px'
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '10px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: SLATE
        }}>
          {title}
        </span>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '9.5px',
          color: HAIRLINE
        }}>
          {String(items.length).padStart(2, '0')}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => (
          <NavLink key={item.to} to={item.to} index={i}>{item.label}</NavLink>
        ))}
      </div>
    </div>
  )

  return (
    <aside className="sidebar" style={{ borderRight: `1px solid ${HAIRLINE}`, paddingTop: '18px' }}>
      {!role && (
        <Section title="Auth" items={[
          { to: '/login', label: 'Login' },
          { to: '/signup', label: 'Signup' }
        ]} />
      )}

      {role === 'Admin' && (
        <>
          <Section title="Main" items={[
            { to: '/admin/dashboard', label: 'Dashboard' }
          ]} />

          <Section title="Management" items={[
            { to: '/admin/departments', label: 'Departments' },
            { to: '/admin/programs', label: 'Programs' },
            { to: '/admin/batches', label: 'Batches' },
            { to: '/admin/semesters', label: 'Semesters' },
            { to: '/admin/subjects', label: 'Subjects' },
            { to: '/admin/faculty', label: 'Faculty' },
            { to: '/admin/classrooms', label: 'Classrooms' }
          ]} />

          <Section title="Electives" items={[
            { to: '/admin/elective-groups', label: 'Elective Groups' },
            { to: '/admin/elective-subjects', label: 'Elective Subjects' },
            { to: '/admin/batch-electives', label: 'Batch Elective Choice' }
          ]} />

          <Section title="Timetable" items={[
            { to: '/admin/time-slots', label: 'Time Slots' },
            { to: '/admin/academic-terms', label: 'Academic Terms' },
            { to: '/admin/department-constraints', label: 'Department Constraints' },
            { to: '/admin/generate', label: 'Generate Timetable' },
            { to: '/admin/clear-timetable', label: 'Clear Timetable' },
            { to: '/admin/logs', label: 'Generation Logs' }
          ]} />
        </>
      )}

      {role === 'Faculty' && (
        <Section title="Faculty" items={[
          { to: '/faculty/dashboard', label: 'Dashboard' },
          { to: '/faculty/timetable', label: 'My Timetable' },
          { to: '/faculty/availability', label: 'Manage Availability' }
        ]} />
      )}

      {role === 'Viewer' && (
        <Section title="Student" items={[
          { to: '/student/dashboard', label: 'Dashboard' },
          { to: '/student/timetable', label: 'My Timetable' },
          { to: '/student/choose-electives', label: 'Choose Electives' }
        ]} />
      )}
    </aside>
  )
}
