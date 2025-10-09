import { GenerationLog, Timetable } from '../models/index.js'
import { generateTimetable } from '../utils/timetableGenerator.js'

export const generate = async (req, res, next) => {
  try {
    const { department_id, program_id, batch_id, academic_year } = req.body
    const log = await GenerationLog.create({ department_id, program_id, batch_id, academic_year, status: 'success', message: 'Started' })
    const result = generateTimetable({})
    res.json({ log_id: log.log_id, status: result.status, entries: result.entries })
  } catch (e) { next(e) }
}

export const logs = async (req, res, next) => {
  try { res.json(await GenerationLog.findAll({ order: [['generated_at','DESC']] })) } catch (e) { next(e) }
}

export const viewByBatch = async (req, res, next) => {
  try { res.json(await Timetable.findAll({ where: { batch_id: req.params.batch_id } })) } catch (e) { next(e) }
}

