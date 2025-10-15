import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FormInput from '../components/FormInput'
import { post } from '../api/apiClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Admin')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await post('/auth/login', { email, password })
      
      // Check if the user's role matches the selected role
      if (response.user.role !== role) {
        setError(`This account is registered as ${response.user.role}, not ${role}. Please select the correct role.`)
        setLoading(false)
        return
      }
      
      localStorage.setItem('auth', JSON.stringify(response.user))
      localStorage.setItem('token', response.token)
      const to = location.state?.from?.pathname || `/${response.user.role.toLowerCase()}/dashboard`
      navigate(to)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="content">
      <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
        <h2 style={{ marginTop: 0 }}>Log in</h2>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Email" name="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <FormInput label="Password" name="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <FormInput 
            label="Role" 
            name="role" 
            type="select" 
            value={role} 
            onChange={(e)=>setRole(e.target.value)} 
            options={[
              { value: 'Admin', label: 'Admin' }, 
              { value: 'Faculty', label: 'Faculty' }, 
              { value: 'Viewer', label: 'Student' }
            ]} 
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Don't have an account? <a href="/signup" style={{ color: '#3b82f6' }}>Sign up</a>
          </p>
        </div>
      </div>
    </div>
  )
}


