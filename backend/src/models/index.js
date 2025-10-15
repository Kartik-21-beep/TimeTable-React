import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

// 1. Departments
export const Department = sequelize.define('Departments', {
  department_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(10), unique: true, allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false }
}, { timestamps: false })

// 2. Programs
export const Program = sequelize.define('Programs', {
  program_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  code: { type: DataTypes.STRING(20), allowNull: false },
  name: { type: DataTypes.STRING(150), allowNull: false },
  duration_years: { type: DataTypes.INTEGER, allowNull: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: false })

// 3. Batches
export const Batch = sequelize.define('Batches', {
  batch_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  program_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(50), allowNull: false },
  intake_year: { type: DataTypes.INTEGER, allowNull: false }
}, { timestamps: false })

// 4. Semesters
export const Semester = sequelize.define('Semesters', {
  semester_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  program_id: { type: DataTypes.INTEGER, allowNull: false },
  semester_number: { type: DataTypes.INTEGER, allowNull: false },
  is_final: { type: DataTypes.BOOLEAN, defaultValue: false },
  generate_timetable: { type: DataTypes.BOOLEAN, defaultValue: true },
  // Computed in DB as a generated column; allow null here to avoid Sequelize notNull validation
  semester_type: { type: DataTypes.ENUM('Odd','Even'), allowNull: true }
}, { timestamps: false })

// 5. Academic Terms
export const AcademicTerm = sequelize.define('AcademicTerms', {
  term_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  academic_year: { type: DataTypes.STRING(9), allowNull: false },
  term_type: { type: DataTypes.ENUM('Odd','Even'), allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: false })

// 6. Subjects
export const Subject = sequelize.define('Subjects', {
  subject_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  semester_id: { type: DataTypes.INTEGER, allowNull: false },
  subject_code: { type: DataTypes.STRING(20), allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  type: { type: DataTypes.ENUM('Lecture','Tutorial','Practical','Studio'), allowNull: false },
  weekly_hours: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_elective: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: false })

// 7. Elective Groups
export const ElectiveGroup = sequelize.define('ElectiveGroups', {
  elective_group_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  department_id: { type: DataTypes.INTEGER },
  semester_id: { type: DataTypes.INTEGER },
  max_choices_per_batch: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { timestamps: false })

// 8. Elective Subjects
export const ElectiveSubject = sequelize.define('ElectiveSubjects', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  elective_group_id: { type: DataTypes.INTEGER, allowNull: false },
  subject_id: { type: DataTypes.INTEGER, allowNull: false }
}, { timestamps: false })

// 9. Batch Elective Choices
export const BatchElectiveChoice = sequelize.define('BatchElectiveChoices', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  batch_id: { type: DataTypes.INTEGER, allowNull: false },
  elective_group_id: { type: DataTypes.INTEGER, allowNull: false },
  subject_id: { type: DataTypes.INTEGER, allowNull: false },
  academic_year: { type: DataTypes.STRING(9), allowNull: false }
}, { timestamps: false })

// 10. Faculty
export const Faculty = sequelize.define('Faculty', {
  faculty_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150), unique: true },
  primary_department_id: { type: DataTypes.INTEGER },
  max_load_per_week: { type: DataTypes.INTEGER, defaultValue: 12 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'Faculty', timestamps: false })

// 11. Faculty Departments
export const FacultyDepartment = sequelize.define('FacultyDepartments', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  faculty_id: { type: DataTypes.INTEGER, allowNull: false },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.STRING(100) }
}, { tableName: 'FacultyDepartments', timestamps: false })

// 12. Faculty Availability
export const FacultyAvailability = sequelize.define('FacultyAvailability', {
  availability_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  faculty_id: { type: DataTypes.INTEGER, allowNull: false },
  day_of_week: { type: DataTypes.ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), allowNull: false },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  is_recurring: { type: DataTypes.BOOLEAN, defaultValue: true },
  note: { type: DataTypes.STRING(255) }
}, { tableName: 'FacultyAvailability', timestamps: false })

