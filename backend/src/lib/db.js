import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '7thgen',
  database: process.env.DB_NAME || 'timetable_db',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
})

export const db = {
  query: async (sql, params) => {
    const [rows] = await pool.query(sql, params)
    return rows
  },
  getConnection: () => pool.getConnection()
}


