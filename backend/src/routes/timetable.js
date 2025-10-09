import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

// TimeSlots
router.get('/timeslots', async (req, res) => {
  try { res.json(await db.query('SELECT * FROM TimeSlots ORDER BY start_time')) } catch (e) { res.status(400).json({ message: e.message }) }
})

// Today preview for admin
router.get('/timetable/today', async (req, res) => {
  try {
    const dayMap = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const day = dayMap[new Date().getDay()]
    const rows = await db.query(
      `SELECT t.*, s.name as subject_name, f.name as faculty_name, c.name as room_name
       FROM TimetableEntries t
       JOIN Subjects s ON s.subject_id = t.subject_id
       JOIN Faculty f ON f.faculty_id = t.faculty_id
       JOIN Classrooms c ON c.room_id = t.room_id
       WHERE t.day_of_week = ?`, [day]
    )
    res.json(rows)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

// Faculty endpoints
router.get('/faculty/:faculty_id/today', async (req, res) => {
  try {
    const dayMap = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const day = dayMap[new Date().getDay()]
    const rows = await db.query(
      `SELECT t.*, s.name as subject_name, c.name as room_name
       FROM TimetableEntries t
       JOIN Subjects s ON s.subject_id = t.subject_id
       JOIN Classrooms c ON c.room_id = t.room_id
       WHERE t.faculty_id = ? AND t.day_of_week = ?`, [req.params.faculty_id, day]
    )
    res.json(rows)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

router.get('/faculty/:faculty_id/timetable', async (req, res) => {
  const { year, term } = req.query
  try {
    const rows = await db.query(
      `SELECT t.*, s.name as subject_name, c.name as room_name
       FROM TimetableEntries t
       JOIN Subjects s ON s.subject_id = t.subject_id
       JOIN Classrooms c ON c.room_id = t.room_id
       WHERE t.faculty_id = ? AND t.academic_year = ?`, [req.params.faculty_id, year]
    )
    res.json(rows)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

// Student endpoints
router.get('/student/:batch_id/today', async (req, res) => {
  try {
    const dayMap = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const day = dayMap[new Date().getDay()]
    const rows = await db.query(
      `SELECT t.*, s.name as subject_name, f.name as faculty_name, c.name as room_name
       FROM TimetableEntries t
       JOIN Subjects s ON s.subject_id = t.subject_id
       JOIN Faculty f ON f.faculty_id = t.faculty_id
       JOIN Classrooms c ON c.room_id = t.room_id
       WHERE t.batch_id = ? AND t.day_of_week = ?`, [req.params.batch_id, day]
    )
    res.json(rows)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

router.get('/student/:batch_id/timetable', async (req, res) => {
  const { year, term } = req.query
  try {
    const rows = await db.query(
      `SELECT t.*, s.name as subject_name, f.name as faculty_name, c.name as room_name
       FROM TimetableEntries t
       JOIN Subjects s ON s.subject_id = t.subject_id
       JOIN Faculty f ON f.faculty_id = t.faculty_id
       JOIN Classrooms c ON c.room_id = t.room_id
       WHERE t.batch_id = ? AND t.academic_year = ?`, [req.params.batch_id, year]
    )
    res.json(rows)
  } catch (e) { res.status(400).json({ message: e.message }) }
})

// Generate timetable (stub - echoes params and returns empty entries)
router.post('/timetable/generate', async (req, res) => {
  const { department_id, program_id, batch_id, academic_year } = req.body
  try {
    // Insert a generation log
    const r = await db.query('INSERT INTO GenerationLogs(department_id, academic_year, status) VALUES (?, ?, ?)', [department_id, academic_year, 'In Progress'])
    // For now, return empty entries (generator not implemented here)
    res.json({ status: 'Success', log_id: r.insertId, entries: [] })
  } catch (e) { res.status(400).json({ message: e.message }) }
})

router.get('/timetable/logs', async (req, res) => {
  try { res.json(await db.query('SELECT * FROM GenerationLogs ORDER BY started_at DESC')) } catch (e) { res.status(400).json({ message: e.message }) }
})

export default router


