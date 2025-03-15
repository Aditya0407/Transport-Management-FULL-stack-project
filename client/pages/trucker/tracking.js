import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';
import LocationTracker from '../../components/LocationTracker';

const trackingStyles = {
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
  mapContainer: {
    height: '400px',
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #ddd',
  },
  loadDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '20px',
  },
  detailCard: {
    flex: '1 1 300px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  detailTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '10px',
  },
  detailContent: {
    fontSize: '14px',
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
  updateButton: {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  locationInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  locationLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  locationValue: {
    color: '#333',
  },
};

export default function LoadTracking() {
  const router = useRouter();
  const { id } = router.query;
  const { authState } = useContext(AuthContext);
  const [load, setLoad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

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

        // Check if this load is assigned to the current trucker
        if (data.status === 'assigned' && data.assignedTo === authState.user._id) {
          setIsTracking(true);
        }
      } catch (err) {
        console.error(err);
        setError('Error loading load details');
      } finally {
        setLoading(false);
      }
    };

    fetchLoadDetails();
  }, [id, authState.token, authState.user]);

  useEffect(() => {
    if (!isTracking) return;

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error(err);
          setError('Error getting current location');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  }, [isTracking]);

  const updateLoadStatus = async (newStatus) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loads/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authState.token,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update load status');
      
      // Refresh load data
      const updatedLoad = await res.json();
      setLoad(updatedLoad);
      
      if (newStatus === 'in transit') {
        setIsTracking(true);
      } else if (newStatus === 'delivered') {
        setIsTracking(false);
      }
      
      alert(`Load status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error updating load status');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return trackingStyles.pending;
      case 'assigned':
        return trackingStyles.assigned;
      case 'in transit':
        return trackingStyles.inTransit;
      case 'delivered':
        return trackingStyles.delivered;
      case 'cancelled':
        return trackingStyles.cancelled;
      default:
        return {};
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div style={trackingStyles.container}>
      <div style={trackingStyles.header}>
        <h1 style={trackingStyles.title}>Load Tracking</h1>
        <p style={trackingStyles.subtitle}>
          Track and update your assigned load in real-time
        </p>
      </div>

      {loading ? (
        <p style={trackingStyles.loadingText}>Loading load details...</p>
      ) : error ? (
        <p style={trackingStyles.errorText}>{error}</p>
      ) : !load ? (
        <p style={trackingStyles.errorText}>Load not found</p>
      ) : (
        <div>
          <div style={trackingStyles.card}>
            <h2 style={trackingStyles.sectionTitle}>
              {load.origin} to {load.destination}
              <span style={{
                ...trackingStyles.statusBadge,
                ...getStatusStyle(load.status),
                marginLeft: '10px',
              }}>
                {load.status.charAt(0).toUpperCase() + load.status.slice(1)}
              </span>
            </h2>

            <div style={trackingStyles.loadDetails}>
              <div style={trackingStyles.detailCard}>
                <h3 style={trackingStyles.detailTitle}>Pickup Information</h3>
                <div style={trackingStyles.detailContent}>
                  <p><strong>Location:</strong> {load.origin}</p>
                  <p><strong>Date:</strong> {formatDate(load.pickupDate)}</p>
                  <p><strong>Contact:</strong> {load.pickupContact || 'N/A'}</p>
                </div>
              </div>

              <div style={trackingStyles.detailCard}>
                <h3 style={trackingStyles.detailTitle}>Delivery Information</h3>
                <div style={trackingStyles.detailContent}>
                  <p><strong>Location:</strong> {load.destination}</p>
                  <p><strong>Date:</strong> {formatDate(load.deliveryDate)}</p>
                  <p><strong>Contact:</strong> {load.deliveryContact || 'N/A'}</p>
                </div>
              </div>

              <div style={trackingStyles.detailCard}>
                <h3 style={trackingStyles.detailTitle}>Load Details</h3>
                <div style={trackingStyles.detailContent}>
                  <p><strong>Type:</strong> {load.type}</p>
                  <p><strong>Weight:</strong> {load.weight} lbs</p>
                  <p><strong>Dimensions:</strong> {load.dimensions || 'N/A'}</p>
                </div>
              </div>
            </div>

            {load.status === 'assigned' && load.assignedTo === authState.user?._id && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button 
                  style={trackingStyles.updateButton} 
                  onClick={() => updateLoadStatus('in transit')}
                >
                  Start Transit
                </button>
              </div>
            )}

            {load.status === 'in transit' && load.assignedTo === authState.user?._id && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button 
                  style={trackingStyles.updateButton} 
                  onClick={() => updateLoadStatus('delivered')}
                >
                  Mark as Delivered
                </button>
              </div>
            )}
          </div>

          {isTracking && (
            <div>
              <h2 style={trackingStyles.sectionTitle}>Live Tracking</h2>
              
              <div style={trackingStyles.card}>
                <div style={trackingStyles.locationInfo}>
                  <span style={trackingStyles.locationLabel}>Current Location:</span>
                  <span style={trackingStyles.locationValue}>
                    {currentLocation ? 
                      `Lat: ${currentLocation.lat.toFixed(6)}, Lng: ${currentLocation.lng.toFixed(6)}` : 
                      'Fetching location...'}
                  </span>
                </div>
                
                <div style={trackingStyles.mapContainer}>
                  <p>Map visualization would be displayed here</p>
                  {/* In a real implementation, this would be a map component */}
                </div>
                
                {/* This component handles the actual location tracking */}
                <LocationTracker loadId={id} loadStatus={load.status} onStatusUpdate={(newStatus) => {
                  setLoad({...load, status: newStatus});
                  if (newStatus === 'delivered') {
                    setIsTracking(false);
                  }
                }} />
                
                <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  Your location is being shared with the shipper while you are in transit.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}