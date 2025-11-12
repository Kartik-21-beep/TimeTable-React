import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../../api/apiClient'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ departments: 0, programs: 0, batches: 0, faculty: 0, subjects: 0, classrooms: 0 })

  useEffect(() => {
    async function load() {
      try {
        const [deps, progs, bats, facs, subs, rooms] = await Promise.all([
          get('/admin/departments'),
          get('/admin/programs'),
          get('/admin/batches'),
          get('/admin/faculty'),
          get('/admin/subjects'),
          get('/admin/classrooms')
        ])
        setCounts({ 
          departments: deps.length, 
          programs: progs.length, 
          batches: bats.length, 
          faculty: facs.length, 
          subjects: subs.length,
          classrooms: rooms.length
        })
      } catch {}
    }
    load()
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>Dashboard</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px' }}>Overview of your timetable system</p>
      </div>
      
      <div className="grid three" style={{ marginBottom: '24px' }}>
        <StatCard 
          label="Departments" 
          value={counts.departments} 
          icon="🏢"
          color="#3b82f6"
          link="/admin/departments"
        />
        <StatCard 
          label="Programs" 
          value={counts.programs} 
          icon="📚"
          color="#8b5cf6"
          link="/admin/programs"
        />
        <StatCard 
          label="Batches" 
          value={counts.batches} 
          icon="👥"
          color="#10b981"
          link="/admin/batches"
        />
        <StatCard 
          label="Faculty" 
          value={counts.faculty} 
          icon="👨‍🏫"
          color="#f59e0b"
          link="/admin/faculty"
        />
        <StatCard 
          label="Subjects" 
          value={counts.subjects} 
          icon="📖"
          color="#ef4444"
          link="/admin/subjects"
        />
        <StatCard 
          label="Classrooms" 
          value={counts.classrooms} 
          icon="🏫"
          color="#06b6d4"
          link="/admin/classrooms"
        />
      </div>

      <div className="grid two">
        <QuickActionCard 
          title="Generate Timetable"
          description="Create a new timetable automatically"
          icon="⚡"
          link="/admin/generate"
          color="#3b82f6"
        />
        <QuickActionCard 
          title="Clear Timetable"
          description="Remove existing timetable entries"
          icon="🗑️"
          link="/admin/clear-timetable"
          color="#ef4444"
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color, link }) {
  const content = (
    <div className="stat-card" style={{ '--accent': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  )

  if (link) {
    return <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</Link>
  }
  return content
}

function QuickActionCard({ title, description, icon, link, color }) {
  return (
    <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="quick-action-card" style={{ '--accent': color }}>
        <div className="quick-action-icon">{icon}</div>
        <div className="quick-action-content">
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{title}</h3>
          <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px' }}>{description}</p>
        </div>
        <div className="quick-action-arrow">→</div>
      </div>
    </Link>
  )
}


