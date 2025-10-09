import { useEffect, useState } from 'react'
import { get } from '../../api/apiClient'

export default function ViewGenerationLogs() {
  const [logs, setLogs] = useState([])

  useEffect(() => { (async () => { try { setLogs(await get('/timetable/logs')) } catch {} })() }, [])

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Generation Logs</h3>
      <table>
        <thead>
          <tr><th>ID</th><th>Department</th><th>Year</th><th>Started</th><th>Finished</th><th>Status</th></tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.department_id}</td>
              <td>{l.academic_year}</td>
              <td>{l.started_at}</td>
              <td>{l.finished_at}</td>
              <td>{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


