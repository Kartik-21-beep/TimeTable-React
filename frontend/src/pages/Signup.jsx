import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import { post, get } from '../api/apiClient'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Viewer')
  const [linkedFacultyId, setLinkedFacultyId] = useState('')
  const [linkedBatchId, setLinkedBatchId] = useState('')
  const [facultyOptions, setFacultyOptions] = useState([])
  const [batchOptions, setBatchOptions] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    try {
      const [facultyData, batchData] = await Promise.all([
        get('/faculty').catch(() => []),
        get('/batches').catch(() => [])
      ])
      setFacultyOptions(facultyData)
      setBatchOptions(batchData)
    } catch (e) {
      console.error('Failed to load options:', e)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await post('/auth/signup', {
        email,
        password,
        role,
        linked_faculty_id: role === 'Faculty' ? (linkedFacultyId ? Number(linkedFacultyId) : null) : null,
        linked_batch_id: role === 'Viewer' ? (linkedBatchId ? Number(linkedBatchId) : null) : null
      })
      localStorage.setItem('auth', JSON.stringify(response.user))
      localStorage.setItem('token', response.token)
      navigate(`/${response.user.role.toLowerCase()}/dashboard`)
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
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
            <FormInput 
              label="Link to Faculty" 
              name="linked_faculty_id" 
              type="select"
              value={linkedFacultyId} 
              onChange={(e)=>setLinkedFacultyId(e.target.value)} 
              options={facultyOptions.map(f => ({ value: f.faculty_id, label: `${f.name} (${f.email || 'No email'})` }))}
              placeholder="Select Faculty"
            />
          )}
          {role === 'Viewer' && (
            <FormInput 
              label="Link to Batch" 
              name="linked_batch_id" 
              type="select"
              value={linkedBatchId} 
              onChange={(e)=>setLinkedBatchId(e.target.value)} 
              options={batchOptions.map(b => ({ value: b.batch_id, label: `${b.name} (${b.intake_year})` }))}
              placeholder="Select Batch"
            />
          )}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}