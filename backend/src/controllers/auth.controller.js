import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

export const signup = async (req, res, next) => {
  try {
    const { email, password, role, linked_faculty_id, linked_batch_id } = req.body
    // Prevent inconsistent linkage by role
    if (role === 'Admin' && (linked_faculty_id || linked_batch_id)) {
      return res.status(400).json({ message: 'Admin should not be linked to faculty or batch' })
    }
    if (role === 'Faculty' && !linked_faculty_id) {
      return res.status(400).json({ message: 'Faculty must be linked to a faculty record' })
    }
    if (role === 'Viewer' && !linked_batch_id) {
      return res.status(400).json({ message: 'Student must be linked to a batch' })
    }

    // Check duplicate email to avoid 500 from unique constraint
    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ 
      email, 
      password_hash: hash, 
      role, 
      linked_faculty_id: linked_faculty_id || null, 
      linked_batch_id: linked_batch_id || null 
    })
    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
    res.status(201).json({ token, user: { user_id: user.user_id, role: user.role, linked_faculty_id: user.linked_faculty_id, linked_batch_id: user.linked_batch_id } })
  } catch (e) { next(e) }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
    res.json({ token, user: { user_id: user.user_id, role: user.role, linked_faculty_id: user.linked_faculty_id, linked_batch_id: user.linked_batch_id } })
  } catch (e) { next(e) }
}

export const profile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['user_id','email','role','linked_faculty_id','linked_batch_id'] })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (e) { next(e) }
}


