import { Timetable, ElectiveGroup, ElectiveSubject } from '../models/index.js'

export const getTimetable = async (req, res, next) => {
  try { res.json(await Timetable.findAll({ where: { batch_id: req.params.batch_id } })) } catch (e) { next(e) }
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


