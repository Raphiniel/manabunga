/**
 * Authentication context for Rider34 admin panel
 * Location: web-admin/src/contexts/AuthContext.jsx
 */

import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('adminToken'))
  const [isLoading, setIsLoading] = useState(true)

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Fetch user data
      fetchUserData()
    } else {
      setIsLoading(false)
    }
  }, [token])

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/auth/profile/')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login/', {
        username,
        password
      })
      
      const { access } = response.data
      
      // Store token
      localStorage.setItem('adminToken', access)
      setToken(access)
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      // Fetch user data
      await fetchUserData()
      
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}