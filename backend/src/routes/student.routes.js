import { Router } from 'express'
import { getTimetable, getElectives, chooseElectives } from '../controllers/student.controller.js'

const r = Router()
r.get('/timetable/:batch_id', getTimetable)
r.get('/electives/:batch_id', getElectives)
r.post('/electives/:batch_id', chooseElectives)
export default r


