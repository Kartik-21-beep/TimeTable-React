import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import authRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'
import timetableRouter from './routes/timetable.js'
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
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api', timetableRouter)

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})


