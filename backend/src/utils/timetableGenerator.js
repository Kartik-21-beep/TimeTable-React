// Minimal placement: assign each subject's weekly hours as 1h blocks (or block_hours) sequentially
export function generateTimetable({ assignments = [], timeSlots = [], days = [], subjectMap = {}, facultyMap = {}, historical = [], constraint = null, availabilityMap = {}, rooms = [], respect_lunch = true, preOccupiedKeys = [] }) {
  const entries = []
  if (!timeSlots.length || !days.length) return { entries, status: 'success', message: 'No timeslots/days available' }

  // Debug logging
  console.log('Generator inputs:', {
    assignmentsCount: assignments.length,
    timeSlotsCount: timeSlots.length,
    daysCount: days.length,
    subjectsCount: Object.keys(subjectMap).length,
    facultyCount: Object.keys(facultyMap).length
  })

  // Build simple calendar grid availability per faculty/day/slot
  const occupied = new Set(preOccupiedKeys || [])
  // Track how many times a subject is placed per day to avoid duplicates
  const subjectDayCount = new Map()
  // Track how many practicals are placed per day (cap: 1 per day)
  const practicalsPerDay = new Map()

  const isLunch = (slot) => {
    if (!respect_lunch) return false
    return (slot.label?.toLowerCase().includes('lunch')) || false
  }

  // Score preferences from history: subject_id/faculty_id -> preferred slots
  const historyScore = new Map()
  for (const h of historical) {
    const key = `${h.subject_id || ''}-${h.faculty_id || ''}`
    const arr = historyScore.get(key) || []
    arr.push({ day_of_week: h.day_of_week, timeslot_id: h.timeslot_id })
    historyScore.set(key, arr)
  }

  // Place each assignment
  for (const a of assignments) {
    console.log('Processing assignment:', a)
    const subj = subjectMap[a.subject_id]
    const fac = facultyMap[Number(a.faculty_id)]
    console.log('Found subject:', subj, 'Found faculty:', fac)
    if (!subj || !fac) {
      console.log('Skipping assignment - missing subject or faculty')
      continue
    }

    const totalBlocks = Math.max(1, Number(a.block_hours) || (subj.type === 'Practical' ? 2 : 1))
    const weeklyHours = subj.weekly_hours || 1
    const classesNeeded = Math.ceil(weeklyHours / totalBlocks) // How many classes needed per week
    let placed = 0

    // Build candidate order: prefer historical slots first
    const histPref = (historyScore.get(`${subj.subject_id}-${fac.faculty_id}`) || [])
    const histKeys = new Set(histPref.map(p => `${p.day_of_week}-${p.timeslot_id}`))
    const candidates = []
    for (const day of days) {
      for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i]
        const key = `${day}-${slot.timeslot_id}`
        const score = histKeys.has(key) ? 0 : 1 // 0 = best (historical), 1 = others
        candidates.push({ day, i, score })
      }
    }
    candidates.sort((a,b)=>a.score-b.score || a.i-b.i)

    // Place multiple classes for this subject (based on weekly_hours)
    for (let classNum = 0; classNum < classesNeeded; classNum++) {
      outer: for (const cand of candidates) {
        const day = cand.day
        const i = cand.i
        // Check contiguous block
        let ok = true
        for (let k = 0; k < totalBlocks; k++) {
          const idx = i + k
          const slot = timeSlots[idx]
          if (!slot) { ok = false; break }
          if (isLunch(slot)) { ok = false; break }
          
          // For multi-hour sessions (labs), ensure they don't span lunch time
          if (totalBlocks > 1) {
            // Check if this block would cross lunch time
            const lunchSlotIndex = timeSlots.findIndex(s => isLunch(s))
            if (lunchSlotIndex !== -1) {
              const startIdx = i
              const endIdx = i + totalBlocks - 1
              // If the block starts before lunch and ends after lunch, it spans lunch
              if (startIdx < lunchSlotIndex && endIdx >= lunchSlotIndex) {
                ok = false; break
              }
            }
          }
          // Department working window
          if (constraint) {
            const ws = constraint.working_start || '09:00:00'
            const we = constraint.working_end || '17:30:00'
            if ((slot.start_time && slot.start_time < ws) || (slot.end_time && slot.end_time > we)) { ok = false; break }
          }
          // Faculty availability windows (if present)
          const dayAvail = availabilityMap[fac.faculty_id]?.[day]
          if (dayAvail && dayAvail.length) {
            const within = dayAvail.some(win => (!slot.start_time || slot.start_time >= win.start) && (!slot.end_time || slot.end_time <= win.end))
            if (!within) { ok = false; break }
          }
          // Check if this faculty is already teaching at this time slot
          const facultyKey = `${fac.faculty_id}-${day}-${slot.timeslot_id}`
          if (occupied.has(facultyKey)) { ok = false; break }
          
          // Check if ANY faculty is already teaching at this time slot (prevent double booking)
          const slotKey = `${day}-${slot.timeslot_id}`
          if (occupied.has(slotKey)) { ok = false; break }
        }
        if (!ok) continue

        // Avoid scheduling the same subject more than once per day if possible
        const subjDayKey = `${subj.subject_id}-${day}`
        const alreadyPlacedToday = subjectDayCount.get(subjDayKey) || 0
        if (alreadyPlacedToday >= 1) {
          // Try other candidates first to distribute across days
          continue
        }

        // Cap practicals (labs) to at most one per day (for this batch)
        if (subj.type === 'Practical') {
          const dayPracticals = practicalsPerDay.get(day) || 0
          if (dayPracticals >= 1) {
            // Another practical already scheduled this day; try a different day/slot
            continue
          }
        }

        // Reserve and emit entries - create one entry that spans multiple slots
        const startSlot = timeSlots[i]
        const endSlot = timeSlots[i + totalBlocks - 1]
        const startTime = startSlot.start_time
        const endTime = endSlot.end_time
        
        // Mark all slots as occupied for this faculty AND mark slots as occupied
        for (let k = 0; k < totalBlocks; k++) {
          const slot = timeSlots[i + k]
          occupied.add(`${fac.faculty_id}-${day}-${slot.timeslot_id}`) // Faculty-specific
          occupied.add(`${day}-${slot.timeslot_id}`) // Slot-specific (prevents double booking)
        }
        
        // Create a single entry that spans the entire block
        entries.push({
          day_of_week: day,
          timeslot_id: startSlot.timeslot_id,
          start_time: startTime,
          end_time: endTime,
          label: `${(startTime||'').slice(0,5)} - ${(endTime||'').slice(0,5)}`,
          subject: `${subj.code}`,
          subject_name: subj.name,
          faculty: fac.name,
          faculty_name: fac.name,
          room: 'TBD',
          room_name: 'TBD',
          span_slots: totalBlocks // Track how many slots this entry spans
        })
        subjectDayCount.set(subjDayKey, alreadyPlacedToday + 1)
        if (subj.type === 'Practical') {
          practicalsPerDay.set(day, (practicalsPerDay.get(day) || 0) + 1)
        }
        placed += totalBlocks
        console.log(`Placed ${totalBlocks} blocks for ${subj.name} (class ${classNum + 1}/${classesNeeded}) at ${day} ${startTime}-${endTime}`)
        break outer
      }
    }
  }

  console.log('Final entries:', entries.length)
  if (entries.length === 0) return { entries, status: 'success', message: 'No entries placed. Check assignments and timeslots.' }
  return { entries, status: 'success', message: `Placed ${entries.length} blocks.` }
}


