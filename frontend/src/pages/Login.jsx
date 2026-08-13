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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px'
    }}>
      <div className="card" style={{
        maxWidth: 420,
        width: '100%',
        borderTop: '2px solid var(--accent)',
        boxShadow: 'none'
      }}>
        <div style={{ marginBottom: '26px' }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            marginBottom: '6px'
          }}>
            Sign In
          </div>
          <h2 style={{ margin: 0, fontFamily: "'Source Serif 4', serif", fontSize: '24px', fontWeight: 600 }}>
            Welcome back
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '13.5px' }}>
            Enter your details to continue.
          </p>
        </div>

        {error && (
          <div className="message error" style={{ marginBottom: '16px' }}>
            <span>{error}</span>
          </div>
        )}

        <form className="form" onSubmit={onSubmit}>
          <FormInput label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormInput label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <FormInput
            label="Role"
            name="role"
            type="select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'Admin', label: 'Admin' },
              { value: 'Faculty', label: 'Faculty' },
              { value: 'Viewer', label: 'Student' }
            ]}
          />
          <button className="btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13.5px' }}>
            Don't have an account?{' '}
            <a href="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up</a>
          </p>
        </div>
      </div>
    </div>
  )
}
