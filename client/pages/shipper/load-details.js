import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';
import BidTable from '../../components/BidTable';
import LocationTracker from '../../components/LocationTracker';

const detailStyles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
    padding: '20px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  detailRow: {
    display: 'flex',
    marginBottom: '10px',
  },
  detailLabel: {
    width: '200px',
    fontWeight: 'bold',
    color: '#555',
  },
  detailValue: {
    flex: 1,
    color: '#333',
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: '12px',
    display: 'inline-block',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  pending: {
    backgroundColor: '#FFF9C4',
    color: '#F57F17',
  },
  assigned: {
    backgroundColor: '#E1F5FE',
    color: '#0277BD',
  },
  inTransit: {
    backgroundColor: '#BBDEFB',
    color: '#1565C0',
  },
  delivered: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
  },
  cancelled: {
    backgroundColor: '#FFCDD2',
    color: '#B71C1C',
  },
  loadingText: {
    textAlign: 'center',
    padding: '20px',
    color: '#757575',
  },
  errorText: {
    textAlign: 'center',
    padding: '20px',
    color: '#d32f2f',
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

export default function LoadDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { authState } = useContext(AuthContext);
  const [load, setLoad] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !authState.token) return;

    const fetchLoadDetails = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loads/${id}`, {
          headers: {
            'x-auth-token': authState.token,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch load details');
        const data = await res.json();
        setLoad(data);
      } catch (err) {
        console.error(err);
        setError('Error loading load details');
      }
    };

    const fetchBids = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids/load/${id}`, {
          headers: {
            'x-auth-token': authState.token,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch bids');
        const data = await res.json();
        setBids(data);
      } catch (err) {
        console.error(err);
        setError('Error loading bids');
      } finally {
        setLoading(false);
      }
    };

    fetchLoadDetails();
    fetchBids();
  }, [id, authState.token]);

  const handleAcceptBid = async (bidId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids/accept/${bidId}`, {
        method: 'PUT',
        headers: {
          'x-auth-token': authState.token,
        },
      });
      if (!res.ok) throw new Error('Failed to accept bid');
      
      // Refresh load and bids data
      const loadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loads/${id}`, {
        headers: {
          'x-auth-token': authState.token,
        },
      });
      const bidRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids/load/${id}`, {
        headers: {
          'x-auth-token': authState.token,
        },
      });
      
      setLoad(await loadRes.json());
      setBids(await bidRes.json());
      
      alert('Bid accepted successfully!');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error accepting bid');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return detailStyles.pending;
      case 'assigned':
        return detailStyles.assigned;
      case 'in transit':
        return detailStyles.inTransit;
      case 'delivered':
        return detailStyles.delivered;
      case 'cancelled':
        return detailStyles.cancelled;
      default:
        return {};
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div style={detailStyles.loadingText}>Loading load details...</div>;
  }

  if (error) {
    return <div style={detailStyles.errorText}>{error}</div>;
  }

  if (!load) {
    return <div style={detailStyles.errorText}>Load not found</div>;
  }

  return (
    <div style={detailStyles.container}>
      <div style={detailStyles.header}>
        <h1 style={detailStyles.title}>Load Details</h1>
        <button 
          style={detailStyles.backButton}
          onClick={() => router.push('/shipper/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>

      <div style={detailStyles.card}>
        <h2 style={detailStyles.sectionTitle}>Load Information</h2>
        
        <div style={detailStyles.detailRow}>
          <div style={detailStyles.detailLabel}>Status:</div>
          <div style={detailStyles.detailValue}>
            <span style={{ ...detailStyles.statusBadge, ...getStatusStyle(load.status) }}>
              {load.status.charAt(0).toUpperCase() + load.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div style={detailStyles.detailRow}>
          <div style={detailStyles.detailLabel}>Origin:</div>
          <div style={detailStyles.detailValue}>{load.origin}</div>
        </div>
        
        <div style={detailStyles.detailRow}>
          <div style={detailStyles.detailLabel}>Destination:</div>
          <div style={detailStyles.detailValue}>{load.destination}</div>
        </div>
        
        <div style={detailStyles.detailRow}>
          <div style={detailStyles.detailLabel}>Shipment Date:</div>
          <div style={detailStyles.detailValue}>{formatDate(load.shipmentDate)}</div>
        </div>
        
        <div style={detailStyles.detailRow}>
          <div style={detailStyles.detailLabel}>Weight:</div>
          <div style={detailStyles.detailValue}>{load.weight} lbs</div>
        </div>
        
        <div style={detailStyles.detailRow}>
          <div style={detailStyles.detailLabel}>Dimensions:</div>
          <div style={detailStyles.detailValue}>
            {load.dimensions ? `${load.dimensions.length}L x ${load.dimensions.width}W x ${load.dimensions.height}H` : 'N/A'}
          </div>
        </div>
        
        {load.assignedTrucker && (
          <div style={detailStyles.detailRow}>
            <div style={detailStyles.detailLabel}>Assigned Trucker:</div>
            <div style={detailStyles.detailValue}>
              {load.assignedTrucker.name} ({load.assignedTrucker.email})
            </div>
          </div>
        )}
        
        {load.price > 0 && (
          <div style={detailStyles.detailRow}>
            <div style={detailStyles.detailLabel}>Agreed Price:</div>
            <div style={detailStyles.detailValue}>${load.price.toFixed(2)}</div>
          </div>
        )}
        
        {load.currentLocation && (
          <div style={detailStyles.detailRow}>
            <div style={detailStyles.detailLabel}>Current Location:</div>
            <div style={detailStyles.detailValue}>
              {load.currentLocation.address || `Lat: ${load.currentLocation.lat}, Lng: ${load.currentLocation.lng}`}
              {load.currentLocation.updatedAt && ` (Updated: ${formatDate(load.currentLocation.updatedAt)})`}
            </div>
          </div>
        )}
        
        {load.pickupTime && (
          <div style={detailStyles.detailRow}>
            <div style={detailStyles.detailLabel}>Pickup Time:</div>
            <div style={detailStyles.detailValue}>{formatDate(load.pickupTime)}</div>
          </div>
        )}
        
        {load.deliveryTime && (
          <div style={detailStyles.detailRow}>
            <div style={detailStyles.detailLabel}>Delivery Time:</div>
            <div style={detailStyles.detailValue}>{formatDate(load.deliveryTime)}</div>
          </div>
        )}
        
        <div style={detailStyles.detailRow}>
          <div style={detailStyles.detailLabel}>Estimated Delivery:</div>
          <div style={detailStyles.detailValue}>{formatDate(load.estimatedDeliveryTime)}</div>
        </div>
      </div>

      {load.status === 'pending' && (
        <div style={detailStyles.card}>
          <h2 style={detailStyles.sectionTitle}>Bids</h2>
          <BidTable 
            bids={bids} 
            onAcceptBid={handleAcceptBid} 
            isShipper={true} 
          />
        </div>
      )}
      
      {(load.status === 'in transit' || load.status === 'delivered') && (
        <div style={detailStyles.card}>
          <h2 style={detailStyles.sectionTitle}>Location Tracking</h2>
          <LocationTracker 
            loadId={id} 
            loadStatus={load.status} 
            onStatusUpdate={(newStatus) => {
              setLoad({...load, status: newStatus});
            }} 
          />
        </div>
      )}
      
      {load.alerts && load.alerts.length > 0 && (
        <div style={detailStyles.card}>
          <h2 style={detailStyles.sectionTitle}>Alerts</h2>
          {load.alerts.map((alert, index) => (
            <div key={index} style={{
              padding: '10px',
              marginBottom: '10px',
              backgroundColor: alert.type === 'warning' ? '#fff3cd' : '#f8d7da',
              borderRadius: '4px',
              color: alert.type === 'warning' ? '#856404' : '#721c24'
            }}>
              <div style={{ fontWeight: 'bold' }}>{formatDate(alert.createdAt)}</div>
              <div>{alert.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}