import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FormInput from '../components/FormInput'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Admin')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = (e) => {
    e.preventDefault()
    // No validation: accept credentials and set auth directly
    const fakeUserId = Date.now()
    localStorage.setItem('auth', JSON.stringify({ user_id: fakeUserId, role, linked_faculty_id: null, linked_batch_id: null }))
    const to = location.state?.from?.pathname || `/${role.toLowerCase()}/dashboard`
    navigate(to)
  }

  return (
    <div className="content">
      <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
        <h2 style={{ marginTop: 0 }}>Sign in</h2>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Email" name="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <FormInput label="Password" name="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <FormInput label="Role" name="role" type="select" value={role} onChange={(e)=>setRole(e.target.value)} options={[{ value: 'Admin', label: 'Admin' }, { value: 'Faculty', label: 'Faculty' }, { value: 'Viewer', label: 'Student' }]} />
          <button className="btn" type="submit">Login</button>
        </form>
      </div>
    </div>
  )
}


