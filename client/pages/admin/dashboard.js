import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';

const adminStyles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
    padding: '20px',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px',
    borderBottom: '2px solid #ddd',
    color: '#333',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
    color: '#333',
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: '12px',
    display: 'inline-block',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  active: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
  },
  suspended: {
    backgroundColor: '#FFCDD2',
    color: '#B71C1C',
  },
  pending: {
    backgroundColor: '#FFF9C4',
    color: '#F57F17',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    marginBottom: '20px',
  },
  tab: {
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#555',
  },
  activeTab: {
    borderBottom: '2px solid #1976d2',
    color: '#1976d2',
    fontWeight: 'bold',
  },
  actionButton: {
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px',
    marginRight: '5px',
  },
  editButton: {
    backgroundColor: '#2196F3',
    color: 'white',
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  suspendButton: {
    backgroundColor: '#F44336',
    color: 'white',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  statCard: {
    flex: '1',
    margin: '0 10px',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statTitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  searchBar: {
    padding: '10px',
    width: '100%',
    marginBottom: '20px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  filterContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  filterSelect: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
};

export default function AdminDashboard() {
  const router = useRouter();
  const { authState } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loads, setLoads] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLoads: 0,
    completedLoads: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [loadFilter, setLoadFilter] = useState('all');

  useEffect(() => {
    if (!authState.token) return;
    if (authState.user && !['admin', 'superadmin'].includes(authState.user.role)) {
      router.push('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
          headers: {
            'x-auth-token': authState.token,
          }
        });
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        const usersData = await usersRes.json();
        setUsers(usersData);
        
        // Fetch loads
        const loadsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loads`, {
          headers: {
            'x-auth-token': authState.token,
          }
        });
        if (!loadsRes.ok) throw new Error('Failed to fetch loads');
        const loadsData = await loadsRes.json();
        setLoads(loadsData);
        
        // Fetch benefits
        const benefitsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/benefits`, {
          headers: {
            'x-auth-token': authState.token,
          }
        });
        if (benefitsRes.ok) {
          const benefitsData = await benefitsRes.json();
          setBenefits(benefitsData);
        }
        
        // Calculate stats
        setStats({
          totalUsers: usersData.length,
          activeLoads: loadsData.filter(load => ['pending', 'assigned', 'in transit'].includes(load.status)).length,
          completedLoads: loadsData.filter(load => load.status === 'delivered').length,
          totalRevenue: loadsData
            .filter(load => load.status === 'delivered')
            .reduce((sum, load) => sum + (load.amount || 0), 0),
        });
      } catch (err) {
        console.error(err);
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [authState.token, authState.user, router]);

  const handleVerifyUser = async (userId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'x-auth-token': authState.token,
        },
      });
      
      if (!res.ok) throw new Error('Failed to verify user');
      
      // Update user in state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isVerified: true, status: 'active' } : user
      ));
      
      alert('User verified successfully');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error verifying user');
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'x-auth-token': authState.token,
        },
      });
      
      if (!res.ok) throw new Error('Failed to suspend user');
      
      // Update user in state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: 'suspended' } : user
      ));
      
      alert('User suspended successfully');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error suspending user');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/activate`, {
        method: 'PUT',
        headers: {
          'x-auth-token': authState.token,
        },
      });
      
      if (!res.ok) throw new Error('Failed to activate user');
      
      // Update user in state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: 'active' } : user
      ));
      
      alert('User activated successfully');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error activating user');
    }
  };

  const handleUpdateBenefitsEligibility = async (userId, eligible) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/benefits-eligibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authState.token,
        },
        body: JSON.stringify({ benefitsEligible: eligible }),
      });
      
      if (!res.ok) throw new Error('Failed to update benefits eligibility');
      
      // Update user in state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, benefitsEligible: eligible } : user
      ));
      
      alert(`User benefits eligibility ${eligible ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error updating benefits eligibility');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return adminStyles.active;
      case 'suspended':
        return adminStyles.suspended;
      case 'pending':
        return adminStyles.pending;
      default:
        return {};
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredLoads = loads.filter(load => {
    const matchesSearch = load.origin.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         load.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = loadFilter === 'all' || load.status === loadFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={adminStyles.container}>
      <div style={adminStyles.header}>
        <h1 style={adminStyles.title}>Admin Dashboard</h1>
        <p style={adminStyles.subtitle}>
          Manage users, loads, and system settings
        </p>
      </div>

      <div style={adminStyles.statsContainer}>
        <div style={adminStyles.statCard}>
          <div style={adminStyles.statTitle}>Total Users</div>
          <div style={adminStyles.statValue}>{stats.totalUsers}</div>
        </div>
        <div style={adminStyles.statCard}>
          <div style={adminStyles.statTitle}>Active Loads</div>
          <div style={adminStyles.statValue}>{stats.activeLoads}</div>
        </div>
        <div style={adminStyles.statCard}>
          <div style={adminStyles.statTitle}>Completed Loads</div>
          <div style={adminStyles.statValue}>{stats.completedLoads}</div>
        </div>
        <div style={adminStyles.statCard}>
          <div style={adminStyles.statTitle}>Total Revenue</div>
          <div style={adminStyles.statValue}>{formatCurrency(stats.totalRevenue)}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => router.push('/admin/user-management')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            marginRight: '10px'
          }}
        >
          User Management
        </button>
      </div>

      <div style={adminStyles.tabs}>
        <div 
          style={{
            ...adminStyles.tab,
            ...(activeTab === 'users' ? adminStyles.activeTab : {})
          }}
          onClick={() => setActiveTab('users')}
        >
          Users
        </div>
        <div 
          style={{
            ...adminStyles.tab,
            ...(activeTab === 'loads' ? adminStyles.activeTab : {})
          }}
          onClick={() => setActiveTab('loads')}
        >
          Loads
        </div>
        <div 
          style={{
            ...adminStyles.tab,
            ...(activeTab === 'benefits' ? adminStyles.activeTab : {})
          }}
          onClick={() => setActiveTab('benefits')}
        >
          Benefits
        </div>
      </div>

      <input
        type="text"
        placeholder="Search..."
        style={adminStyles.searchBar}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {activeTab === 'users' && (
        <div style={adminStyles.section}>
          <div style={adminStyles.filterContainer}>
            <select 
              style={adminStyles.filterSelect}
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="shipper">Shippers</option>
              <option value="trucker">Truckers</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div style={adminStyles.card}>
            <h2 style={adminStyles.sectionTitle}>User Management</h2>
            {loading ? (
              <p style={adminStyles.loadingText}>Loading users...</p>
            ) : error ? (
              <p style={adminStyles.errorText}>{error}</p>
            ) : (
              <table style={adminStyles.table}>
                <thead>
                  <tr>
                    <th style={adminStyles.th}>Name</th>
                    <th style={adminStyles.th}>Email</th>
                    <th style={adminStyles.th}>Role</th>
                    <th style={adminStyles.th}>Status</th>
                    <th style={adminStyles.th}>Verified</th>
                    <th style={adminStyles.th}>Benefits Eligible</th>
                    <th style={adminStyles.th}>Created</th>
                    <th style={adminStyles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td style={adminStyles.td}>{user.name}</td>
                      <td style={adminStyles.td}>{user.email}</td>
                      <td style={adminStyles.td}>{user.role}</td>
                      <td style={adminStyles.td}>
                        <span style={{
                          ...adminStyles.statusBadge,
                          ...getStatusStyle(user.status)
                        }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={adminStyles.td}>{user.isVerified ? 'Yes' : 'No'}</td>
                      <td style={adminStyles.td}>{user.role === 'trucker' ? (user.benefitsEligible ? 'Yes' : 'No') : 'N/A'}</td>
                      <td style={adminStyles.td}>{formatDate(user.createdAt)}</td>
                      <td style={adminStyles.td}>
                        {!user.isVerified && (
                          <button 
                            style={{...adminStyles.actionButton, ...adminStyles.verifyButton}}
                            onClick={() => handleVerifyUser(user._id)}
                          >
                            Verify
                          </button>
                        )}
                        {user.status === 'active' && (
                          <button 
                            style={{...adminStyles.actionButton, ...adminStyles.suspendButton}}
                            onClick={() => handleSuspendUser(user._id)}
                          >
                            Suspend
                          </button>
                        )}
                        {user.status === 'suspended' && (
                          <button 
                            style={{...adminStyles.actionButton, ...adminStyles.verifyButton}}
                            onClick={() => handleActivateUser(user._id)}
                          >
                            Activate
                          </button>
                        )}
                        {user.role === 'trucker' && (
                          <button 
                            style={{
                              ...adminStyles.actionButton, 
                              backgroundColor: user.benefitsEligible ? '#FF9800' : '#4CAF50',
                              color: 'white'
                            }}
                            onClick={() => handleUpdateBenefitsEligibility(user._id, !user.benefitsEligible)}
                          >
                            {user.benefitsEligible ? 'Disable Benefits' : 'Enable Benefits'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'loads' && (
        <div style={adminStyles.section}>
          <div style={adminStyles.filterContainer}>
            <select 
              style={adminStyles.filterSelect}
              value={loadFilter}
              onChange={(e) => setLoadFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={adminStyles.card}>
            <h2 style={adminStyles.sectionTitle}>Load Management</h2>
            {loading ? (
              <p style={adminStyles.loadingText}>Loading loads...</p>
            ) : error ? (
              <p style={adminStyles.errorText}>{error}</p>
            ) : (
              <table style={adminStyles.table}>
                <thead>
                  <tr>
                    <th style={adminStyles.th}>ID</th>
                    <th style={adminStyles.th}>Origin</th>
                    <th style={adminStyles.th}>Destination</th>
                    <th style={adminStyles.th}>Cargo Type</th>
                    <th style={adminStyles.th}>Weight (lbs)</th>
                    <th style={adminStyles.th}>Amount</th>
                    <th style={adminStyles.th}>Status</th>
                    <th style={adminStyles.th}>Shipper</th>
                    <th style={adminStyles.th}>Trucker</th>
                    <th style={adminStyles.th}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoads.map(load => (
                    <tr key={load._id}>
                      <td style={adminStyles.td}>{load._id.substring(0, 8)}...</td>
                      <td style={adminStyles.td}>{load.origin}</td>
                      <td style={adminStyles.td}>{load.destination}</td>
                      <td style={adminStyles.td}>{load.cargoType}</td>
                      <td style={adminStyles.td}>{load.weight}</td>
                      <td style={adminStyles.td}>{formatCurrency(load.amount)}</td>
                      <td style={adminStyles.td}>
                        <span style={{
                          ...adminStyles.statusBadge,
                          ...getStatusStyle(load.status)
                        }}>
                          {load.status}
                        </span>
                      </td>
                      <td style={adminStyles.td}>{load.shipper ? load.shipper.name : 'N/A'}</td>
                      <td style={adminStyles.td}>{load.trucker ? load.trucker.name : 'N/A'}</td>
                      <td style={adminStyles.td}>{formatDate(load.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'benefits' && (
        <div style={adminStyles.section}>
          <div style={adminStyles.card}>
            <h2 style={adminStyles.sectionTitle}>Benefits Management</h2>
            {loading ? (
              <p style={adminStyles.loadingText}>Loading benefits...</p>
            ) : error ? (
              <p style={adminStyles.errorText}>{error}</p>
            ) : (
              <table style={adminStyles.table}>
                <thead>
                  <tr>
                    <th style={adminStyles.th}>Name</th>
                    <th style={adminStyles.th}>Type</th>
                    <th style={adminStyles.th}>Description</th>
                    <th style={adminStyles.th}>Provider</th>
                    <th style={adminStyles.th}>Valid Until</th>
                    <th style={adminStyles.th}>Categories</th>
                  </tr>
                </thead>
                <tbody>
                  {benefits.map(benefit => (
                    <tr key={benefit._id}>
                      <td style={adminStyles.td}>{benefit.name}</td>
                      <td style={adminStyles.td}>{benefit.type}</td>
                      <td style={adminStyles.td}>{benefit.description}</td>
                      <td style={adminStyles.td}>{benefit.provider}</td>
                      <td style={adminStyles.td}>{formatDate(benefit.validUntil)}</td>
                      <td style={adminStyles.td}>
                        {benefit.categories && benefit.categories.map(category => (
                          <span key={category} style={adminStyles.categoryBadge}>{category}</span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const fetchDashboardData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const headers = {
      'Content-Type': 'application/json',
      'x-auth-token': authState.token
    };

    // Fetch dashboard statistics
    const dashboardRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
      headers
    });
    if (!dashboardRes.ok) throw new Error('Failed to fetch dashboard data');
    const dashboardData = await dashboardRes.json();
    
    setStats({
      totalUsers: dashboardData.counts.shippers + dashboardData.counts.truckers,
      activeLoads: dashboardData.counts.inTransitLoads,
      completedLoads: dashboardData.counts.deliveredLoads,
      totalRevenue: dashboardData.counts.loads
    });
    
    setUsers([...dashboardData.recent.shippers, ...dashboardData.recent.truckers]);
    setLoads(dashboardData.recent.loads);
    
    // Fetch benefits
    const benefitsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/benefits`, {
      headers
    });
    if (!benefitsRes.ok) throw new Error('Failed to fetch benefits');
    const benefitsData = await benefitsRes.json();
    setBenefits(benefitsData);
    
  } catch (err) {
    console.error('Dashboard data fetch error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
