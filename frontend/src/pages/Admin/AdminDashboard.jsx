import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../../api/apiClient'

// Registrar-office palette. One accent, used sparingly.
const INK = '#1c252b'
const SLATE = '#5c6b72'
const HAIRLINE = '#d8dce0'
const PAPER = '#f7f6f3'
const ACCENT = '#7a2e2e' // oxford red

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
`

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ departments: 0, programs: 0, batches: 0, faculty: 0, subjects: 0, classrooms: 0 })
  const [loading, setLoading] = useState(true)
  const [now] = useState(() => new Date())

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

  const registry = [
    { code: 'DEPT', label: 'Departments', value: counts.departments, link: '/admin/departments' },
    { code: 'PROG', label: 'Programs', value: counts.programs, link: '/admin/programs' },
    { code: 'BATC', label: 'Batches', value: counts.batches, link: '/admin/batches' },
    { code: 'FAC', label: 'Faculty', value: counts.faculty, link: '/admin/faculty' },
    { code: 'SUBJ', label: 'Subjects', value: counts.subjects, link: '/admin/subjects' },
    { code: 'ROOM', label: 'Classrooms', value: counts.classrooms, link: '/admin/classrooms' }
  ]

  const actions = [
    { title: 'Generate timetable', description: 'Build a fresh schedule from current data', link: '/admin/generate' },
    { title: 'Clear timetable', description: 'Remove all existing timetable entries', link: '/admin/clear-timetable' }
  ]

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', fontFamily: "'Inter', sans-serif", color: INK }}>
      <style>{FONTS}</style>

      {/* Header, ledger-book style */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottom: `2px solid ${INK}`,
        paddingBottom: '14px',
        marginBottom: '4px'
      }}>
        <div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '2px',
            color: SLATE,
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}>
            Administration · Registry
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: "'Source Serif 4', serif",
            fontSize: '34px',
            fontWeight: 600,
            letterSpacing: '-0.3px'
          }}>
            Dashboard
          </h1>
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          color: SLATE,
          textAlign: 'right',
          lineHeight: 1.6
        }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Registry table — dot-leader rows like a directory index */}
      <div style={{ marginTop: '28px', marginBottom: '40px' }}>
        {registry.map((row, idx) => (
          <Link
            key={row.code}
            to={row.link}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '13px 4px',
                borderBottom: idx === registry.length - 1 ? 'none' : `1px solid ${HAIRLINE}`,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = PAPER }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '10px',
                letterSpacing: '1px',
                color: ACCENT,
                border: `1px solid ${ACCENT}55`,
                borderRadius: '2px',
                padding: '3px 6px',
                minWidth: '38px',
                textAlign: 'center'
              }}>
                {row.code}
              </span>

              <span style={{ fontSize: '14.5px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {row.label}
              </span>

              <span style={{
                flex: 1,
                borderBottom: `1px dotted ${HAIRLINE}`,
                margin: '0 4px',
                transform: 'translateY(-4px)'
              }} />

              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '18px',
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                minWidth: '32px',
                textAlign: 'right'
              }}>
                {loading ? '–' : row.value}
              </span>

              <span style={{ fontSize: '13px', color: SLATE, width: '14px', textAlign: 'right' }}>›</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Actions — instructions, not buttons */}
      <div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          letterSpacing: '2px',
          color: SLATE,
          textTransform: 'uppercase',
          marginBottom: '10px'
        }}>
          Actions
        </div>
        <div style={{ border: `1px solid ${INK}` }}>
          {actions.map((action, idx) => (
            <Link
              key={action.title}
              to={action.link}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 20px',
                  borderBottom: idx === actions.length - 1 ? 'none' : `1px solid ${INK}`,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = INK
                  e.currentTarget.style.color = PAPER
                  e.currentTarget.querySelector('.arrow').style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = INK
                  e.currentTarget.querySelector('.arrow').style.transform = 'translateX(0)'
                }}
              >
                <div>
                  <div style={{ fontFamily: "'Source Serif 4', serif", fontSize: '17px', fontWeight: 600, marginBottom: '3px' }}>
                    {action.title}
                  </div>
                  <div style={{ fontSize: '13px', opacity: 0.75 }}>
                    {action.description}
                  </div>
                </div>
                <span className="arrow" style={{ fontSize: '18px', transition: 'transform 0.15s ease' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
