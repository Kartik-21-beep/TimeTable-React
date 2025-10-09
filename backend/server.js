import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { sequelize } from './src/config/db.js'
import authRoutes from './src/routes/auth.routes.js'
import adminRoutes from './src/routes/admin.routes.js'
import facultyRoutes from './src/routes/faculty.routes.js'
import studentRoutes from './src/routes/student.routes.js'
import timetableRoutes from './src/routes/timetable.routes.js'
import { errorHandler } from './src/middleware/error.js'
dotenv.config()

const app = express()
// Allow any localhost port in dev
app.use(cors({ origin: true, credentials: false }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/faculty', facultyRoutes)
app.use('/api/student', studentRoutes)
app.use('/api', timetableRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 5000
;(async () => {
  try {
    await sequelize.authenticate()
    console.log('DB connected')
    await sequelize.sync()
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  } catch (e) {
    console.error('Failed to start server', e)
    process.exit(1)
  }
})()