// 13. Classrooms
export const Classroom = sequelize.define('Classrooms', {
  room_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  code: { type: DataTypes.STRING(50) },
  type: { type: DataTypes.ENUM('Classroom','Lab','Studio'), allowNull: false },
  capacity: { type: DataTypes.INTEGER, defaultValue: 0 },
  department_id: { type: DataTypes.INTEGER }
}, { tableName: 'Classrooms', timestamps: false })

// 14. Department Constraints
export const DepartmentConstraint = sequelize.define('DepartmentConstraints', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  working_start: { type: DataTypes.TIME, defaultValue: '09:00:00' },
  working_end: { type: DataTypes.TIME, defaultValue: '17:30:00' },
  lunch_start: { type: DataTypes.TIME, defaultValue: '13:00:00' },
  lunch_end: { type: DataTypes.TIME, defaultValue: '14:30:00' },
  max_classes_per_day: { type: DataTypes.INTEGER, defaultValue: 6 },
  slot_duration_minutes: { type: DataTypes.INTEGER, defaultValue: 60 },
  no_weekends: { type: DataTypes.BOOLEAN, defaultValue: true },
  extra_rules: { type: DataTypes.JSON }
}, { tableName: 'DepartmentConstraints', timestamps: false })

// 15. Time Slots
export const TimeSlot = sequelize.define('TimeSlots', {
  timeslot_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  label: { type: DataTypes.STRING(50) }
}, { tableName: 'TimeSlots', timestamps: false })

// 16. Timetable Entries
export const TimetableEntry = sequelize.define('TimetableEntries', {
  timetable_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  academic_year: { type: DataTypes.STRING(9), allowNull: false },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  program_id: { type: DataTypes.INTEGER, allowNull: false },
  batch_id: { type: DataTypes.INTEGER, allowNull: false },
  semester_id: { type: DataTypes.INTEGER, allowNull: false },
  subject_id: { type: DataTypes.INTEGER, allowNull: false },
  faculty_id: { type: DataTypes.INTEGER, allowNull: false },
  room_id: { type: DataTypes.INTEGER, allowNull: false },
  day_of_week: { type: DataTypes.ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), allowNull: false },
  timeslot_id: { type: DataTypes.INTEGER, allowNull: false },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  status: { type: DataTypes.ENUM('Scheduled','Cancelled','Rescheduled'), defaultValue: 'Scheduled' },
  created_by: { type: DataTypes.INTEGER },
  note: { type: DataTypes.STRING(255) }
}, { tableName: 'TimetableEntries', timestamps: true, createdAt: 'created_at', updatedAt: false })

// 17. Users
export const User = sequelize.define('Users', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(150), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('Admin','Faculty','Viewer'), allowNull: false },
  linked_faculty_id: { type: DataTypes.INTEGER },
  linked_batch_id: { type: DataTypes.INTEGER }
}, { timestamps: true, createdAt: 'created_at', updatedAt: false })

// 18. Generation Logs
export const GenerationLog = sequelize.define('GenerationLogs', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  academic_year: { type: DataTypes.STRING(9), allowNull: false },
  started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  finished_at: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('In Progress','Success','Partial','Failed'), defaultValue: 'In Progress' },
  details: { type: DataTypes.TEXT },
  requested_by: { type: DataTypes.INTEGER }
}, { timestamps: false })

// Define associations
Department.hasMany(Program, { foreignKey: 'department_id' })
Program.belongsTo(Department, { foreignKey: 'department_id' })

Program.hasMany(Batch, { foreignKey: 'program_id' })
Batch.belongsTo(Program, { foreignKey: 'program_id' })

Program.hasMany(Semester, { foreignKey: 'program_id' })
Semester.belongsTo(Program, { foreignKey: 'program_id' })

Semester.hasMany(Subject, { foreignKey: 'semester_id' })
Subject.belongsTo(Semester, { foreignKey: 'semester_id' })

Department.hasMany(ElectiveGroup, { foreignKey: 'department_id' })
ElectiveGroup.belongsTo(Department, { foreignKey: 'department_id' })

