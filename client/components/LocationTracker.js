import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const trackerStyles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
    padding: '20px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: '12px',
    display: 'inline-block',
    fontWeight: 'bold',
    fontSize: '12px',
    marginBottom: '15px',
  },
  inTransit: {
    backgroundColor: '#BBDEFB',
    color: '#1565C0',
  },
  delivered: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
  },
  locationInfo: {
    marginBottom: '15px',
    fontSize: '14px',
    color: '#555',
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    marginRight: '10px',
  },
  deliveredButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#9e9e9e',
    cursor: 'not-allowed',
  },
  errorMessage: {
    color: '#d32f2f',
    fontSize: '14px',
    marginTop: '10px',
  },
  successMessage: {
    color: '#2e7d32',
    fontSize: '14px',
    marginTop: '10px',
  },
};

export default function LocationTracker({ loadId, loadStatus, onStatusUpdate }) {
  const { authState } = useContext(AuthContext);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    // Only track location if the load is in transit
    if (loadStatus !== 'in transit') return;
    
    // Get initial location
    getLocation();
    
    // Set up interval to update location every 5 minutes
    const intervalId = setInterval(getLocation, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [loadStatus]);
  
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString(),
        };
        
        setCurrentLocation(location);
        setLocationError(null);
        
        // Send location update to server
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loads/${loadId}/location`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': authState.token,
            },
            body: JSON.stringify(location),
          });
          
          if (!res.ok) throw new Error('Failed to update location');
        } catch (err) {
          console.error('Error updating location:', err);
        }
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}`);
      },
      { enableHighAccuracy: true }
    );
  };
  
  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    setUpdateMessage(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loads/${loadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authState.token,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) throw new Error('Failed to update load status');
      
      setUpdateMessage(`Load marked as ${newStatus} successfully`);
      if (onStatusUpdate) onStatusUpdate(newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
      setUpdateMessage(`Error: ${err.message || 'Failed to update status'}`);
    } finally {
      setUpdating(false);
    }
  };
  
  // If not in transit or delivered, don't show the tracker
  if (loadStatus !== 'in transit' && loadStatus !== 'delivered') {
    return null;
  }
  
  return (
    <div style={trackerStyles.container}>
      <h3 style={trackerStyles.title}>Location Tracker</h3>
      
      <div style={{
        ...trackerStyles.statusBadge,
        ...(loadStatus === 'in transit' ? trackerStyles.inTransit : trackerStyles.delivered)
      }}>
        Status: {loadStatus.charAt(0).toUpperCase() + loadStatus.slice(1)}
      </div>
      
      {loadStatus === 'in transit' && (
        <>
          <div style={trackerStyles.locationInfo}>
            {currentLocation ? (
              <>
                <div>Current Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</div>
                <div>Last Updated: {new Date(currentLocation.timestamp).toLocaleString()}</div>
              </>
            ) : locationError ? (
              <div style={trackerStyles.errorMessage}>{locationError}</div>
            ) : (
              <div>Acquiring location...</div>
            )}
          </div>
          
          <div>
            <button 
              style={trackerStyles.button} 
              onClick={getLocation}
              disabled={updating}
            >
              Update Location
            </button>
            
            <button 
              style={{
                ...trackerStyles.button,
                ...trackerStyles.deliveredButton,
                ...(updating ? trackerStyles.disabledButton : {})
              }} 
              onClick={() => handleUpdateStatus('delivered')}
              disabled={updating}
            >
              Mark as Delivered
            </button>
          </div>
        </>
      )}
      
      {updateMessage && (
        <div style={updateMessage.includes('Error') ? 
          trackerStyles.errorMessage : 
          trackerStyles.successMessage
        }>
          {updateMessage}
        </div>
      )}
    </div>
  );
}
