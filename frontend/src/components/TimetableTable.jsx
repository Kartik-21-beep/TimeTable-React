export default function TimetableTable({ days, timeSlots, entries, highlightToday }) {
  const weekdayIndex = new Date().getDay() // 0=Sun
  const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][weekdayIndex]
  const lunchLetters = { Monday: 'L', Tuesday: 'U', Wednesday: 'N', Thursday: 'C', Friday: 'H' }
  const isLunch = (slot) => (slot?.label || '').toLowerCase().includes('lunch')
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
            {timeSlots.map((slot, slotIndex) => {
              // If lunch slot, render day-specific letter and skip normal entry rendering
              if (isLunch(slot)) {
                const letter = lunchLetters[day] || ''
                return (
                  <td key={`${day}-${slot.timeslot_id || slot.label}`} style={{ textAlign: 'center', fontWeight: 700 }}>
                    {letter}
                  </td>
                )
              }
              // Find entry that starts at this slot or spans this slot
              const cell = entries?.find(e => {
                if (e.day_of_week !== day) return false
                
                // Check if this entry starts at this slot
                if (e.timeslot_id === slot.timeslot_id) return true
                
                // Check if this entry spans this slot (for multi-hour sessions)
                if (e.span_slots && e.span_slots > 1) {
                  const startIndex = timeSlots.findIndex(s => s.timeslot_id === e.timeslot_id)
                  if (startIndex !== -1 && slotIndex >= startIndex && slotIndex < startIndex + e.span_slots) {
                    return true
                  }
                }
                
                return false
              })
              
              // Check if this slot is part of a spanning entry but not the starting slot
              const isSpanningSlot = cell && cell.span_slots > 1 && cell.timeslot_id !== slot.timeslot_id
              
              return (
                <td key={`${day}-${slot.timeslot_id || slot.label}`} 
                    style={isSpanningSlot ? { 
                      backgroundColor: '#f3f4f6', 
                      borderLeft: 'none',
                      borderRight: 'none'
                    } : {}}>
                  {cell && !isSpanningSlot ? (
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


