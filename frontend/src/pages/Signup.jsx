import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Viewer')
  const [linkedFacultyId, setLinkedFacultyId] = useState('')
  const [linkedBatchId, setLinkedBatchId] = useState('')
  const [facultyOptions, setFacultyOptions] = useState([])
  const [batchOptions, setBatchOptions] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // No backend fetch; provide empty or demo options to keep UI simple
    setFacultyOptions([])
    setBatchOptions([])
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    // Direct signup without validation or API: accept inputs and store
    const fakeUserId = Date.now()
    const linked_faculty_id = role === 'Faculty' ? (linkedFacultyId ? Number(linkedFacultyId) : null) : null
    const linked_batch_id = role === 'Viewer' ? (linkedBatchId ? Number(linkedBatchId) : null) : null
    localStorage.setItem('auth', JSON.stringify({ user_id: fakeUserId, role, linked_faculty_id, linked_batch_id }))
    navigate(`/${role.toLowerCase()}/dashboard`)
  }

  return (
    <div className="content">
      <div className="card" style={{ maxWidth: 480, margin: '40px auto' }}>
        <h2 style={{ marginTop: 0 }}>Sign up</h2>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Email" name="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <FormInput label="Password" name="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <FormInput label="Role" name="role" type="select" value={role} onChange={(e)=>setRole(e.target.value)} options={[{ value: 'Admin', label: 'Admin' }, { value: 'Faculty', label: 'Faculty' }, { value: 'Viewer', label: 'Student' }]} />
          {role === 'Faculty' && (
            <FormInput label="Link to Faculty (optional)" name="linked_faculty_id" value={linkedFacultyId} onChange={(e)=>setLinkedFacultyId(e.target.value)} placeholder="Enter Faculty ID (optional)" />
          )}
          {role === 'Viewer' && (
            <FormInput label="Link to Batch (optional)" name="linked_batch_id" value={linkedBatchId} onChange={(e)=>setLinkedBatchId(e.target.value)} placeholder="Enter Batch ID (optional)" />
          )}
          <button className="btn" type="submit">Create account</button>
        </form>
      </div>
    </div>
  )
}


