import { Router } from 'express'
import { body } from 'express-validator'
import { signup, login, profile } from '../controllers/auth.controller.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

router.post('/signup', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 4 }),
  body('role').isIn(['admin','faculty','student'])
], signup)

router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 4 })
], login)

router.get('/profile', authRequired, profile)

export default router


