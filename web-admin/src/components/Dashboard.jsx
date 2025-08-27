// /**
//  * Dashboard component for Rider34 admin panel
//  * Location: web-admin/src/components/Dashboard.jsx
//  */

// import React, { useState, useEffect } from 'react'
// import axios from 'axios'
// import Sidebar from './Sidebar'
// import Header from './Header'
// import './Dashboard.css'

// const Dashboard = () => {
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalRides: 0,
//     totalRevenue: 0,
//     activeRides: 0
//   })
//   const [recentRides, setRecentRides] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     fetchDashboardData()
//   }, [])

//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true)
//       // In a real app, you would have specific endpoints for these
//       const [usersRes, ridesRes, paymentsRes] = await Promise.all([
//         axios.get('/api/auth/users/'),
//         axios.get('/api/rides/'),
//         axios.get('/api/payments/')
//       ])
      
//       const users = usersRes.data
//       const rides = ridesRes.data
//       const payments = paymentsRes.data
      
//       // Calculate stats
//       const totalUsers = users.length
//       const totalRides = rides.length
//       const activeRides = rides.filter(ride => 
//         ['requested', 'accepted', 'in_progress'].includes(ride.status)
//       ).length
      
//       const totalRevenue = payments
//         .filter(payment => payment.status === 'completed')
//         .reduce((sum, payment) => sum + parseFloat(payment.amount), 0)
      
//       setStats({
//         totalUsers,
//         totalRides,
//         totalRevenue,
//         activeRides
//       })
      
//       // Get recent rides
//       setRecentRides(rides.slice(0, 5))
      
//     } catch (error) {
//       console.error('Failed to fetch dashboard data:', error)
//       setError('Failed to load dashboard data')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-ZW', {
//       style: 'currency',
//       currency: 'ZWL'
//     }).format(amount)
//   }

//   const getStatusBadge = (status) => {
//     return <span className={`status-badge status-${status}`}>{status}</span>
//   }

//   if (isLoading) {
//     return (
//       <div className="app">
//         <Sidebar />
//         <Header />
//         <div className="main-content">
//           <div className="content-area" style={{ marginLeft: '250px', paddingTop: '70px' }}>
//             <div className="loading-spinner-container">
//               <div className="loading-spinner" style={{ borderColor: '#27AE60', borderTopColor: 'transparent' }}></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="app">
//       <Sidebar />
//       <Header />
      
//       <div className="main-content">
//         <div className="content-area" style={{ marginLeft: '250px', paddingTop: '70px' }}>
//           <div className="page-header">
//             <h1 className="page-title">Dashboard</h1>
//             <p className="page-subtitle">Overview of your Rider34 platform</p>
//           </div>
          
//           {error && <div className="error-message">{error}</div>}
          
//           {/* Stats Cards */}
//           <div className="stats-grid">
//             <div className="stat-card">
//               <div className="stat-icon" style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', color: '#27AE60' }}>
//                 👥
//               </div>
//               <div className="stat-content">
//                 <h3>{stats.totalUsers}</h3>
//                 <p>Total Users</p>
//               </div>
//             </div>
            
//             <div className="stat-card">
//               <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>
//                 🚗
//               </div>
//               <div className="stat-content">
//                 <h3>{stats.totalRides}</h3>
//                 <p>Total Rides</p>
//               </div>
//             </div>
            
//             <div className="stat-card">
//               <div className="stat-icon" style={{ backgroundColor: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6' }}>
//                 💰
//               </div>
//               <div className="stat-content">
//                 <h3>{formatCurrency(stats.totalRevenue)}</h3>
//                 <p>Total Revenue</p>
//               </div>
//             </div>
            
//             <div className="stat-card">
//               <div className="stat-icon" style={{ backgroundColor: 'rgba(243, 156, 18, 0.1)', color: '#f39c12' }}>
//                 ⚡
//               </div>
//               <div className="stat-content">
//                 <h3>{stats.activeRides}</h3>
//                 <p>Active Rides</p>
//               </div>
//             </div>
//           </div>
          
