/**
 * Rides component for Rider34 admin panel
 * Location: web-admin/src/components/Rides.jsx
 */

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from './Sidebar'
import Header from './Header'
// import './Rides.css'

const Rides = () => {
  const [rides, setRides] = useState([])
  const [filteredRides, setFilteredRides] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchRides()
  }, [])

  useEffect(() => {
    filterRides()
  }, [rides, statusFilter])

  const fetchRides = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/api/rides/')
      
      // Handle different possible response structures
      let ridesData = response.data;
      
      // If response.data is an object but not an array, check for common properties
      if (ridesData && typeof ridesData === 'object' && !Array.isArray(ridesData)) {
        // Try different possible structures
        if (Array.isArray(ridesData.results)) {
          ridesData = ridesData.results; // Django REST framework pagination
        } else if (Array.isArray(ridesData.data)) {
          ridesData = ridesData.data; // Common API wrapper
        } else if (Array.isArray(ridesData.rides)) {
          ridesData = ridesData.rides; // Another common pattern
        }
      }
      
      // Ensure we have an array, otherwise set to empty array
      if (!Array.isArray(ridesData)) {
        console.error('Rides API did not return an array:', ridesData);
        setRides([]);
        setError('Invalid rides data format received');
      } else {
        setRides(ridesData);
      }
    } catch (error) {
      console.error('Failed to fetch rides:', error)
      setError('Failed to load rides')
      setRides([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterRides = () => {
    // Ensure rides is always treated as an array
    let filtered = Array.isArray(rides) ? rides : [];
    
    if (statusFilter === 'all') {
      setFilteredRides(filtered)
    } else {
      setFilteredRides(filtered.filter(ride => ride.status === statusFilter))
    }
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
    return <span className={`status-badge status-${status}`}>{status.replace('_', ' ')}</span>
  }

  const handleStatusChange = async (rideId, newStatus) => {
    try {
      await axios.patch(`/api/rides/${rideId}/`, {
        status: newStatus
      })
      // Update local state
      setRides(rides.map(ride => 
        ride.id === rideId ? { ...ride, status: newStatus } : ride
      ))
    } catch (error) {
      console.error('Failed to update ride status:', error)
      setError('Failed to update ride status')
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
            <h1 className="page-title">Rides Management</h1>
            <p className="page-subtitle">Manage all rides in the Rider34 platform</p>
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
                    <option value="requested">Requested</option>
                    <option value="accepted">Accepted</option>
                    <option value="driver_arrived">Driver Arrived</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <button className="btn btn-primary" onClick={fetchRides}>
                  Refresh
                </button>
              </div>
            </div>
          </div>
          
          {/* Rides Table */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Rides ({filteredRides.length})</h2>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Passenger</th>
                      <th>Driver</th>
                      <th>Pickup</th>
                      <th>Destination</th>
                      <th>Fare</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRides.length > 0 ? (
                      filteredRides.map(ride => (
                        <tr key={ride.id}>
                          <td>#{ride.id}</td>
                          <td>{ride.passenger?.username || 'N/A'}</td>
                          <td>{ride.driver?.username || 'Pending'}</td>
                          <td>{ride.pickup_address}</td>
                          <td>{ride.destination_address}</td>
                          <td>{formatCurrency(ride.agreed_fare || ride.requested_fare)}</td>
                          <td>{getStatusBadge(ride.status)}</td>
                          <td>{formatDate(ride.created_at)}</td>
                          <td>
                            <div className="action-buttons">
                              <select
                                value={ride.status}
                                onChange={(e) => handleStatusChange(ride.id, e.target.value)}
                                className="form-control form-control-sm"
                              >
                                <option value="requested">Requested</option>
                                <option value="accepted">Accepted</option>
                                <option value="driver_arrived">Driver Arrived</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
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
                        <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                          No rides found
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

export default Rides