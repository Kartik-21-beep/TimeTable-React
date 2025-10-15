import { GenerationLog, TimetableEntry, TimeSlot, Subject, Faculty, Classroom, DepartmentConstraint, FacultyAvailability } from '../models/index.js'
import { generateTimetable } from '../utils/timetableGenerator.js'

// Helper function to add minutes to time string
function addMinutes(timeStr, minutes) {
  const [hours, mins] = timeStr.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60)
  const newMins = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}:00`
}

export const generate = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, academic_year, assignments, respect_lunch, no_weekends, persist } = req.body
    const log = await GenerationLog.create({ department_id, program_id, batch_id, academic_year, status: 'Success', details: 'Started' })

    // Load helpers and historical data
    const timeSlots = await TimeSlot.findAll({ order: [['start_time','ASC']] })
    const days = no_weekends ? ['Monday','Tuesday','Wednesday','Thursday','Friday'] : ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    
    // Ensure proper ordering: sort by start_time, lunch should be in middle based on department constraints
    const constraint = await DepartmentConstraint.findOne({ where: { department_id } })
    const workingStart = constraint?.working_start || '09:00:00'
    const workingEnd = constraint?.working_end || '17:30:00'
    const lunchStart = constraint?.lunch_start || '13:00:00'
    const lunchEnd = constraint?.lunch_end || '14:30:00'
    
    // Create proper time slots based on department constraints
    let sortedSlots = timeSlots
    
    // If no time slots exist or they're malformed, create them from department constraints
    if (!sortedSlots.length || sortedSlots.some(s => s.start_time < '08:00:00' || s.start_time > '18:00:00')) {
      sortedSlots = []
      const slotDuration = constraint?.slot_duration_minutes || 60
      const workingStart = constraint?.working_start || '09:00:00'
      const workingEnd = constraint?.working_end || '17:30:00'
      const lunchStart = constraint?.lunch_start || '13:00:00'
      const lunchEnd = constraint?.lunch_end || '14:30:00'
      
      // Create slots from working start to lunch start
      let currentTime = workingStart
      let slotId = 1
      
      while (currentTime < lunchStart) {
        const endTime = addMinutes(currentTime, slotDuration)
        if (endTime <= lunchStart) {
          sortedSlots.push({
            timeslot_id: slotId++,
            start_time: currentTime,
            end_time: endTime,
            label: `${currentTime.slice(0,5)}-${endTime.slice(0,5)}`
          })
        }
        currentTime = endTime
      }
      
      // Add lunch break
      sortedSlots.push({
        timeslot_id: slotId++,
        start_time: lunchStart,
        end_time: lunchEnd,
        label: `${lunchStart.slice(0,5)}-${lunchEnd.slice(0,5)} (Lunch)`
      })
      
      // Create slots from lunch end to working end
      currentTime = lunchEnd
      while (currentTime < workingEnd) {
        const endTime = addMinutes(currentTime, slotDuration)
        if (endTime <= workingEnd) {
          sortedSlots.push({
            timeslot_id: slotId++,
            start_time: currentTime,
            end_time: endTime,
            label: `${currentTime.slice(0,5)}-${endTime.slice(0,5)}`
          })
        }
        currentTime = endTime
      }
    } else {
      // Use existing slots but ensure they're properly sorted by logical order
      const filteredSlots = timeSlots.filter(slot => slot.start_time >= workingStart && slot.end_time <= workingEnd)
      
      // Define the correct order
      const orderMap = {
        'first': 1, 'second': 2, 'third': 3, 'fourth': 4,
        'fifth': 5, 'sixth': 6, 'seventh': 7, 'lunch': 4.5
      }
      
      // Sort slots by their logical order
      sortedSlots = filteredSlots.sort((a, b) => {
        const labelA = (a.label || '').toLowerCase()
        const labelB = (b.label || '').toLowerCase()
        
        // Extract order numbers from labels
        const orderA = Object.keys(orderMap).find(key => labelA.includes(key))
        const orderB = Object.keys(orderMap).find(key => labelB.includes(key))
        
        if (orderA && orderB) {
          return orderMap[orderA] - orderMap[orderB]
        }
        
        // Fallback to time-based sorting
        return a.start_time.localeCompare(b.start_time)
      })
    }
    const subjRows = await Subject.findAll({ where: { }, attributes: ['subject_id','semester_id','subject_code','name','type','weekly_hours'] })
    const facRows = await Faculty.findAll({ attributes: ['faculty_id','name'] })
    console.log('Available faculty in database:', facRows.map(f => ({ id: f.faculty_id, name: f.name })))
    const subjectMap = Object.fromEntries(subjRows.map(s => [s.subject_id, { subject_id: s.subject_id, semester_id: s.semester_id, code: s.subject_code, name: s.name, type: s.type, weekly_hours: s.weekly_hours }]))
    const facultyMap = Object.fromEntries(facRows.map(f => [f.faculty_id, { faculty_id: f.faculty_id, name: f.name }]))

    // Historical entries for scoring preferences (last year same program/batch if available)
    const historical = await TimetableEntry.findAll({
      where: { program_id, batch_id },
      attributes: ['subject_id','faculty_id','day_of_week','timeslot_id']
    })

    // Department constraints (already loaded above)

    // Faculty availability map: day -> list of windows
    const availabilityRows = await FacultyAvailability.findAll({ attributes: ['faculty_id','day_of_week','start_time','end_time'] })
    const availabilityMap = availabilityRows.reduce((acc, r) => {
      const key = r.faculty_id
      if (!acc[key]) acc[key] = {}
      if (!acc[key][r.day_of_week]) acc[key][r.day_of_week] = []
      acc[key][r.day_of_week].push({ start: r.start_time, end: r.end_time })
      return acc
    }, {})

    // Classrooms for department
    const rooms = await Classroom.findAll({ where: department_id ? { department_id } : {}, attributes: ['room_id','name','type','capacity','department_id'] })

    // Seed occupied map with existing timetable rows for the same batch/program/academic_year
    const existing = await TimetableEntry.findAll({
      where: { academic_year, program_id, batch_id },
      attributes: ['faculty_id','day_of_week','timeslot_id']
    })
    const preOccupiedKeys = existing.map(r => `${r.faculty_id}-${r.day_of_week}-${r.timeslot_id}`)

    const result = generateTimetable({
      assignments: assignments || [],
      timeSlots: sortedSlots,
      days,
      subjectMap,
      facultyMap,
      historical,
      constraint,
      availabilityMap,
      rooms,
      respect_lunch: !!respect_lunch,
      preOccupiedKeys
    })

    console.log('Generation result:', { 
      entriesCount: result.entries?.length || 0, 
      message: result.message,
      assignmentsSent: assignments?.length || 0,
      timeSlotsUsed: sortedSlots?.length || 0
    })
    console.log('Sorted time slots:', sortedSlots.map(s => ({ id: s.timeslot_id, label: s.label, start: s.start_time, end: s.end_time })))
    console.log('Generated entries:', result.entries?.map(e => ({ day: e.day_of_week, slot_id: e.timeslot_id, subject: e.subject_name })))

    // Optionally persist to DB if requested and if we have a classroom to assign
    if (persist && result.entries?.length) {
      // Try to find a classroom for this department, or any classroom if none found
      let room = await Classroom.findOne({ where: department_id ? { department_id } : {} })
      if (!room) {
        // If no department-specific room, try any room
        room = await Classroom.findOne({})
      }
      if (!room) {
        return res.json({ log_id: log.id, status: 'success', message: 'Generated (not saved): No classrooms found in database. Please add classrooms first.', entries: result.entries })
      }
      // Insert rows - fan out multi-hour blocks into one row per occupied slot
      const slotIndexById = new Map(sortedSlots.map((s, idx) => [s.timeslot_id, idx]))
      const payloads = []
      for (const e of result.entries) {
        const subj = Object.values(subjectMap).find(s => s.name === e.subject_name && s.code === e.subject)
        const faculty = Object.values(facultyMap).find(f => f.name === e.faculty_name)
        if (!subj || !faculty) continue

        const startIdx = slotIndexById.get(e.timeslot_id)
        const span = Math.max(1, Number(e.span_slots) || 1)
        if (startIdx === undefined) continue

        for (let k = 0; k < span; k++) {
          const slot = sortedSlots[startIdx + k]
          if (!slot) break
          // Skip lunch slot just in case
          if ((slot.label || '').toLowerCase().includes('lunch')) continue

          const row = {
            academic_year,
            department_id,
            program_id,
            batch_id,
            semester_id: subj.semester_id,
            subject_id: subj.subject_id,
            faculty_id: faculty.faculty_id,
            room_id: room.room_id,
            day_of_week: e.day_of_week,
            timeslot_id: slot.timeslot_id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            status: 'Scheduled',
            created_by: null,
            note: null
          }
          payloads.push(row)
        }
      }
      
      console.log('Payloads to insert:', payloads.length)
      if (payloads.length) {
        try {
          await TimetableEntry.bulkCreate(payloads)
          return res.json({ log_id: log.id, status: 'success', message: `Generated and saved ${payloads.length} blocks.`, entries: result.entries })
        } catch (saveError) {
          console.error('Save error:', saveError.message)
          return res.json({ log_id: log.id, status: 'success', message: `Generated ${result.entries.length} blocks (not saved: ${saveError.message}).`, entries: result.entries })
        }
      }
      return res.json({ log_id: log.id, status: 'success', message: 'Generated (no valid entries to save).', entries: result.entries })
    }

    res.json({ log_id: log.id, status: result.status, message: result.message, entries: result.entries })
  } catch (e) { next(e) }
}

export const logs = async (req, res, next) => {
  try { res.json(await GenerationLog.findAll({ order: [['started_at','DESC']] })) } catch (e) { next(e) }
}

export const viewByBatch = async (req, res, next) => {
  try { res.json(await TimetableEntry.findAll({ where: { batch_id: req.params.batch_id } })) } catch (e) { next(e) }
}

export const timeslots = async (req, res, next) => {
  try { res.json(await TimeSlot.findAll()) } catch (e) { next(e) }
}

export const today = async (req, res, next) => {
  try {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    res.json(await TimetableEntry.findAll({ where: { day_of_week: today } }))
  } catch (e) { next(e) }
}

// Review conflicts against existing timetable entries for a given scope
export const review = async (req, res, next) => {
  try {
    const { academic_year, program_id, batch_id } = req.body || {}
    if (!academic_year || !program_id || !batch_id) return res.status(400).json({ error: 'academic_year, program_id, batch_id are required' })
    const existing = await TimetableEntry.findAll({ where: { academic_year, program_id, batch_id } })
    // Build fast lookup
    const facultyKeys = new Set(existing.map(r => `${r.faculty_id}-${r.day_of_week}-${r.timeslot_id}`))
    const roomKeys = new Set(existing.map(r => `${r.room_id}-${r.day_of_week}-${r.timeslot_id}`))
    res.json({ ok: true, totals: { rows: existing.length, facultySlots: facultyKeys.size, roomSlots: roomKeys.size } })
  } catch (e) { next(e) }
}

// Delete timetable entries by scope
export const clear = async (req, res, next) => {
  try {
    const { academic_year, department_id, program_id, batch_id, semester_id } = req.query
    if (!academic_year || !program_id || !batch_id) return res.status(400).json({ error: 'academic_year, program_id, batch_id are required' })
    const where = { academic_year, program_id, batch_id }
    if (department_id) where.department_id = department_id
    if (semester_id) where.semester_id = semester_id
    const count = await TimetableEntry.destroy({ where })
    // Reseed AUTO_INCREMENT to max(timetable_id)+1
    const tableName = TimetableEntry.getTableName()
    const sequelize = TimetableEntry.sequelize
    try {
      const [rows] = await sequelize.query(`SELECT COALESCE(MAX(timetable_id), 0) + 1 AS next_id FROM \`${tableName}\``)
      const nextId = rows && rows[0] ? rows[0].next_id : 1
      await sequelize.query(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = ${Number(nextId)}`)
    } catch {}
    res.json({ ok: true, deleted: count })
  } catch (e) { next(e) }
}

