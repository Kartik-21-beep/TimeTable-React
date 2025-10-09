import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

// Helper generic CRUD creators
function createCrud(table, idField) {
  router.get(`/${table.toLowerCase()}`, async (req, res) => {
    try { res.json(await db.query(`SELECT * FROM ${table}`)) } catch (e) { res.status(400).json({ message: e.message }) }
  })
  router.post(`/${table.toLowerCase()}`, async (req, res) => {
    try {
      const fields = Object.keys(req.body)
      const placeholders = fields.map(()=>'?').join(',')
      const sql = `INSERT INTO ${table}(${fields.join(',')}) VALUES(${placeholders})`
      const result = await db.query(sql, fields.map(f => req.body[f]))
      res.json({ insertId: result.insertId })
    } catch (e) { res.status(400).json({ message: e.message }) }
  })
  router.put(`/${table.toLowerCase()}/:${idField}`, async (req, res) => {
    try {
      const fields = Object.keys(req.body)
      const sets = fields.map(f => `${f} = ?`).join(',')
      const sql = `UPDATE ${table} SET ${sets} WHERE ${idField} = ?`
      await db.query(sql, [...fields.map(f => req.body[f]), req.params[idField]])
      res.json({ ok: true })
    } catch (e) { res.status(400).json({ message: e.message }) }
  })
  router.delete(`/${table.toLowerCase()}/:${idField}`, async (req, res) => {
    try { await db.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [req.params[idField]]); res.json({ ok: true }) } catch (e) { res.status(400).json({ message: e.message }) }
  })
}

createCrud('Departments', 'department_id')
createCrud('Programs', 'program_id')
createCrud('Batches', 'batch_id')
createCrud('Semesters', 'semester_id')
createCrud('Subjects', 'subject_id')
createCrud('Faculty', 'faculty_id')
createCrud('Classrooms', 'room_id')
createCrud('ElectiveGroups', 'elective_group_id')

// ElectiveSubjects mapping
router.get('/elective-subjects', async (req, res) => {
  try { res.json(await db.query('SELECT * FROM ElectiveSubjects')) } catch (e) { res.status(400).json({ message: e.message }) }
})
router.post('/elective-subjects', async (req, res) => {
  const { elective_group_id, subject_id } = req.body
  try { const r = await db.query('INSERT INTO ElectiveSubjects(elective_group_id, subject_id) VALUES(?, ?)', [elective_group_id, subject_id]); res.json({ insertId: r.insertId }) } catch (e) { res.status(400).json({ message: e.message }) }
})
router.delete('/elective-subjects/:id', async (req, res) => {
  try { await db.query('DELETE FROM ElectiveSubjects WHERE id = ?', [req.params.id]); res.json({ ok: true }) } catch (e) { res.status(400).json({ message: e.message }) }
})

// Batch elective choices
router.get('/batch-electives', async (req, res) => {
  try { res.json(await db.query('SELECT * FROM BatchElectiveChoices')) } catch (e) { res.status(400).json({ message: e.message }) }
})
router.post('/batch-electives', async (req, res) => {
  const { batch_id, elective_group_id, subject_ids, academic_year } = req.body
  try {
    const conn = await db.getConnection()
    try {
      await conn.beginTransaction()
      // clear previous
      await conn.query('DELETE FROM BatchElectiveChoices WHERE batch_id = ? AND elective_group_id = ? AND academic_year = ?', [batch_id, elective_group_id, academic_year || '2025-26'])
      for (const sid of subject_ids || []) {
        await conn.query('INSERT INTO BatchElectiveChoices(batch_id, elective_group_id, subject_id, academic_year) VALUES (?, ?, ?, ?)', [batch_id, elective_group_id, sid, academic_year || '2025-26'])
      }
      await conn.commit()
      res.json({ ok: true })
    } catch (e) { await conn.rollback(); throw e }
    finally { conn.release() }
  } catch (e) { res.status(400).json({ message: e.message }) }
})

export default router


