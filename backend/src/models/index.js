import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Department = sequelize.define('departments', {
  department_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(10), unique: true, allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false }
}, { timestamps: false })

export const Program = sequelize.define('programs', {
  program_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  duration_years: { type: DataTypes.INTEGER, allowNull: false },
  department_id: { type: DataTypes.INTEGER }
}, { timestamps: false })

export const Semester = sequelize.define('semesters', {
  semester_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  program_id: { type: DataTypes.INTEGER },
  number: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('odd','even'), allowNull: false }
}, { timestamps: false })

export const Batch = sequelize.define('batches', {
  batch_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  program_id: { type: DataTypes.INTEGER },
  start_year: { type: DataTypes.INTEGER, allowNull: false },
  current_semester_id: { type: DataTypes.INTEGER }
}, { timestamps: false })

export const Faculty = sequelize.define('faculty', {
  faculty_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  department_id: { type: DataTypes.INTEGER },
  email: { type: DataTypes.STRING(100), unique: true },
  phone: { type: DataTypes.STRING(15) },
  designation: { type: DataTypes.STRING(50) }
}, { timestamps: false })

export const FacultyAvailability = sequelize.define('faculty_availability', {
  availability_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  faculty_id: { type: DataTypes.INTEGER },
  day: { type: DataTypes.ENUM('Mon','Tue','Wed','Thu','Fri') },
  start_time: { type: DataTypes.TIME },
  end_time: { type: DataTypes.TIME },
  available: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: false })

export const Subject = sequelize.define('subjects', {
  subject_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(10), unique: true, allowNull: false },
  name: { type: DataTypes.STRING(100), allowNull: false },
  department_id: { type: DataTypes.INTEGER },
  semester_id: { type: DataTypes.INTEGER },
  type: { type: DataTypes.ENUM('lecture','tutorial','practical','studio'), defaultValue: 'lecture' },
  credits: { type: DataTypes.INTEGER, defaultValue: 3 },
  weekly_hours: { type: DataTypes.INTEGER, defaultValue: 3 }
}, { timestamps: false })

export const ElectiveGroup = sequelize.define('elective_groups', {
  elective_group_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  department_id: { type: DataTypes.INTEGER },
  semester_id: { type: DataTypes.INTEGER },
  max_choices_per_batch: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { timestamps: false })

export const ElectiveSubject = sequelize.define('elective_subjects', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  elective_group_id: { type: DataTypes.INTEGER },
  subject_id: { type: DataTypes.INTEGER }
}, { timestamps: false })

export const BatchElectiveChoice = sequelize.define('batch_elective_choices', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  batch_id: { type: DataTypes.INTEGER },
  elective_group_id: { type: DataTypes.INTEGER },
  subject_id: { type: DataTypes.INTEGER },
  academic_year: { type: DataTypes.STRING(9) }
}, { timestamps: false })

export const Classroom = sequelize.define('classrooms', {
  classroom_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  room_number: { type: DataTypes.STRING(10) },
  capacity: { type: DataTypes.INTEGER },
  type: { type: DataTypes.ENUM('lecture','lab','studio'), defaultValue: 'lecture' }
}, { timestamps: false })

export const Timetable = sequelize.define('timetable', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  department_id: { type: DataTypes.INTEGER },
  program_id: { type: DataTypes.INTEGER },
  batch_id: { type: DataTypes.INTEGER },
  semester_id: { type: DataTypes.INTEGER },
  subject_id: { type: DataTypes.INTEGER },
  faculty_id: { type: DataTypes.INTEGER },
  classroom_id: { type: DataTypes.INTEGER },
  day: { type: DataTypes.ENUM('Mon','Tue','Wed','Thu','Fri') },
  start_time: { type: DataTypes.TIME },
  end_time: { type: DataTypes.TIME },
  academic_year: { type: DataTypes.STRING(9) }
}, { timestamps: false })

export const GenerationLog = sequelize.define('generation_logs', {
  log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  department_id: { type: DataTypes.INTEGER },
  program_id: { type: DataTypes.INTEGER },
  batch_id: { type: DataTypes.INTEGER },
  academic_year: { type: DataTypes.STRING(9) },
  status: { type: DataTypes.ENUM('success','conflict','failed'), defaultValue: 'success' },
  message: { type: DataTypes.TEXT }
}, { timestamps: true, createdAt: 'generated_at', updatedAt: false })

export const User = sequelize.define('users', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('admin','faculty','student'), allowNull: false },
  linked_faculty_id: { type: DataTypes.INTEGER },
  linked_batch_id: { type: DataTypes.INTEGER }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false })


