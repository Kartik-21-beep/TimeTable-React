import { Link } from 'react-router-dom'

export default function Sidebar({ role }) {
  return (
    <aside className="sidebar">
      {!role && (
        <div className="nav-section">
          <div className="nav-title">Auth</div>
          <Link className="nav-link" to="/login">Login</Link>
          <Link className="nav-link" to="/signup">Signup</Link>
        </div>
      )}
      {role === 'Admin' && (
        <div className="nav-section">
          <div className="nav-title">Admin</div>
          <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
          <Link className="nav-link" to="/admin/departments">Departments</Link>
          <Link className="nav-link" to="/admin/programs">Programs</Link>
          <Link className="nav-link" to="/admin/batches">Batches</Link>
          <Link className="nav-link" to="/admin/semesters">Semesters</Link>
          <Link className="nav-link" to="/admin/subjects">Subjects</Link>
          <Link className="nav-link" to="/admin/faculty">Faculty</Link>
          <Link className="nav-link" to="/admin/classrooms">Classrooms</Link>
          <Link className="nav-link" to="/admin/elective-groups">Elective Groups</Link>
          <Link className="nav-link" to="/admin/elective-subjects">Elective Subjects</Link>
          <Link className="nav-link" to="/admin/batch-electives">Batch Elective Choice</Link>
          <Link className="nav-link" to="/admin/department-constraints">Department Constraints</Link>
          <Link className="nav-link" to="/admin/time-slots">Time Slots</Link>
          <Link className="nav-link" to="/admin/academic-terms">Academic Terms</Link>
          <Link className="nav-link" to="/admin/clear-timetable">Clear Timetable</Link>
          <Link className="nav-link" to="/admin/generate">Generate Timetable</Link>
          <Link className="nav-link" to="/admin/logs">Generation Logs</Link>
        </div>
      )}
      {role === 'Faculty' && (
        <div className="nav-section">
          <div className="nav-title">Faculty</div>
          <Link className="nav-link" to="/faculty/dashboard">Dashboard</Link>
          <Link className="nav-link" to="/faculty/timetable">My Timetable</Link>
          <Link className="nav-link" to="/faculty/availability">Manage Availability</Link>
        </div>
      )}
      {role === 'Viewer' && (
        <div className="nav-section">
          <div className="nav-title">Student</div>
          <Link className="nav-link" to="/student/dashboard">Dashboard</Link>
          <Link className="nav-link" to="/student/timetable">My Timetable</Link>
          <Link className="nav-link" to="/student/choose-electives">Choose Electives</Link>
        </div>
      )}
    </aside>
  )
}


