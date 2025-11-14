import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../../api/apiClient'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ departments: 0, programs: 0, batches: 0, faculty: 0, subjects: 0, classrooms: 0 })
  const [loading, setLoading] = useState(true)

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
      finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = [
    { label: "Departments", value: counts.departments, icon: "🏢", color: "#3b82f6", link: "/admin/departments" },
    { label: "Programs", value: counts.programs, icon: "📚", color: "#8b5cf6", link: "/admin/programs" },
    { label: "Batches", value: counts.batches, icon: "👥", color: "#10b981", link: "/admin/batches" },
    { label: "Faculty", value: counts.faculty, icon: "👨‍🏫", color: "#f59e0b", link: "/admin/faculty" },
    { label: "Subjects", value: counts.subjects, icon: "📖", color: "#ef4444", link: "/admin/subjects" },
    { label: "Classrooms", value: counts.classrooms, icon: "🏫", color: "#06b6d4", link: "/admin/classrooms" }
  ]

  const quickActions = [
    { title: "Generate Timetable", description: "Create a new timetable automatically", icon: "⚡", link: "/admin/generate", color: "#3b82f6" },
    { title: "Clear Timetable", description: "Remove existing timetable entries", icon: "🗑️", link: "/admin/clear-timetable", color: "#ef4444" }
  ]

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Minimal Header */}
      <div style={{ marginBottom: '40px', paddingBottom: '16px', borderBottom: '2px solid var(--border)' }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '36px', 
          fontWeight: 800, 
          color: 'var(--text)',
          letterSpacing: '-1px'
        }}>
          Admin Dashboard
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
          System overview and quick actions
        </p>
      </div>

      {/* Compact Stats - Line Style */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '16px',
        marginBottom: '40px'
      }}>
        {stats.map((stat, idx) => (
          <Link key={idx} to={stat.link} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              padding: '16px',
              borderLeft: `4px solid ${stat.color}`,
              background: 'linear-gradient(to right, ' + stat.color + '08, transparent)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderLeftWidth = '6px'
              e.currentTarget.style.background = 'linear-gradient(to right, ' + stat.color + '15, transparent)'
              e.currentTarget.style.transform = 'translateX(4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderLeftWidth = '4px'
              e.currentTarget.style.background = 'linear-gradient(to right, ' + stat.color + '08, transparent)'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: stat.color,
                  lineHeight: 1
                }}>
                  {loading ? '...' : stat.value}
                </div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Compact Action Buttons */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {quickActions.map((action, idx) => (
          <Link key={idx} to={action.link} style={{ textDecoration: 'none', flex: 1 }}>
            <div style={{
              padding: '20px 24px',
              border: `2px solid ${action.color}`,
              borderRadius: '8px',
              background: '#fff',
              transition: 'all 0.2s',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = action.color
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}40`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fff'
              e.currentTarget.style.color = 'inherit'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <span style={{ fontSize: '24px' }}>{action.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                  {action.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  {action.description}
                </div>
              </div>
              <span style={{ fontSize: '20px', opacity: 0.6 }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
