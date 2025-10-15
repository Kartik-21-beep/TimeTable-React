import { Router } from 'express'
import { departments, programs, semesters, batches, subjects, faculty, classrooms, electiveGroups, timeSlots, academicTerms, electiveSubjects, batchElectiveChoices, departmentConstraints, facultyTeaching, listings } from '../controllers/admin.controller.js'
import { authRequired } from '../middleware/auth.js'

const r = Router()

function mount(base, c) {
  r.get(`/${base}`, c.list)
  r.post(`/${base}`, c.create)
  r.put(`/${base}/:id`, c.update)
  r.delete(`/${base}/:id`, c.remove)
}

mount('departments', departments)
mount('programs', programs)
mount('semesters', semesters)
mount('batches', batches)
mount('subjects', subjects)
mount('faculty', faculty)
mount('classrooms', classrooms)
mount('elective-groups', electiveGroups)
mount('timeslots', timeSlots)
mount('academic-terms', academicTerms)

r.get('/elective-subjects', electiveSubjects.list)
r.post('/elective-subjects', electiveSubjects.create)
r.delete('/elective-subjects/:id', electiveSubjects.remove)

r.get('/batch-electives', batchElectiveChoices.list)
r.post('/batch-electives', batchElectiveChoices.save)

// Faculty teaching report
r.get('/faculty-teaching', facultyTeaching.list)

// Department constraints (paths match frontend expectations)
r.get('/departmentconstraints', departmentConstraints.list)
r.post('/departmentconstraints', departmentConstraints.create)
r.put('/departmentconstraints/:id', departmentConstraints.update)
r.delete('/departmentconstraints/:id', departmentConstraints.remove)

// Generation helper listings
r.get('/list/subjects', listings.subjectsBySemester)
r.get('/list/active-faculty', listings.activeFaculty)

export default r


