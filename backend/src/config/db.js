import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'timetable_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '7thgen',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
)


