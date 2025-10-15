import { Department, Program, Semester, Batch, Subject, Faculty, Classroom, ElectiveGroup, ElectiveSubject, BatchElectiveChoice, DepartmentConstraint, TimeSlot, TimetableEntry, AcademicTerm } from '../models/index.js'
import { sequelize } from '../config/db.js'

function crud(model) {
  return {
    list: async (req, res, next) => { try { res.json(await model.findAll()) } catch (e) { next(e) } },
    create: async (req, res, next) => { try { const r = await model.create(req.body); res.json(r) } catch (e) { next(e) } },
    update: async (req, res, next) => { try { await model.update(req.body, { where: Object.fromEntries([[Object.keys(model.primaryKeys)[0], req.params.id]]) }); res.json({ ok: true }) } catch (e) { next(e) } },
    remove: async (req, res, next) => {
      try {
        const pk = Object.keys(model.primaryKeys)[0]
        await model.destroy({ where: Object.fromEntries([[pk, req.params.id]]) })

        // For MySQL: reseed AUTO_INCREMENT to max(pk)+1 to avoid ever-increasing gaps
        const tableName = model.getTableName()
        const [rows] = await sequelize.query(`SELECT COALESCE(MAX(${pk}), 0) + 1 AS next_id FROM \`${tableName}\``)
        const nextId = rows && rows[0] ? rows[0].next_id : 1
        await sequelize.query(`ALTER TABLE \`${tableName}\` AUTO_INCREMENT = ${Number(nextId)}`)

        res.json({ ok: true })
      } catch (e) { next(e) }
    }
  }
}

export const departments = crud(Department)
export const programs = crud(Program)
export const semesters = crud(Semester)
export const batches = crud(Batch)
export const subjects = crud(Subject)
export const faculty = crud(Faculty)
export const classrooms = crud(Classroom)
export const electiveGroups = crud(ElectiveGroup)
export const timeSlots = crud(TimeSlot)
export const academicTerms = crud(AcademicTerm)

export const electiveSubjects = {
  list: async (req, res, next) => { try { res.json(await ElectiveSubject.findAll()) } catch (e) { next(e) } },
  create: async (req, res, next) => { try { const r = await ElectiveSubject.create(req.body); res.json(r) } catch (e) { next(e) } },
  remove: async (req, res, next) => { try { await ElectiveSubject.destroy({ where: { id: req.params.id } }); res.json({ ok: true }) } catch (e) { next(e) } }
}

export const batchElectiveChoices = {
  list: async (req, res, next) => { try { res.json(await BatchElectiveChoice.findAll()) } catch (e) { next(e) } },
  save: async (req, res, next) => {
    try {
      const { batch_id, elective_group_id, subject_ids, academic_year } = req.body
      await BatchElectiveChoice.destroy({ where: { batch_id, elective_group_id, academic_year } })
      if (Array.isArray(subject_ids)) {
        await BatchElectiveChoice.bulkCreate(subject_ids.map(sid => ({ batch_id, elective_group_id, subject_id: sid, academic_year })))
      }
      res.json({ ok: true })
    } catch (e) { next(e) }
  }
}

// Department Constraints CRUD
export const departmentConstraints = {
  list: async (req, res, next) => { try { res.json(await DepartmentConstraint.findAll()) } catch (e) { next(e) } },
  create: async (req, res, next) => { try { const r = await DepartmentConstraint.create(req.body); res.json(r) } catch (e) { next(e) } },
  update: async (req, res, next) => { try { await DepartmentConstraint.update(req.body, { where: { id: req.params.id } }); res.json({ ok: true }) } catch (e) { next(e) } },
  remove: async (req, res, next) => { try { await DepartmentConstraint.destroy({ where: { id: req.params.id } }); res.json({ ok: true }) } catch (e) { next(e) } }
}

// Faculty teaching report derived from timetable entries
export const facultyTeaching = {
  list: async (req, res, next) => {
    try {
      const { department_id, program_id, semester_id, academic_year } = req.query
      const where = {}
      if (academic_year) where.academic_year = academic_year

      const entries = await TimetableEntry.findAll({
        where,
        attributes: ['timetable_id'],
        include: [
          { model: Faculty, attributes: ['faculty_id','name','email','primary_department_id'] },
          { model: Subject, attributes: ['subject_id','subject_code','name'],
            include: [{ model: Semester, attributes: ['semester_id','semester_number'],
              include: [{ model: Program, attributes: ['program_id','name','department_id'] }]
            }]
          }
        ]
      })

      const resultMap = new Map()
      for (const e of entries) {
        const f = e.Faculty
        const s = e.Subject
        if (!f || !s) continue
        if (department_id && String(f.primary_department_id ?? '') !== String(department_id)) continue
        const progId = s.Semester?.Program?.program_id
        const semId = s.Semester?.semester_id
        if (program_id && String(progId ?? '') !== String(program_id)) continue
        if (semester_id && String(semId ?? '') !== String(semester_id)) continue

        const key = f.faculty_id
        if (!resultMap.has(key)) {
          resultMap.set(key, { faculty: { faculty_id: f.faculty_id, name: f.name, email: f.email }, subjects: new Map() })
        }
        const subj = { subject_id: s.subject_id, subject_code: s.subject_code, name: s.name }
        resultMap.get(key).subjects.set(subj.subject_id, subj)
      }

      const data = Array.from(resultMap.values()).map(v => ({
        faculty: v.faculty,
        subjects: Array.from(v.subjects.values())
      }))
      res.json(data)
    } catch (e) { next(e) }
  }
}

// Helper listings for generation UI
export const listings = {
  subjectsBySemester: async (req, res, next) => {
    try {
      const { semester_id } = req.query
      const where = {}
      if (semester_id) where.semester_id = semester_id
      const rows = await Subject.findAll({ where, attributes: ['subject_id','semester_id','subject_code','name','type','weekly_hours','is_elective'] })
      res.json(rows)
    } catch (e) { next(e) }
  },
  activeFaculty: async (req, res, next) => {
    try {
      const rows = await Faculty.findAll({ where: { is_active: true }, attributes: ['faculty_id','name','email','primary_department_id','max_load_per_week'] })
      res.json(rows)
    } catch (e) { next(e) }
  }
}


