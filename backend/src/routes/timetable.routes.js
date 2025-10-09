import { Router } from 'express'
import { generate, logs, viewByBatch, timeslots, today } from '../controllers/timetable.controller.js'

const r = Router()
r.post('/timetable/generate', generate)
r.get('/timetable/logs', logs)
r.get('/timetable/view/:batch_id', viewByBatch)
// added computed helpers for frontend
r.get('/timeslots', timeslots)
r.get('/timetable/today', today)
export default r


