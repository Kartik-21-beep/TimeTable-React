import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, linked_faculty_id, linked_batch_id } = req.body
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hash, role, linked_faculty_id, linked_batch_id })
    res.json({ id: user.id, role: user.role, linked_faculty_id: user.linked_faculty_id, linked_batch_id: user.linked_batch_id })
  } catch (e) { next(e) }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, role: user.role, linked_faculty_id: user.linked_faculty_id, linked_batch_id: user.linked_batch_id } })
  } catch (e) { next(e) }
}

export const profile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id','name','email','role','linked_faculty_id','linked_batch_id'] })
    res.json(user)
  } catch (e) { next(e) }
}


