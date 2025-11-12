import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ role }) {
  const location = useLocation()
  
  const isActive = (path) => {
    if (path === '/admin/dashboard' || path === '/faculty/dashboard' || path === '/student/dashboard') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }
  
  const NavLink = ({ to, children, icon }) => (
    <Link 
      className={`nav-link ${isActive(to) ? 'active' : ''}`} 
      to={to}
    >
      {icon && <span style={{ marginRight: '8px', fontSize: '16px' }}>{icon}</span>}
      {children}
    </Link>
  )
  
  return (
    <aside className="sidebar">
      {!role && (
        <div className="nav-section">
          <div className="nav-title">Auth</div>
          <NavLink to="/login" icon="🔐">Login</NavLink>
          <NavLink to="/signup" icon="✍️">Signup</NavLink>
        </div>
      )}
      {role === 'Admin' && (
        <>
          <div className="nav-section">
            <div className="nav-title">Main</div>
            <NavLink to="/admin/dashboard" icon="📊">Dashboard</NavLink>
          </div>
          <div className="nav-section">
            <div className="nav-title">Management</div>
            <NavLink to="/admin/departments" icon="🏢">Departments</NavLink>
            <NavLink to="/admin/programs" icon="📚">Programs</NavLink>
            <NavLink to="/admin/batches" icon="👥">Batches</NavLink>
            <NavLink to="/admin/semesters" icon="📅">Semesters</NavLink>
            <NavLink to="/admin/subjects" icon="📖">Subjects</NavLink>
            <NavLink to="/admin/faculty" icon="👨‍🏫">Faculty</NavLink>
            <NavLink to="/admin/classrooms" icon="🏫">Classrooms</NavLink>
          </div>
          <div className="nav-section">
            <div className="nav-title">Electives</div>
            <NavLink to="/admin/elective-groups" icon="📋">Elective Groups</NavLink>
            <NavLink to="/admin/elective-subjects" icon="📝">Elective Subjects</NavLink>
            <NavLink to="/admin/batch-electives" icon="✅">Batch Elective Choice</NavLink>
          </div>
          <div className="nav-section">
            <div className="nav-title">Timetable</div>
            <NavLink to="/admin/time-slots" icon="⏰">Time Slots</NavLink>
            <NavLink to="/admin/academic-terms" icon="📆">Academic Terms</NavLink>
            <NavLink to="/admin/department-constraints" icon="⚙️">Department Constraints</NavLink>
            <NavLink to="/admin/generate" icon="⚡">Generate Timetable</NavLink>
            <NavLink to="/admin/clear-timetable" icon="🗑️">Clear Timetable</NavLink>
            <NavLink to="/admin/logs" icon="📜">Generation Logs</NavLink>
          </div>
        </>
      )}
      {role === 'Faculty' && (
        <div className="nav-section">
          <div className="nav-title">Faculty</div>
          <NavLink to="/faculty/dashboard" icon="📊">Dashboard</NavLink>
          <NavLink to="/faculty/timetable" icon="📅">My Timetable</NavLink>
          <NavLink to="/faculty/availability" icon="⏰">Manage Availability</NavLink>
        </div>
      )}
      {role === 'Viewer' && (
        <div className="nav-section">
          <div className="nav-title">Student</div>
          <NavLink to="/student/dashboard" icon="📊">Dashboard</NavLink>
          <NavLink to="/student/timetable" icon="📅">My Timetable</NavLink>
          <NavLink to="/student/choose-electives" icon="📝">Choose Electives</NavLink>
        </div>
      )}
    </aside>
  )
}


