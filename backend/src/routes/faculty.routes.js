import { Router } from 'express'
import { getTimetable, getTodayTimetable, getFaculty, getAvailability, updateAvailability } from '../controllers/faculty.controller.js'

const r = Router()
r.get('/:faculty_id', getFaculty)
r.get('/timetable/:faculty_id', getTimetable)
r.get('/:faculty_id/today', getTodayTimetable)
r.get('/availability/:faculty_id', getAvailability)
r.put('/availability/:faculty_id', updateAvailability)
export default r