Semester.hasMany(ElectiveGroup, { foreignKey: 'semester_id' })
ElectiveGroup.belongsTo(Semester, { foreignKey: 'semester_id' })

ElectiveGroup.hasMany(ElectiveSubject, { foreignKey: 'elective_group_id' })
ElectiveSubject.belongsTo(ElectiveGroup, { foreignKey: 'elective_group_id' })

Subject.hasMany(ElectiveSubject, { foreignKey: 'subject_id' })
ElectiveSubject.belongsTo(Subject, { foreignKey: 'subject_id' })

Batch.hasMany(BatchElectiveChoice, { foreignKey: 'batch_id' })
BatchElectiveChoice.belongsTo(Batch, { foreignKey: 'batch_id' })

ElectiveGroup.hasMany(BatchElectiveChoice, { foreignKey: 'elective_group_id' })
BatchElectiveChoice.belongsTo(ElectiveGroup, { foreignKey: 'elective_group_id' })

Subject.hasMany(BatchElectiveChoice, { foreignKey: 'subject_id' })
BatchElectiveChoice.belongsTo(Subject, { foreignKey: 'subject_id' })

Department.hasMany(Faculty, { foreignKey: 'primary_department_id' })
Faculty.belongsTo(Department, { foreignKey: 'primary_department_id' })

Faculty.hasMany(FacultyDepartment, { foreignKey: 'faculty_id' })
FacultyDepartment.belongsTo(Faculty, { foreignKey: 'faculty_id' })

Department.hasMany(FacultyDepartment, { foreignKey: 'department_id' })
FacultyDepartment.belongsTo(Department, { foreignKey: 'department_id' })

Faculty.hasMany(FacultyAvailability, { foreignKey: 'faculty_id' })
FacultyAvailability.belongsTo(Faculty, { foreignKey: 'faculty_id' })

Department.hasMany(Classroom, { foreignKey: 'department_id' })
Classroom.belongsTo(Department, { foreignKey: 'department_id' })

Department.hasOne(DepartmentConstraint, { foreignKey: 'department_id' })
DepartmentConstraint.belongsTo(Department, { foreignKey: 'department_id' })

Faculty.hasMany(TimetableEntry, { foreignKey: 'faculty_id' })
TimetableEntry.belongsTo(Faculty, { foreignKey: 'faculty_id' })

Classroom.hasMany(TimetableEntry, { foreignKey: 'room_id' })
TimetableEntry.belongsTo(Classroom, { foreignKey: 'room_id' })

TimeSlot.hasMany(TimetableEntry, { foreignKey: 'timeslot_id' })
TimetableEntry.belongsTo(TimeSlot, { foreignKey: 'timeslot_id' })

Subject.hasMany(TimetableEntry, { foreignKey: 'subject_id' })
TimetableEntry.belongsTo(Subject, { foreignKey: 'subject_id' })

Department.hasMany(TimetableEntry, { foreignKey: 'department_id' })
TimetableEntry.belongsTo(Department, { foreignKey: 'department_id' })

Program.hasMany(TimetableEntry, { foreignKey: 'program_id' })
TimetableEntry.belongsTo(Program, { foreignKey: 'program_id' })

Batch.hasMany(TimetableEntry, { foreignKey: 'batch_id' })
TimetableEntry.belongsTo(Batch, { foreignKey: 'batch_id' })

Semester.hasMany(TimetableEntry, { foreignKey: 'semester_id' })
TimetableEntry.belongsTo(Semester, { foreignKey: 'semester_id' })

Faculty.hasOne(User, { foreignKey: 'linked_faculty_id' })
User.belongsTo(Faculty, { foreignKey: 'linked_faculty_id' })

Batch.hasOne(User, { foreignKey: 'linked_batch_id' })
User.belongsTo(Batch, { foreignKey: 'linked_batch_id' })

Department.hasMany(GenerationLog, { foreignKey: 'department_id' })
GenerationLog.belongsTo(Department, { foreignKey: 'department_id' })


