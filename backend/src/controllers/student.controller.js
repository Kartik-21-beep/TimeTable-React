import { TimetableEntry, ElectiveGroup, ElectiveSubject, Batch } from '../models/index.js'

export const getTimetable = async (req, res, next) => {
  try { 
    res.json(await TimetableEntry.findAll({ where: { batch_id: req.params.batch_id } })) 
  } catch (e) { next(e) }
}

export const getTodayTimetable = async (req, res, next) => {
  try {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    res.json(await TimetableEntry.findAll({ 
      where: { 
        batch_id: req.params.batch_id,
        day_of_week: today
      } 
    })) 
  } catch (e) { next(e) }
}

export const getBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findByPk(req.params.batch_id)
    if (!batch) return res.status(404).json({ message: 'Batch not found' })
    res.json(batch)
  } catch (e) { next(e) }
}

export const getElectives = async (req, res, next) => {
  try {
    const groups = await ElectiveGroup.findAll()
    const subjects = await ElectiveSubject.findAll()
    res.json({ groups, subjects })
  } catch (e) { next(e) }
}

export const chooseElectives = async (req, res, next) => {
  try {
    // Admin flow handles persistence in batch_elective_choices; this endpoint can proxy if needed
    res.json({ ok: true })
  } catch (e) { next(e) }
}


