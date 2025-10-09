import { FacultyAvailability, Timetable } from '../models/index.js'

export const getTimetable = async (req, res, next) => {
  try { res.json(await Timetable.findAll({ where: { faculty_id: req.params.faculty_id } })) } catch (e) { next(e) }
}

export const getAvailability = async (req, res, next) => {
  try { res.json(await FacultyAvailability.findAll({ where: { faculty_id: req.params.faculty_id } })) } catch (e) { next(e) }
}

export const updateAvailability = async (req, res, next) => {
  try {
    const { faculty_id } = req.params
    await FacultyAvailability.destroy({ where: { faculty_id } })
    if (Array.isArray(req.body)) await FacultyAvailability.bulkCreate(req.body.map(x => ({ ...x, faculty_id })))
    res.json({ ok: true })
  } catch (e) { next(e) }
}


