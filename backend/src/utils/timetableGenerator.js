// Generate timetable by assigning weekly subject hours into available time blocks
export function generateTimetable({
  assignments = [],
  timeSlots = [],
  days = [],
  subjectMap = {},
  facultyMap = {},
  historical = [],
  constraint = null,
  availabilityMap = {},
  respect_lunch = true,
  preOccupiedKeys = []
}) {
  const entries = []

  if (!timeSlots.length || !days.length) {
    return {
      entries,
      status: 'success',
      message: 'No timeslots/days available'
    }
  }

  // Track occupied slots for faculty/day/time
  const occupied = new Set(preOccupiedKeys || [])

  // Track subject frequency per day
  const subjectDayCount = new Map()

  // Track practical classes per day
  const practicalsPerDay = new Map()

  // Check whether the given slot is lunch
  const isLunch = (slot) => {
    if (!respect_lunch) return false

    return slot.label?.toLowerCase().includes('lunch') || false
  }

  // Store historical preferred slots for subject + faculty
  const historyScore = new Map()

  for (const h of historical) {
    const key = `${h.subject_id || ''}-${h.faculty_id || ''}`

    const arr = historyScore.get(key) || []

    arr.push({
      day_of_week: h.day_of_week,
      timeslot_id: h.timeslot_id
    })

    historyScore.set(key, arr)
  }

  // Process every assignment
  for (const a of assignments) {
    const subj = subjectMap[a.subject_id]
    const fac = facultyMap[Number(a.faculty_id)]

    // Skip if subject or faculty is missing
    if (!subj || !fac) {
      continue
    }

    // Number of consecutive slots required for this class
    const totalBlocks = Math.max(
      1,
      Number(a.block_hours) ||
        (subj.type === 'Practical' ? 2 : 1)
    )

    // Weekly hours required for the subject
    const weeklyHours = Number(subj.weekly_hours) || 1

    // Number of classes required per week
    const classesNeeded = Math.ceil(
      weeklyHours / totalBlocks
    )

    // Get historical preferred slots
    const histPref =
      historyScore.get(
        `${subj.subject_id}-${fac.faculty_id}`
      ) || []

    const histKeys = new Set(
      histPref.map(
        p => `${p.day_of_week}-${p.timeslot_id}`
      )
    )

    // Build all possible day/time candidates
    const candidates = []

    for (const day of days) {
      for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i]

        const key = `${day}-${slot.timeslot_id}`

        // Historical slots get higher priority
        const score = histKeys.has(key) ? 0 : 1

        candidates.push({
          day,
          i,
          score
        })
      }
    }

    // Historical slots first, then earlier slots
    candidates.sort(
      (a, b) =>
        a.score - b.score ||
        a.i - b.i
    )

    // Schedule required number of classes
    for (
      let classNum = 0;
      classNum < classesNeeded;
      classNum++
    ) {
      let placed = false

      for (const cand of candidates) {
        const day = cand.day
        const startIndex = cand.i

        let valid = true

        // Check all consecutive blocks
        for (
          let k = 0;
          k < totalBlocks;
          k++
        ) {
          const index = startIndex + k
          const slot = timeSlots[index]

          // Not enough slots available
          if (!slot) {
            valid = false
            break
          }

          // Lunch slot cannot be used
          if (isLunch(slot)) {
            valid = false
            break
          }

          // Check working hours
          if (constraint) {
            const workingStart =
              constraint.working_start || '09:00:00'

            const workingEnd =
              constraint.working_end || '17:30:00'

            if (
              (slot.start_time &&
                slot.start_time < workingStart) ||
              (slot.end_time &&
                slot.end_time > workingEnd)
            ) {
              valid = false
              break
            }
          }

          // Check faculty availability
          const dayAvailability =
            availabilityMap[fac.faculty_id]?.[day]

          if (
            dayAvailability &&
            dayAvailability.length
          ) {
            const available = dayAvailability.some(
              win =>
                (!slot.start_time ||
                  slot.start_time >= win.start) &&
                (!slot.end_time ||
                  slot.end_time <= win.end)
            )

            if (!available) {
              valid = false
              break
            }
          }

          // Check faculty clash
          const facultyKey =
            `${fac.faculty_id}-${day}-${slot.timeslot_id}`

          if (occupied.has(facultyKey)) {
            valid = false
            break
          }
        }

        if (!valid) {
          continue
        }

        // Avoid scheduling same subject twice on same day
        const subjectDayKey =
          `${subj.subject_id}-${day}`

        const alreadyPlacedToday =
          subjectDayCount.get(subjectDayKey) || 0

        if (alreadyPlacedToday >= 1) {
          continue
        }

        // Maximum one practical per day
        if (subj.type === 'Practical') {
          const practicalCount =
            practicalsPerDay.get(day) || 0

          if (practicalCount >= 1) {
            continue
          }
        }

        // Get start and end slot
        const startSlot =
          timeSlots[startIndex]

        const endSlot =
          timeSlots[startIndex + totalBlocks - 1]

        const startTime =
          startSlot.start_time

        const endTime =
          endSlot.end_time

        // Reserve faculty slots
        for (
          let k = 0;
          k < totalBlocks;
          k++
        ) {
          const slot =
            timeSlots[startIndex + k]

          const facultyKey =
            `${fac.faculty_id}-${day}-${slot.timeslot_id}`

          occupied.add(facultyKey)
        }

        // Add timetable entry
        entries.push({
          day_of_week: day,
          timeslot_id: startSlot.timeslot_id,
          start_time: startTime,
          end_time: endTime,

          label:
            `${(startTime || '').slice(0, 5)} - ` +
            `${(endTime || '').slice(0, 5)}`,

          subject: subj.code,
          subject_name: subj.name,

          faculty: fac.name,
          faculty_name: fac.name,

          room: 'TBD',
          room_name: 'TBD',

          span_slots: totalBlocks
        })

        // Update subject/day count
        subjectDayCount.set(
          subjectDayKey,
          alreadyPlacedToday + 1
        )

        // Update practical count
        if (subj.type === 'Practical') {
          practicalsPerDay.set(
            day,
            (practicalsPerDay.get(day) || 0) + 1
          )
        }

        placed = true
        break
      }

      // If no valid slot was found, try next class
      if (!placed) {
        break
      }
    }
  }

  // No timetable generated
  if (entries.length === 0) {
    return {
      entries,
      status: 'success',
      message:
        'No entries placed. Check assignments and timeslots.'
    }
  }

  // Return generated timetable
  return {
    entries,
    status: 'success',
    message:
      `Placed ${entries.length} timetable entries.`
  }
}
