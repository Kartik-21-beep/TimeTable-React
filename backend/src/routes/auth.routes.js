import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { signup, login, profile } from '../controllers/auth.controller.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

// if everything is correct then send the request to the signup controller. 
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

// if everything is correct then login controller ko bhej do 
router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 4 })
], login)

// check if requestion is authenticated or not if it is then call the profile controller
router.get('/profile', authRequired, profile)

export default router


