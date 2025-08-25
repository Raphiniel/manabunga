/**
 * Sidebar component for Rider34 admin panel
 * Location: web-admin/src/components/Sidebar.jsx
 */

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/rides', label: 'Rides', icon: '🚗' },
    { path: '/payments', label: 'Payments', icon: '💰' },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Rider34 Admin</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar