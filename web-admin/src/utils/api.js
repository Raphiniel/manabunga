// /**
//  * API utility functions for Rider34 admin panel
//  * Location: web-admin/src/utils/api.js
//  */

// import axios from 'axios'
// import Cookies from 'js-cookie'

// // API base URL
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// // Create axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// // Request interceptor to add auth token and CSRF
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('adminToken')
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
    
//     // Add CSRF token for Django
//     const csrfToken = Cookies.get('csrftoken')
//     if (csrfToken) {
//       config.headers['X-CSRFToken'] = csrfToken
//     }
    
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// // Response interceptor to handle auth errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('adminToken')
//       window.location.href = '/login'
//     }
    
//     // Enhanced error logging
//     if (error.response) {
//       console.error('API Error:', {
//         status: error.response.status,
//         data: error.response.data,
//         url: error.config?.url
//       })
//     }
    
//     return Promise.reject(error)
//   }
// )

// // Auth API functions
// export const authAPI = {
//   login: (credentials) => api.post('/api/auth/login/', credentials),
//   getProfile: () => api.get('/api/auth/profile/'),
//   getUsers: () => api.get('/api/auth/users/'),
//   verifyUser: (userId) => api.patch(`/api/auth/users/${userId}/verify/`),
//   approveDriver: (driverId) => api.patch(`/api/auth/drivers/${driverId}/approve/`),
// }

// // Rides API functions
// export const ridesAPI = {
//   getRides: () => api.get('/api/rides/all/'),
//   getRide: (rideId) => api.get(`/api/rides/${rideId}/`),
//   updateRideStatus: (rideId, status) => api.patch(`/api/rides/update-status/${rideId}/`, { status }),
// }

// // Payments API functions
// export const paymentsAPI = {
//   getPayments: () => api.get('/api/payments/all/'),
//   getPayment: (paymentId) => api.get(`/api/payments/${paymentId}/`),
//   updatePaymentStatus: (paymentId, status) => api.patch(`/api/payments/${paymentId}/status/`, { status }),
// }

// // Notifications API functions
// export const notificationsAPI = {
//   getUserNotifications: () => api.get('/api/notifications/user-notifications/'),
//   markAsRead: (notificationId) => api.patch(`/api/notifications/${notificationId}/read/`),
//   markAllAsRead: () => api.patch('/api/notifications/read-all/'),
//   deleteNotification: (notificationId) => api.delete(`/api/notifications/${notificationId}/delete/`),
//   sendNotification: (data) => api.post('/api/notifications/send/', data),
// }

// export default api
/**
 * API utility functions for Rider34 admin panel
 * Location: web-admin/src/utils/api.js
 */

import axios from 'axios'
import Cookies from 'js-cookie'

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and CSRF
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add CSRF token for Django
    const csrfToken = Cookies.get('csrftoken')
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors and normalize responses
api.interceptors.response.use(
  (response) => {
    // Normalize response data structure
    if (response.data && typeof response.data === 'object') {
      // For paginated responses, extract the results array
      if (Array.isArray(response.data.results)) {
        response.data = response.data.results;
      } 
      // For other common wrapper patterns
      else if (Array.isArray(response.data.data)) {
        response.data = response.data.data;
      }
      else if (Array.isArray(response.data.users)) {
        response.data = response.data.users;
      }
      else if (Array.isArray(response.data.rides)) {
        response.data = response.data.rides;
      }
      else if (Array.isArray(response.data.payments)) {
        response.data = response.data.payments;
      }
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
    }
    
    // Enhanced error logging
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      })
    }
    
    return Promise.reject(error)
  }
)

// Auth API functions
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login/', credentials),
  getProfile: () => api.get('/api/auth/profile/'),
  getUsers: () => api.get('/api/auth/users/'),
  verifyUser: (userId) => api.patch(`/api/auth/users/${userId}/verify/`),
  approveDriver: (driverId) => api.patch(`/api/auth/drivers/${driverId}/approve/`),
}

// Rides API functions
export const ridesAPI = {
  getRides: () => api.get('/api/rides/all/'),
  getRide: (rideId) => api.get(`/api/rides/${rideId}/`),
  updateRideStatus: (rideId, status) => api.patch(`/api/rides/update-status/${rideId}/`, { status }),
}

// Payments API functions
export const paymentsAPI = {
  getPayments: () => api.get('/api/payments/all/'),
  getPayment: (paymentId) => api.get(`/api/payments/${paymentId}/`),
  updatePaymentStatus: (paymentId, status) => api.patch(`/api/payments/${paymentId}/status/`, { status }),
}

// Notifications API functions
export const notificationsAPI = {
  getUserNotifications: () => api.get('/api/notifications/user-notifications/'),
  markAsRead: (notificationId) => api.patch(`/api/notifications/${notificationId}/read/`),
  markAllAsRead: () => api.patch('/api/notifications/read-all/'),
  deleteNotification: (notificationId) => api.delete(`/api/notifications/${notificationId}/delete/`),
  sendNotification: (data) => api.post('/api/notifications/send/', data),
}

export default api