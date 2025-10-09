import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

// Simple signup (no hashing per requirement)
router.post('/signup', async (req, res) => {
  const { email, password, role, linked_faculty_id, linked_batch_id } = req.body
  try {
    const result = await db.query(
      `INSERT INTO Users(email, password_hash, role, linked_faculty_id, linked_batch_id)
       VALUES(?, ?, ?, ?, ?)`,
      [email, password, role, linked_faculty_id || null, linked_batch_id || null]
    )
    const user = { user_id: result.insertId, role, linked_faculty_id: linked_faculty_id || null, linked_batch_id: linked_batch_id || null }
    res.json(user)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

// Simple signin (no validation beyond existence)
router.post('/signin', async (req, res) => {
  const { email, password, role } = req.body
  try {
    const rows = await db.query('SELECT user_id, role, linked_faculty_id, linked_batch_id FROM Users WHERE email = ? AND password_hash = ? AND role = ?', [email, password, role])
    if (rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' })
    const user = rows[0]
    res.json(user)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

export default router


