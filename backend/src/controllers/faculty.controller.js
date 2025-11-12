import { FacultyAvailability, TimetableEntry, Faculty } from '../models/index.js'
import { sequelize } from '../config/db.js'

// Helper function to reset AUTO_INCREMENT after deletion
async function resetAutoIncrement(model, pkName = null) {
  try {
    const pk = pkName || Object.keys(model.primaryKeys)[0]
    const tableName = model.getTableName()
    const [rows] = await sequelize.query(`SELECT COALESCE(MAX(\`${pk}\`), 0) + 1 AS next_id FROM \`${tableName}\``)
    const nextId = rows && rows[0] ? rows[0].next_id : 1
    await sequelize.query(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = ${Number(nextId)}`)
  } catch (error) {
    console.error(`Failed to reset AUTO_INCREMENT for ${model.getTableName()}:`, error.message)
  }
}

export const getTimetable = async (req, res, next) => {
  try { 
    res.json(await TimetableEntry.findAll({ where: { faculty_id: req.params.faculty_id } })) 
  } catch (e) { next(e) }
}

export const getTodayTimetable = async (req, res, next) => {
  try {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    res.json(await TimetableEntry.findAll({ 
      where: { 
        faculty_id: req.params.faculty_id,
        day_of_week: today
      } 
    })) 
  } catch (e) { next(e) }
}

export const getFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByPk(req.params.faculty_id)
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' })
    res.json(faculty)
  } catch (e) { next(e) }
}

export const getAvailability = async (req, res, next) => {
  try { 
    res.json(await FacultyAvailability.findAll({ where: { faculty_id: req.params.faculty_id } })) 
  } catch (e) { next(e) }
}

export const updateAvailability = async (req, res, next) => {
  try {
    const { faculty_id } = req.params
    await FacultyAvailability.destroy({ where: { faculty_id } })
    await resetAutoIncrement(FacultyAvailability)
    if (Array.isArray(req.body)) {
      await FacultyAvailability.bulkCreate(req.body.map(x => ({ ...x, faculty_id })))
    }
    res.json({ ok: true })
  } catch (e) { next(e) }
}


