import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';
import LoadForm from '../../components/LoadForm';
import LoadTable from '../../components/LoadTable';

const dashboardStyles = {
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
};

export default function ShipperDashboard() {
  const router = useRouter();
  const { authState } = useContext(AuthContext);
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authState.token) return;

    const fetchLoads = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loads`, {
          headers: {
            'x-auth-token': authState.token,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch loads');
        const data = await res.json();
        setLoads(data);
      } catch (err) {
        console.error(err);
        setError('Error loading loads');
      } finally {
        setLoading(false);
      }
    };

    fetchLoads();
  }, [authState.token]);

  const handleLoadPost = async (values, { resetForm }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authState.token,
        },
        body: JSON.stringify(values),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Error posting load');
      }
      
      resetForm();
      alert('Load posted successfully!');
      
      // Refresh loads
      const loadsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loads`, {
        headers: {
          'x-auth-token': authState.token,
        },
      });
      const loadsData = await loadsRes.json();
      setLoads(loadsData);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error posting load');
    }
  };

  const handleViewDetails = (loadId) => {
    router.push(`/shipper/load-details?id=${loadId}`);
  };

  return (
    <div style={dashboardStyles.container}>
      <div style={dashboardStyles.header}>
        <h1 style={dashboardStyles.title}>Shipper Dashboard</h1>
        <p style={dashboardStyles.subtitle}>
          Post new loads and manage your existing shipments
        </p>
      </div>

      <div style={dashboardStyles.section}>
        <h2 style={dashboardStyles.sectionTitle}>Post a New Load</h2>
        <LoadForm onSubmit={handleLoadPost} />
      </div>

      <div style={dashboardStyles.section}>
        <h2 style={dashboardStyles.sectionTitle}>Your Loads</h2>
        {loading ? (
          <p>Loading your loads...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <LoadTable 
            loads={loads} 
            onRowClick={handleViewDetails}
          />
        )}
      </div>
    </div>
  );
}