//           {/* Recent Rides */}
//           <div className="card">
//             <div className="card-header">
//               <h2 className="card-title">Recent Rides</h2>
//             </div>
//             <div className="card-body">
//               <div className="table-container">
//                 <table className="table">
//                   <thead>
//                     <tr>
//                       <th>ID</th>
//                       <th>Passenger</th>
//                       <th>Driver</th>
//                       <th>Fare</th>
//                       <th>Status</th>
//                       <th>Date</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {recentRides.length > 0 ? (
//                       recentRides.map(ride => (
//                         <tr key={ride.id}>
//                           <td>#{ride.id}</td>
//                           <td>{ride.passenger?.username || 'N/A'}</td>
//                           <td>{ride.driver?.username || 'Pending'}</td>
//                           <td>{formatCurrency(ride.agreed_fare || ride.requested_fare)}</td>
//                           <td>{getStatusBadge(ride.status)}</td>
//                           <td>{new Date(ride.created_at).toLocaleDateString()}</td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
//                           No rides found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Dashboard
/**
 * Dashboard component for Rider34 admin panel
 * Location: web-admin/src/components/Dashboard.jsx
 */

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from './Sidebar'
import Header from './Header'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRides: 0,
    totalRevenue: 0,
    activeRides: 0
  })
  const [recentRides, setRecentRides] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Make API calls with proper error handling for each endpoint
      const [usersRes, ridesRes, paymentsRes] = await Promise.all([
        axios.get('/api/auth/users/').catch(error => {
          console.error('Failed to fetch users:', error)
          return { data: [] }
        }),
        axios.get('/api/rides/').catch(error => {
          console.error('Failed to fetch rides:', error)
          return { data: [] }
        }),
        axios.get('/api/payments/').catch(error => {
          console.error('Failed to fetch payments:', error)
          return { data: [] }
        })
      ])
      
      // Extract data from responses, handling different possible response structures
      const users = Array.isArray(usersRes.data) ? usersRes.data : 
                   usersRes.data.results || usersRes.data.users || usersRes.data.data || [];
      
      const rides = Array.isArray(ridesRes.data) ? ridesRes.data : 
                   ridesRes.data.results || ridesRes.data.rides || ridesRes.data.data || [];
      
      const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : 
                      paymentsRes.data.results || paymentsRes.data.payments || paymentsRes.data.data || [];
      
      console.log('Users data:', users);
      console.log('Rides data:', rides);
      console.log('Payments data:', payments);
      
      // Calculate stats
      const totalUsers = users.length
      const totalRides = rides.length
      
      // Handle different ride status formats
      const activeRides = rides.filter(ride => {
        const status = ride.status?.toLowerCase();
        return ['requested', 'accepted', 'in_progress', 'active', 'ongoing'].includes(status);
      }).length
      
      const totalRevenue = payments
        .filter(payment => {
          const status = payment.status?.toLowerCase();
          return status === 'completed' || status === 'success' || status === 'paid';
        })
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
      
      setStats({
        totalUsers,
        totalRides,
        totalRevenue,
        activeRides
      })
      
      // Get recent rides (most recent first)
      const sortedRides = [...rides].sort((a, b) => 
        new Date(b.created_at || b.date_created || b.timestamp) - 
        new Date(a.created_at || a.date_created || a.timestamp)
      )
      setRecentRides(sortedRides.slice(0, 5))
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZW', {
      style: 'currency',
      currency: 'ZWL'
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    if (!status) return <span className="status-badge status-unknown">Unknown</span>
    
    const statusClass = status.toLowerCase().replace('_', '-')
    return <span className={`status-badge status-${statusClass}`}>{status}</span>
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const getDisplayName = (user) => {
    if (!user) return 'N/A'
    return user.username || user.name || user.email || user.phone_number || 'Unknown'
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
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of your Rider34 platform</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(39, 174, 96, 0.1)', color: '#27AE60' }}>
                👥
              </div>
              <div className="stat-content">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>
                🚗
              </div>
              <div className="stat-content">
                <h3>{stats.totalRides}</h3>
                <p>Total Rides</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6' }}>
                💰
              </div>
              <div className="stat-content">
                <h3>{formatCurrency(stats.totalRevenue)}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(243, 156, 18, 0.1)', color: '#f39c12' }}>
                ⚡
              </div>
              <div className="stat-content">
                <h3>{stats.activeRides}</h3>
                <p>Active Rides</p>
              </div>
            </div>
          </div>
          
          {/* Recent Rides */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Rides</h2>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={fetchDashboardData}
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Passenger</th>
                      <th>Driver</th>
                      <th>Fare</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRides.length > 0 ? (
                      recentRides.map(ride => (
                        <tr key={ride.id}>
                          <td>#{ride.id}</td>
                          <td>{getDisplayName(ride.passenger)}</td>
                          <td>{getDisplayName(ride.driver)}</td>
                          <td>
                            {formatCurrency(
                              ride.agreed_fare || 
                              ride.requested_fare || 
                              ride.fare || 
                              ride.amount || 
                              0
                            )}
                          </td>
                          <td>{getStatusBadge(ride.status)}</td>
                          <td>{formatDate(ride.created_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
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

export default Dashboard