import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { signup, login, profile } from '../controllers/auth.controller.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

router.post('/signup', [
  body('email').isEmail(),
  body('password').isLength({ min: 4 }),
  body('role').isIn(['Admin','Faculty','Viewer'])
], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() })
  }
  next()
}, signup)

router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 4 })
], login)

router.get('/profile', authRequired, profile)

export default router


