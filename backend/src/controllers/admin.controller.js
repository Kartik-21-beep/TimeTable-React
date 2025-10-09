import { Department, Program, Semester, Batch, Subject, Faculty, Classroom, ElectiveGroup, ElectiveSubject, BatchElectiveChoice } from '../models/index.js'

function crud(model) {
  return {
    list: async (req, res, next) => { try { res.json(await model.findAll()) } catch (e) { next(e) } },
    create: async (req, res, next) => { try { const r = await model.create(req.body); res.json(r) } catch (e) { next(e) } },
    update: async (req, res, next) => { try { await model.update(req.body, { where: Object.fromEntries([[Object.keys(model.primaryKeys)[0], req.params.id]]) }); res.json({ ok: true }) } catch (e) { next(e) } },
    remove: async (req, res, next) => { try { await model.destroy({ where: Object.fromEntries([[Object.keys(model.primaryKeys)[0], req.params.id]]) }); res.json({ ok: true }) } catch (e) { next(e) } }
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


