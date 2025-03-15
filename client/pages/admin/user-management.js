import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';
import UserForm from '../../components/UserForm';

const userManagementStyles = {
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
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
  },
};

export default function UserManagement() {
  const router = useRouter();
  const { authState } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authState.token) return;
    if (authState.user && !['admin', 'superadmin'].includes(authState.user.role)) {
      router.push('/');
      return;
    }

    const fetchUsers = async () => {
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
      } catch (err) {
        console.error(err);
        setError('Error loading users');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [authState.token, authState.user, router]);

  const handleCreateUser = async (userData) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authState.token,
        },
        body: JSON.stringify(userData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to create user');
      }
      
      const newUser = await res.json();
      setUsers([newUser, ...users]);
      return newUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return userManagementStyles.active;
      case 'suspended':
        return userManagementStyles.suspended;
      case 'pending':
        return userManagementStyles.pending;
      default:
        return {};
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div style={userManagementStyles.container}>
      <div style={userManagementStyles.header}>
        <h1 style={userManagementStyles.title}>User Management</h1>
        <p style={userManagementStyles.subtitle}>
          Create and manage shipper and trucker accounts
        </p>
        <button 
          style={userManagementStyles.backButton}
          onClick={() => router.push('/admin/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>

      <div style={userManagementStyles.section}>
        <h2 style={userManagementStyles.sectionTitle}>Create New User</h2>
        <UserForm onSubmit={handleCreateUser} />
      </div>

      <div style={userManagementStyles.section}>
        <h2 style={userManagementStyles.sectionTitle}>User List</h2>
        <div style={userManagementStyles.card}>
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <table style={userManagementStyles.table}>
              <thead>
                <tr>
                  <th style={userManagementStyles.th}>Name</th>
                  <th style={userManagementStyles.th}>Email</th>
                  <th style={userManagementStyles.th}>Role</th>
                  <th style={userManagementStyles.th}>Status</th>
                  <th style={userManagementStyles.th}>Benefits Eligible</th>
                  <th style={userManagementStyles.th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td style={userManagementStyles.td}>{user.name}</td>
                    <td style={userManagementStyles.td}>{user.email}</td>
                    <td style={userManagementStyles.td}>{user.role}</td>
                    <td style={userManagementStyles.td}>
                      <span style={{
                        ...userManagementStyles.statusBadge,
                        ...getStatusStyle(user.status)
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={userManagementStyles.td}>
                      {user.role === 'trucker' ? (user.benefitsEligible ? 'Yes' : 'No') : 'N/A'}
                    </td>
                    <td style={userManagementStyles.td}>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}