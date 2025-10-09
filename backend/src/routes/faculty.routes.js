import { Router } from 'express'
import { getTimetable, getAvailability, updateAvailability } from '../controllers/faculty.controller.js'

const r = Router()
r.get('/timetable/:faculty_id', getTimetable)
r.get('/availability/:faculty_id', getAvailability)
r.put('/availability/:faculty_id', updateAvailability)
export default r


