/**
 * Login component for Rider34 admin panel
 * Location: web-admin/src/components/Login.jsx
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom' // Add this import
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate() // Add this hook

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const result = await login(username, password)
      
      if (result.success) {
        // Redirect to dashboard on successful login
        navigate('/') // This will go to the protected route that renders Dashboard
      } else {
        setError(result.error)
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h1 className="login-title">Rider34 Admin</h1>
          <p className="login-subtitle">Sign in to your administrator account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Logging in...
              </>
            ) : 'Login'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>© 2023 Rider34. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Login