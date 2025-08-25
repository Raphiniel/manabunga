/**
 * Users component for Rider34 admin panel
 * Location: web-admin/src/components/Users.jsx
 */

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from './Sidebar'
import Header from './Header'
import './Users.css'

const Users = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [userTypeFilter, setUserTypeFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, userTypeFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/api/auth/users/')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by user type
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.user_type === userTypeFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone_number.toLowerCase().includes(term) ||
        user.first_name.toLowerCase().includes(term) ||
        user.last_name.toLowerCase().includes(term)
      )
    }

    setFilteredUsers(filtered)
  }

  const handleVerifyUser = async (userId) => {
    try {
      await axios.patch(`/api/auth/users/${userId}/verify/`)
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_verified: true } : user
      ))
    } catch (error) {
      console.error('Failed to verify user:', error)
      setError('Failed to verify user')
    }
  }

  const handleUserTypeChange = async (userId, newType) => {
    try {
      await axios.patch(`/api/auth/users/${userId}/`, {
        user_type: newType
      })
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, user_type: newType } : user
      ))
    } catch (error) {
      console.error('Failed to update user type:', error)
      setError('Failed to update user type')
    }
  }

  const getStatusBadge = (isVerified) => {
    return isVerified ? (
      <span className="status-badge status-completed">Verified</span>
    ) : (
      <span className="status-badge status-requested">Unverified</span>
    )
  }

  const getUserTypeBadge = (userType) => {
    const typeConfig = {
      passenger: { label: 'Passenger', color: '#3498db' },
      driver: { label: 'Driver', color: '#9b59b6' },
      admin: { label: 'Admin', color: '#e74c3c' }
    }
    
    const config = typeConfig[userType] || { label: userType, color: '#95a5a6' }
    
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        {config.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="app">
        <Sidebar />
        <Header />
        <div className="main-content">
          <div className="content-area" style={{ marginLeft: '250px', paddingTop: '70px' }}>
            <div className="loading-spinner-container">
              <div className="loading-spinner" style={{ borderColor: '#27AE60', borderTopColor: 'transparent' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar />
      <Header />
      
      <div className="main-content">
        <div className="content-area" style={{ marginLeft: '250px', paddingTop: '70px' }}>
          <div className="page-header">
            <h1 className="page-title">Users Management</h1>
            <p className="page-subtitle">Manage all users in the Rider34 platform</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {/* Filters */}
          <div className="card">
            <div className="card-body">
              <div className="filters-row">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control"
                  />
                </div>
                
                <div className="filter-group">
                  <label className="form-label">User Type:</label>
                  <select
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                    className="form-control"
                  >
                    <option value="all">All Users</option>
                    <option value="passenger">Passengers</option>
                    <option value="driver">Drivers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                
                <button className="btn btn-primary" onClick={fetchUsers}>
                  Refresh
                </button>
              </div>
            </div>
          </div>
          
          {/* Users Table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Users ({filteredUsers.length})</h2>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>#{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.first_name} {user.last_name}</td>
                          <td>{user.phone_number}</td>
                          <td>{user.email}</td>
                          <td>{getUserTypeBadge(user.user_type)}</td>
                          <td>{getStatusBadge(user.is_verified)}</td>
                          <td>
                            <div className="action-buttons">
                              {!user.is_verified && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleVerifyUser(user.id)}
                                >
                                  Verify
                                </button>
                              )}
                              
                              {user.user_type !== 'admin' && (
                                <select
                                  value={user.user_type}
                                  onChange={(e) => handleUserTypeChange(user.id, e.target.value)}
                                  className="form-control form-control-sm"
                                >
                                  <option value="passenger">Passenger</option>
                                  <option value="driver">Driver</option>
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Users