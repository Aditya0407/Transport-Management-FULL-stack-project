import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';
import BidForm from '../../components/BidForm';

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
  bidSection: {
    marginTop: '20px',
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
  }
};

export default function LoadDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { authState } = useContext(AuthContext);
  const [load, setLoad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eligibilityStatus, setEligibilityStatus] = useState(null);
  const [bidPlaced, setBidPlaced] = useState(false);

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

        // Check if user has already placed a bid on this load
        const bidsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids/trucker`, {
          headers: {
            'x-auth-token': authState.token,
          },
        });
        if (bidsRes.ok) {
          const bidsData = await bidsRes.json();
          const hasBid = bidsData.some(bid => bid.load._id === id);
          setBidPlaced(hasBid);
        }

        // Check eligibility
        if (authState.user) {
          const isEligible = authState.user.benefitsEligible;
          setEligibilityStatus(isEligible);
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

  const handlePlaceBid = async (values) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authState.token,
        },
        body: JSON.stringify(values),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || 'Failed to place bid');
      }
      
      const data = await res.json();
      setBidPlaced(true);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
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
          onClick={() => router.push('/trucker/dashboard')}
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
        
        <div style={detailStyles.detailRow}>
          <div style={detailStyles.detailLabel}>Shipper:</div>
          <div style={detailStyles.detailValue}>
            {load.shipper ? `${load.shipper.name} (${load.shipper.email})` : 'Unknown'}
          </div>
        </div>
        
        <div style={detailStyles.detailRow}>
          <div style={detailStyles.detailLabel}>Estimated Delivery:</div>
          <div style={detailStyles.detailValue}>{formatDate(load.estimatedDeliveryTime)}</div>
        </div>
      </div>

      {load.status === 'pending' && !bidPlaced && (
        <div style={detailStyles.card}>
          <h2 style={detailStyles.sectionTitle}>Place a Bid</h2>
          
          {eligibilityStatus !== null && (
            <div style={{
              ...detailStyles.eligibilityInfo,
              ...(eligibilityStatus ? detailStyles.eligible : detailStyles.ineligible)
            }}>
              {eligibilityStatus 
                ? 'You are eligible to bid on this load based on your trucker profile.'
                : 'You are not eligible to bid on this load due to eligibility criteria. Please contact support for more information.'}
            </div>
          )}
          
          <BidForm 
            loadId={id} 
            onSubmit={handlePlaceBid} 
            eligibilityStatus={eligibilityStatus}
          />
        </div>
      )}
      
      {bidPlaced && (
        <div style={{...detailStyles.card, backgroundColor: '#d4edda', color: '#155724'}}>
          <h2 style={detailStyles.sectionTitle}>Bid Placed</h2>
          <p>You have already placed a bid on this load. You can view your bids in your dashboard.</p>
        </div>
      )}
    </div>
  );
}