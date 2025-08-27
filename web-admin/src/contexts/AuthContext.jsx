// /**
//  * Authentication context for Rider34 admin panel
//  * Location: web-admin/src/contexts/AuthContext.jsx
//  */

// import React, { createContext, useState, useContext, useEffect } from 'react'
// import api, { authAPI } from '../utils/api'

// const AuthContext = createContext({})

// export const useAuth = () => {
//   return useContext(AuthContext)
// }

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null)
//   const [token, setToken] = useState(localStorage.getItem('adminToken'))
//   const [isLoading, setIsLoading] = useState(true)

//   // Set up axios defaults
//   useEffect(() => {
//     if (token) {
//       // Fetch user data
//       fetchUserData()
//     } else {
//       setIsLoading(false)
//     }
//   }, [token])

//   const fetchUserData = async () => {
//     try {
//       const response = await authAPI.getProfile()
//       setUser(response.data)
//     } catch (error) {
//       console.error('Failed to fetch user data:', error)
//       logout()
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const login = async (username, password) => {
//     try {
//       // Try different login formats - your Django view might expect different fields
//       const loginAttempts = [
//         // Try email format first (common issue)
//         { email: username, password },
//         // Try username format
//         { username, password },
//         // Try with different field names
//         { email: username, password: password },
//         { username: username, password: password }
//       ]

//       let response = null
//       let lastError = null

//       // Try each login format until one works
//       for (const credentials of loginAttempts) {
//         try {
//           response = await authAPI.login(credentials)
//           break // Exit loop if successful
//         } catch (error) {
//           lastError = error
//           console.log(`Login attempt with ${JSON.stringify(credentials)} failed:`, error.response?.data)
//           continue // Try next format
//         }
//       }

//       if (!response) {
//         throw lastError || new Error('All login attempts failed')
//       }

//       // Debug: log the response to see actual structure
//       console.log('Login response structure:', response.data)

//       // Extract token from response - try different possible field names
//       const authToken = response.data.access || 
//                         response.data.access_token || 
//                         response.data.token ||
//                         response.data.jwt

//       if (!authToken) {
//         console.error('No token found in response:', response.data)
//         throw new Error('Authentication token not received from server')
//       }

//       // Store token
//       localStorage.setItem('adminToken', authToken)
//       setToken(authToken)
      
//       // Fetch user data
//       await fetchUserData()
      
//       return { success: true }
//     } catch (error) {
//       console.error('Login failed details:', {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status
//       })
      
//       return { 
//         success: false, 
//         error: error.response?.data || error.message || 'Login failed. Please check your credentials.' 
//       }
//     }
//   }

//   const logout = () => {
//     localStorage.removeItem('adminToken')
//     setToken(null)
//     setUser(null)
//   }

//   const value = {
//     user,
//     token,
//     isLoading,
//     login,
//     logout
//   }

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   )
// }
/**
 * Authentication context for Rider34 admin panel
 * Location: web-admin/src/contexts/AuthContext.jsx
 */

import React, { createContext, useState, useContext, useEffect } from 'react'
import api, { authAPI } from '../utils/api'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('adminToken'))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      // Fetch user data
      fetchUserData()
    } else {
      setIsLoading(false)
    }
  }, [token])

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getProfile()
      setUser(response.data)
      setError(null)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      setError(error.response?.data || 'Failed to fetch user data')
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      setError(null) // Clear previous errors
      
      // Your Django backend expects phone_number instead of username/email
      // Try different login formats based on the error we saw
      const loginAttempts = [
        // Try phone_number format (based on the error response)
        { phone_number: username, password },
        // Try email format 
        { email: username, password },
        // Try username format
        { username, password },
      ]

      let response = null
      let lastError = null

      // Try each login format until one works
      for (const credentials of loginAttempts) {
        try {
          response = await authAPI.login(credentials)
          console.log('Login successful with:', Object.keys(credentials)[0])
          break // Exit loop if successful
        } catch (error) {
          lastError = error
          console.log(`Login attempt with ${Object.keys(credentials)[0]} failed:`, error.response?.data)
          continue // Try next format
        }
      }

      if (!response) {
        throw lastError || new Error('All login attempts failed')
      }

      // Debug: log the response to see actual structure
      console.log('Login response structure:', response.data)

      // Extract token from response - try different possible field names
      const authToken = response.data.access || 
                        response.data.access_token || 
                        response.data.token ||
                        response.data.jwt

      if (!authToken) {
        console.error('No token found in response:', response.data)
        throw new Error('Authentication token not received from server')
      }

      // Store token
      localStorage.setItem('adminToken', authToken)
      setToken(authToken)
      
      // Fetch user data
      await fetchUserData()
      
      return { success: true }
    } catch (error) {
      console.error('Login failed details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      const errorMessage = error.response?.data || error.message || 'Login failed. Please check your credentials.'
      setError(errorMessage)
      
      return { 
        success: false, 
        error: errorMessage 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setUser(null)
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}