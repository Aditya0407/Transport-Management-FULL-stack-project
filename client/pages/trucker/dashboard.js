import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';
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
  eligibilityInfo: {
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px',
  },
  eligible: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  ineligible: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '20px',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '200px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#555',
  },
  filterInput: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  filterButton: {
    padding: '8px 16px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    marginTop: '24px',
  },
  resetButton: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    marginTop: '24px',
    marginLeft: '10px',
  }
};

export default function TruckerDashboard() {
  const router = useRouter();
  const { authState } = useContext(AuthContext);
  const [loads, setLoads] = useState([]);
  const [filteredLoads, setFilteredLoads] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    shipmentDate: '',
    maxWeight: '',
  });

  useEffect(() => {
    if (!authState.token) return;

    const fetchData = async () => {
      try {
        // Fetch available loads
        const loadsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loads`, {
          headers: {
            'x-auth-token': authState.token,
          }
        });
        if (!loadsRes.ok) throw new Error('Failed to fetch loads');
        const loadsData = await loadsRes.json();
        setLoads(loadsData);
        setFilteredLoads(loadsData);
        
        // Fetch trucker's bids
        const bidsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids/trucker`, {
          headers: {
            'x-auth-token': authState.token,
          }
        });
        if (bidsRes.ok) {
          const bidsData = await bidsRes.json();
          setMyBids(bidsData);
        }
      } catch (err) {
        console.error(err);
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [authState.token]);

  const handleViewDetails = (loadId) => {
    router.push(`/trucker/load-details?id=${loadId}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    let filtered = [...loads];
    
    if (filters.origin) {
      filtered = filtered.filter(load => 
        load.origin.toLowerCase().includes(filters.origin.toLowerCase())
      );
    }
    
    if (filters.destination) {
      filtered = filtered.filter(load => 
        load.destination.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }
    
    if (filters.shipmentDate) {
      const filterDate = new Date(filters.shipmentDate);
      filtered = filtered.filter(load => {
        const loadDate = new Date(load.shipmentDate);
        return loadDate >= filterDate;
      });
    }
    
    if (filters.maxWeight) {
      filtered = filtered.filter(load => 
        load.weight <= parseInt(filters.maxWeight)
      );
    }
    
    setFilteredLoads(filtered);
  };

  const resetFilters = () => {
    setFilters({
      origin: '',
      destination: '',
      shipmentDate: '',
      maxWeight: '',
    });
    setFilteredLoads(loads);
  };

  return (
    <div style={dashboardStyles.container}>
      <div style={dashboardStyles.header}>
        <h1 style={dashboardStyles.title}>Trucker Dashboard</h1>
        <p style={dashboardStyles.subtitle}>
          Browse available loads and manage your bids
        </p>
      </div>
      
      {authState.user && (
        <div style={{
          ...dashboardStyles.eligibilityInfo,
          ...(authState.user.benefitsEligible ? dashboardStyles.eligible : dashboardStyles.ineligible)
        }}>
          <strong>Eligibility Status:</strong> {authState.user.benefitsEligible 
            ? 'You are eligible to bid on loads.' 
            : 'You are not eligible to bid on loads due to eligibility criteria.'}
        </div>
      )}

      <div style={dashboardStyles.section}>
        <h2 style={dashboardStyles.sectionTitle}>Filter Loads</h2>
        <div style={dashboardStyles.filterContainer}>
          <div style={dashboardStyles.filterGroup}>
            <label style={dashboardStyles.filterLabel}>Origin</label>
            <input
              type="text"
              name="origin"
              value={filters.origin}
              onChange={handleFilterChange}
              placeholder="Filter by origin"
              style={dashboardStyles.filterInput}
            />
          </div>
          
          <div style={dashboardStyles.filterGroup}>
            <label style={dashboardStyles.filterLabel}>Destination</label>
            <input
              type="text"
              name="destination"
              value={filters.destination}
              onChange={handleFilterChange}
              placeholder="Filter by destination"
              style={dashboardStyles.filterInput}
            />
          </div>
          
          <div style={dashboardStyles.filterGroup}>
            <label style={dashboardStyles.filterLabel}>Shipment Date (After)</label>
            <input
              type="date"
              name="shipmentDate"
              value={filters.shipmentDate}
              onChange={handleFilterChange}
              style={dashboardStyles.filterInput}
            />
          </div>
          
          <div style={dashboardStyles.filterGroup}>
            <label style={dashboardStyles.filterLabel}>Max Weight (kg)</label>
            <input
              type="number"
              name="maxWeight"
              value={filters.maxWeight}
              onChange={handleFilterChange}
              placeholder="Max weight"
              style={dashboardStyles.filterInput}
            />
          </div>
          
          <button 
            onClick={applyFilters}
            style={dashboardStyles.filterButton}
          >
            Apply Filters
          </button>
          
          <button 
            onClick={resetFilters}
            style={dashboardStyles.resetButton}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={dashboardStyles.section}>
        <h2 style={dashboardStyles.sectionTitle}>Available Loads</h2>
        {loading ? (
          <p>Loading available loads...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <LoadTable 
            loads={filteredLoads} 
            onRowClick={handleViewDetails}
          />
        )}
      </div>
      
      {myBids.length > 0 && (
        <div style={dashboardStyles.section}>
          <h2 style={dashboardStyles.sectionTitle}>Your Bids</h2>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            border: '1px solid #e0e0e0',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Load</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Amount</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {myBids.map(bid => (
                  <tr key={bid._id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetails(bid.load._id)}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{bid.load.origin} to {bid.load.destination}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>${bid.amount.toFixed(2)}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                      <span style={{
                        padding: '5px 10px',
                        borderRadius: '12px',
                        display: 'inline-block',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        backgroundColor: bid.status === 'pending' ? '#FFF9C4' : 
                                        bid.status === 'accepted' ? '#C8E6C9' : 
                                        bid.status === 'rejected' ? '#FFCDD2' : '#E0E0E0',
                        color: bid.status === 'pending' ? '#F57F17' : 
                                bid.status === 'accepted' ? '#2E7D32' : 
                                bid.status === 'rejected' ? '#B71C1C' : '#616161'
                      }}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{new Date(bid.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
