export default function TimetableTable({ days, timeSlots, entries, highlightToday }) {
  const weekdayIndex = new Date().getDay() // 0=Sun
  const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][weekdayIndex]
  return (
    <table className="timetable">
      <thead>
        <tr>
          <th>Day / Time</th>
          {timeSlots.map((slot) => (
            <th key={slot.timeslot_id || slot.label}>{slot.label || `${slot.start_time} - ${slot.end_time}`}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map((day) => (
          <tr key={day} className={highlightToday && day === todayName ? 'today' : ''}>
            <td style={{ fontWeight: 600 }}>{day}</td>
            {timeSlots.map((slot) => {
              const cell = entries?.find(e => e.day_of_week === day && (e.timeslot_id === slot.timeslot_id || e.label === slot.label))
              return (
                <td key={`${day}-${slot.timeslot_id || slot.label}`}>
                  {cell ? (
                    <div>
                      <div>{cell.subject_name || cell.subject}</div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>{cell.faculty_name || cell.faculty} • {cell.room_name || cell.room}</div>
                    </div>
                  ) : null}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}


