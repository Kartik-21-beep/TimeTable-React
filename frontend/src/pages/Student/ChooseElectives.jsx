import { useEffect, useState } from 'react'
import { get, post } from '../../api/apiClient'
import FormInput from '../../components/FormInput'
import ElectiveSelector from '../../components/ElectiveSelector'

export default function ChooseElectives() {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}')
  const [groups, setGroups] = useState([])
  const [subjectsByGroup, setSubjectsByGroup] = useState({})
  const [groupId, setGroupId] = useState('')
  const [selected, setSelected] = useState([])
  const [maxChoices, setMaxChoices] = useState(1)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const grps = await get('/admin/elective-groups')
      setGroups(grps.map(g => ({ value: g.elective_group_id, label: g.name, max: g.max_choices_per_batch })))
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
    const g = groups.find(x => String(x.value) === String(groupId))
    setMaxChoices(g?.max || 1)
    setSelected([])
  }, [groupId, groups])

  const onSubmit = async (e) => {
    e.preventDefault(); setMessage('')
    await post('/admin/batch-electives', { batch_id: auth.linked_batch_id, elective_group_id: Number(groupId), subject_ids: selected })
    setMessage('Saved elective choices')
  }

  const groupOptions = subjectsByGroup[groupId] || []

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Choose Electives</h3>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      <form className="form" onSubmit={onSubmit}>
        <FormInput label="Elective Group" name="elective_group_id" type="select" value={groupId} onChange={(e)=>setGroupId(e.target.value)} options={groups} required />
        <ElectiveSelector options={groupOptions} selectedIds={selected} onChange={setSelected} maxChoices={maxChoices} />
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}


