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

  const NavLink = ({ to, children }) => {
    const active = isActive(to)
    return (
      <Link
        to={to}
        style={{
          display: 'block',
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
        {children}
      </Link>
    )
  }

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: '22px' }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '10px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: SLATE,
        padding: '0 12px 6px 14px'
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )

  return (
    <aside className="sidebar" style={{ borderRight: `1px solid ${HAIRLINE}`, paddingTop: '18px' }}>
      {!role && (
        <Section title="Auth">
          <NavLink to="/login">Login</NavLink>
          <NavLink to="/signup">Signup</NavLink>
        </Section>
      )}

      {role === 'Admin' && (
        <>
          <Section title="Main">
            <NavLink to="/admin/dashboard">Dashboard</NavLink>
          </Section>

          <Section title="Management">
            <NavLink to="/admin/departments">Departments</NavLink>
            <NavLink to="/admin/programs">Programs</NavLink>
            <NavLink to="/admin/batches">Batches</NavLink>
            <NavLink to="/admin/semesters">Semesters</NavLink>
            <NavLink to="/admin/subjects">Subjects</NavLink>
            <NavLink to="/admin/faculty">Faculty</NavLink>
            <NavLink to="/admin/classrooms">Classrooms</NavLink>
          </Section>

          <Section title="Electives">
            <NavLink to="/admin/elective-groups">Elective Groups</NavLink>
            <NavLink to="/admin/elective-subjects">Elective Subjects</NavLink>
            <NavLink to="/admin/batch-electives">Batch Elective Choice</NavLink>
          </Section>

          <Section title="Timetable">
            <NavLink to="/admin/time-slots">Time Slots</NavLink>
            <NavLink to="/admin/academic-terms">Academic Terms</NavLink>
            <NavLink to="/admin/department-constraints">Department Constraints</NavLink>
            <NavLink to="/admin/generate">Generate Timetable</NavLink>
            <NavLink to="/admin/clear-timetable">Clear Timetable</NavLink>
            <NavLink to="/admin/logs">Generation Logs</NavLink>
          </Section>
        </>
      )}

      {role === 'Faculty' && (
        <Section title="Faculty">
          <NavLink to="/faculty/dashboard">Dashboard</NavLink>
          <NavLink to="/faculty/timetable">My Timetable</NavLink>
          <NavLink to="/faculty/availability">Manage Availability</NavLink>
        </Section>
      )}

      {role === 'Viewer' && (
        <Section title="Student">
          <NavLink to="/student/dashboard">Dashboard</NavLink>
          <NavLink to="/student/timetable">My Timetable</NavLink>
          <NavLink to="/student/choose-electives">Choose Electives</NavLink>
        </Section>
      )}
    </aside>
  )
}
