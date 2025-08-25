/**
 * Header component for Rider34 admin panel
 * Location: web-admin/src/components/Header.jsx
 */

import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

const Header = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>Admin Panel</h1>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn btn-sm btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header