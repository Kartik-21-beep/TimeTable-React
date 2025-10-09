import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageDepartments from './pages/Admin/ManageDepartments'
import ManagePrograms from './pages/Admin/ManagePrograms'
import ManageBatches from './pages/Admin/ManageBatches'
import ManageSemesters from './pages/Admin/ManageSemesters'
import ManageSubjects from './pages/Admin/ManageSubjects'
import ManageFaculty from './pages/Admin/ManageFaculty'
import ManageClassrooms from './pages/Admin/ManageClassrooms'
import ManageElectiveGroups from './pages/Admin/ManageElectiveGroups'
import ManageElectiveSubjects from './pages/Admin/ManageElectiveSubjects'
import BatchElectiveChoice from './pages/Admin/BatchElectiveChoice'
import GenerateTimetable from './pages/Admin/GenerateTimetable'
import ViewGenerationLogs from './pages/Admin/ViewGenerationLogs'
import FacultyDashboard from './pages/Faculty/FacultyDashboard'
import FacultyTimetable from './pages/Faculty/MyTimetable'
import StudentDashboard from './pages/Student/StudentDashboard'
import StudentTimetable from './pages/Student/MyTimetable'
import ChooseElectives from './pages/Student/ChooseElectives'

function getAuth() {
  const raw = localStorage.getItem('auth')
  try { return raw ? JSON.parse(raw) : null } catch { return null }
}

function ProtectedRoute({ children, role }) {
  const auth = getAuth()
  const location = useLocation()
  if (!auth) return <Navigate to="/login" state={{ from: location }} replace />
  if (role && auth.role !== role) return <Navigate to={`/${auth.role.toLowerCase()}/dashboard`} replace />
  return children
}

function AppLayout({ children }) {
  const auth = getAuth()
  return (
    <div className="app-layout">
      <Header role={auth?.role} />
      <Sidebar role={auth?.role} />
      <main className="content">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/admin/*" element={
        <ProtectedRoute role="Admin">
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="departments" element={<ManageDepartments />} />
              <Route path="programs" element={<ManagePrograms />} />
              <Route path="batches" element={<ManageBatches />} />
              <Route path="semesters" element={<ManageSemesters />} />
              <Route path="subjects" element={<ManageSubjects />} />
              <Route path="faculty" element={<ManageFaculty />} />
              <Route path="classrooms" element={<ManageClassrooms />} />
              <Route path="elective-groups" element={<ManageElectiveGroups />} />
              <Route path="elective-subjects" element={<ManageElectiveSubjects />} />
              <Route path="batch-electives" element={<BatchElectiveChoice />} />
              <Route path="generate" element={<GenerateTimetable />} />
              <Route path="logs" element={<ViewGenerationLogs />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/faculty/*" element={
        <ProtectedRoute role="Faculty">
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="timetable" element={<FacultyTimetable />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/student/*" element={
        <ProtectedRoute role="Viewer">
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="choose-electives" element={<ChooseElectives />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to={getAuth() ? `/${getAuth().role.toLowerCase()}/dashboard` : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


