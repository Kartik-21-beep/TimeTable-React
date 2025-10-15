import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { sequelize } from './config/db.js'
import { Faculty, Batch } from './models/index.js'
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import facultyRoutes from './routes/faculty.routes.js'
import studentRoutes from './routes/student.routes.js'
import timetableRoutes from './routes/timetable.routes.js'
import { errorHandler } from './middleware/error.js'
dotenv.config()

const app = express()
app.use(cors({ origin: true, credentials: false }))
app.use(express.json())
app.use(morgan('dev'))
// Disable caching for all API responses to avoid 304s masking fresh data
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.set('Surrogate-Control', 'no-store')
  next()
})

app.get('/api/health', (req, res) => res.json({ ok: true }))

// Public routes for signup
app.get('/api/faculty', async (req, res) => {
  try {
    const faculty = await Faculty.findAll({ 
      where: { is_active: true },
      attributes: ['faculty_id', 'name', 'email']
    })
    res.json(faculty)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

app.get('/api/batches', async (req, res) => {
  try {
    const batches = await Batch.findAll({
      attributes: ['batch_id', 'name', 'intake_year']
    })
    res.json(batches)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/faculty', facultyRoutes)
app.use('/api/student', studentRoutes)
app.use('/api', timetableRoutes)

app.use(errorHandler)

const port = process.env.PORT || 5000
;(async () => {
  try {
    console.log('Starting server...')
    await sequelize.authenticate()
    console.log('DB connected')
    await sequelize.sync()
    console.log('DB synced')
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`)
    })
  } catch (e) {
    console.error('Failed to start server', e)
    process.exit(1)
  }
})()


