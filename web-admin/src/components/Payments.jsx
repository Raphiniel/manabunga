/**
 * Payments component for Rider34 admin panel
 * Location: web-admin/src/components/Payments.jsx
 */

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from './Sidebar'
import Header from './Header'
// import './Payments.css'

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, statusFilter, methodFilter])

  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/api/payments/')
      setPayments(response.data)
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      setError('Failed to load payments')
    } finally {
      setIsLoading(false)
    }
  }

  const filterPayments = () => {
    let filtered = payments

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    // Filter by method
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.method === methodFilter)
    }

    setFilteredPayments(filtered)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZW', {
      style: 'currency',
      currency: 'ZWL'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', class: 'status-requested' },
      completed: { label: 'Completed', class: 'status-completed' },
      failed: { label: 'Failed', class: 'status-cancelled' },
      refunded: { label: 'Refunded', class: 'status-cancelled' }
    }
    
    const config = statusConfig[status] || { label: status, class: 'status-requested' }
    
    return <span className={`status-badge ${config.class}`}>{config.label}</span>
  }

  const getMethodBadge = (method) => {
    const methodConfig = {
      cash: { label: 'Cash', color: '#27AE60' },
      paynow: { label: 'PayNow', color: '#3498db' },
      ecocash: { label: 'EcoCash', color: '#9b59b6' }
    }
    
    const config = methodConfig[method] || { label: method, color: '#95a5a6' }
    
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        {config.label}
      </span>
    )
  }

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      await axios.patch(`/api/payments/${paymentId}/`, {
        status: newStatus
      })
      // Update local state
      setPayments(payments.map(payment => 
        payment.id === paymentId ? { ...payment, status: newStatus } : payment
      ))
    } catch (error) {
      console.error('Failed to update payment status:', error)
      setError('Failed to update payment status')
    }
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
            <h1 className="page-title">Payments Management</h1>
            <p className="page-subtitle">Manage all payments in the Rider34 platform</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {/* Filters */}
          <div className="card">
            <div className="card-body">
              <div className="filters-row">
                <div className="filter-group">
                  <label className="form-label">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-control"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label className="form-label">Method:</label>
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="form-control"
                  >
                    <option value="all">All Methods</option>
                    <option value="cash">Cash</option>
                    <option value="paynow">PayNow</option>
                    <option value="ecocash">EcoCash</option>
                  </select>
                </div>
                
                <button className="btn btn-primary" onClick={fetchPayments}>
                  Refresh
                </button>
              </div>
            </div>
          </div>
          
          {/* Payments Table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Payments ({filteredPayments.length})</h2>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Ride ID</th>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map(payment => (
                        <tr key={payment.id}>
                          <td>#{payment.id}</td>
                          <td>#{payment.ride}</td>
                          <td>{payment.user?.username || 'N/A'}</td>
                          <td>{formatCurrency(payment.amount)}</td>
                          <td>{getMethodBadge(payment.method)}</td>
                          <td>{getStatusBadge(payment.status)}</td>
                          <td>{formatDate(payment.created_at)}</td>
                          <td>
                            <div className="action-buttons">
                              <select
                                value={payment.status}
                                onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                                className="form-control form-control-sm"
                                disabled={payment.method === 'cash'}
                              >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                              </select>
                              
                              <button className="btn btn-sm btn-secondary">
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                          No payments found
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

export default Payments