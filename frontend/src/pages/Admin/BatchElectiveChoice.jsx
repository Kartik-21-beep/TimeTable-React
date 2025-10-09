import { useEffect, useState } from 'react'
import { get, post } from '../../api/apiClient'
import FormInput from '../../components/FormInput'
import ElectiveSelector from '../../components/ElectiveSelector'

export default function BatchElectiveChoice() {
  const [batches, setBatches] = useState([])
  const [groups, setGroups] = useState([])
  const [subjectsByGroup, setSubjectsByGroup] = useState({})
  const [form, setForm] = useState({ batch_id: '', elective_group_id: '' })
  const [selected, setSelected] = useState([])
  const [maxChoices, setMaxChoices] = useState(1)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const [bats, grps] = await Promise.all([get('/admin/batches'), get('/admin/elective-groups')])
      setBatches(bats.map(b => ({ value: b.batch_id, label: b.name })))
      setGroups(grps.map(g => ({ value: g.elective_group_id, label: g.name, max: g.max_choices_per_batch })))
      // preload subjects per group
      const subs = await get('/admin/elective-subjects')
      const byGroup = {}
      subs.forEach(s => {
        if (!byGroup[s.elective_group_id]) byGroup[s.elective_group_id] = []
        byGroup[s.elective_group_id].push({ value: s.subject_id, label: String(s.subject_id) })
      })
      setSubjectsByGroup(byGroup)
    }
    load()
  }, [])

  useEffect(() => {
    const g = groups.find(x => String(x.value) === String(form.elective_group_id))
    setMaxChoices(g?.max || 1)
    setSelected([])
  }, [form.elective_group_id, groups])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    await post('/admin/batch-electives', {
      batch_id: Number(form.batch_id),
      elective_group_id: Number(form.elective_group_id),
      subject_ids: selected
    })
    setMessage('Saved elective choices for batch')
  }

  const groupOptions = subjectsByGroup[form.elective_group_id] || []

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Assign Electives to Batch</h3>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      <form className="form" onSubmit={onSubmit}>
        <FormInput label="Batch" name="batch_id" type="select" value={form.batch_id} onChange={onChange} options={batches} required />
        <FormInput label="Elective Group" name="elective_group_id" type="select" value={form.elective_group_id} onChange={onChange} options={groups} required />
        <ElectiveSelector options={groupOptions} selectedIds={selected} onChange={setSelected} maxChoices={maxChoices} />
        <button className="btn" type="submit">Save Choices</button>
      </form>
    </div>
  )
}


