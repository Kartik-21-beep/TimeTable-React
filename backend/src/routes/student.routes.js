import { Router } from 'express'
import { getTimetable, getTodayTimetable, getBatch, getElectives, chooseElectives } from '../controllers/student.controller.js'

const r = Router()
r.get('/batches/:batch_id', getBatch)
r.get('/:batch_id/timetable', getTimetable)
r.get('/:batch_id/today', getTodayTimetable)
r.get('/electives/:batch_id', getElectives)
r.post('/electives/:batch_id', chooseElectives)
export default r


