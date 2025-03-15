import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';

const benefitsStyles = {
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
  benefitCard: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
    padding: '20px',
    marginBottom: '20px',
  },
  benefitHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  benefitTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  benefitType: {
    padding: '5px 10px',
    borderRadius: '12px',
    display: 'inline-block',
    fontWeight: 'bold',
    fontSize: '12px',
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
  },
  benefitDescription: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '15px',
  },
  benefitDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '15px',
  },
  benefitDetail: {
    padding: '5px 10px',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    fontSize: '12px',
    color: '#555',
  },
  benefitProvider: {
    fontSize: '12px',
    color: '#777',
    fontStyle: 'italic',
  },
  benefitValidity: {
    fontSize: '12px',
    color: '#777',
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
  criteriaList: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '15px',
    paddingLeft: '20px',
  },
  criteriaItem: {
    marginBottom: '5px',
  },
  categoryBadge: {
    padding: '3px 8px',
    borderRadius: '10px',
    display: 'inline-block',
    fontSize: '11px',
    backgroundColor: '#ECEFF1',
    color: '#455A64',
    marginRight: '5px',
  },
};

export default function TruckerBenefits() {
  const router = useRouter();
  const { authState } = useContext(AuthContext);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authState.token) return;

    const fetchBenefits = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/benefits`, {
          headers: {
            'x-auth-token': authState.token,
          }
        });
        if (!res.ok) throw new Error('Failed to fetch benefits');
        const data = await res.json();
        setBenefits(data);
      } catch (err) {
        console.error(err);
        setError('Error loading benefits');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBenefits();
  }, [authState.token]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getBenefitTypeLabel = (type) => {
    switch (type) {
      case 'insurance':
        return 'Insurance';
      case 'discount':
        return 'Discount';
      case 'service':
        return 'Service';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'tires':
        return 'Tires';
      case 'spare_parts':
        return 'Spare Parts';
      case 'service':
        return 'Service';
      case 'lodging':
        return 'Lodging';
      case 'food':
        return 'Food';
      case 'fuel':
        return 'Fuel';
      case 'insurance':
        return 'Insurance';
      case 'other':
        return 'Other';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  const isUserEligibleForBenefit = (benefit) => {
    if (!authState.user) return false;
    
    const criteria = benefit.eligibilityCriteria;
    const user = authState.user;
    
    // Check all eligibility criteria
    if (criteria.minDriverExperience > user.driversLicenseYears) return false;
    if (criteria.noAccidents && user.accidents > 0) return false;
    if (criteria.noTheftComplaints && user.theftComplaints > 0) return false;
    if (criteria.maxTruckAge && user.truckAge > criteria.maxTruckAge) return false;
    
    return true;
  };

  return (
    <div style={benefitsStyles.container}>
      <div style={benefitsStyles.header}>
        <h1 style={benefitsStyles.title}>Trucker Benefits</h1>
        <p style={benefitsStyles.subtitle}>
          View available benefits and discounts for eligible truckers
        </p>
      </div>
      
      {authState.user && (
        <div style={{
          ...benefitsStyles.eligibilityInfo,
          ...(authState.user.benefitsEligible ? benefitsStyles.eligible : benefitsStyles.ineligible)
        }}>
          <strong>Eligibility Status:</strong> {authState.user.benefitsEligible 
            ? 'You are eligible for trucker benefits.' 
            : 'You are not eligible for trucker benefits due to eligibility criteria.'}
          
          {!authState.user.benefitsEligible && (
            <div style={{ marginTop: '10px' }}>
              <strong>Eligibility Criteria:</strong>
              <ul style={benefitsStyles.criteriaList}>
                <li style={benefitsStyles.criteriaItem}>No accidents on record</li>
                <li style={benefitsStyles.criteriaItem}>No theft complaints</li>
                <li style={benefitsStyles.criteriaItem}>Truck age less than or equal to 5 years</li>
                <li style={benefitsStyles.criteriaItem}>Driver's license held for at least 5 years</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={benefitsStyles.section}>
        <h2 style={benefitsStyles.sectionTitle}>Available Benefits</h2>
        {loading ? (
          <p style={benefitsStyles.loadingText}>Loading benefits...</p>
        ) : error ? (
          <p style={benefitsStyles.errorText}>{error}</p>
        ) : benefits.length === 0 ? (
          <p>No benefits available at this time.</p>
        ) : (
          <div>
            {benefits.filter(benefit => benefit.isActive).map(benefit => (
              <div key={benefit._id} style={benefitsStyles.benefitCard}>
                <div style={benefitsStyles.benefitHeader}>
                  <h3 style={benefitsStyles.benefitTitle}>{benefit.name}</h3>
                  <span style={benefitsStyles.benefitType}>
                    {getBenefitTypeLabel(benefit.type)}
                  </span>
                </div>
                
                <p style={benefitsStyles.benefitDescription}>{benefit.description}</p>
                
                <div style={benefitsStyles.benefitDetails}>
                  {benefit.category && (
                    <span style={benefitsStyles.categoryBadge}>
                      {getCategoryLabel(benefit.category)}
                    </span>
                  )}
                  
                  {benefit.discount && (
                    <span style={benefitsStyles.benefitDetail}>
                      {benefit.discount}% Discount
                    </span>
                  )}
                  
                  <span style={{
                    ...benefitsStyles.benefitDetail,
                    backgroundColor: isUserEligibleForBenefit(benefit) ? '#E8F5E9' : '#FFEBEE',
                    color: isUserEligibleForBenefit(benefit) ? '#2E7D32' : '#C62828'
                  }}>
                    {isUserEligibleForBenefit(benefit) ? 'You are eligible' : 'Not eligible'}
                  </span>
                </div>
                
                {benefit.provider && (
                  <p style={benefitsStyles.benefitProvider}>Provider: {benefit.provider}</p>
                )}
                
                <p style={benefitsStyles.benefitValidity}>
                  Valid from {formatDate(benefit.validFrom)}
                  {benefit.validUntil && ` until ${formatDate(benefit.validUntil)}`}
                </p>
                
                <div style={{ marginTop: '10px' }}>
                  <strong>Eligibility Requirements:</strong>
                  <ul style={benefitsStyles.criteriaList}>
                    {benefit.eligibilityCriteria.minDriverExperience > 0 && (
                      <li style={benefitsStyles.criteriaItem}>
                        Minimum {benefit.eligibilityCriteria.minDriverExperience} years of driving experience
                      </li>
                    )}
                    {benefit.eligibilityCriteria.noAccidents && (
                      <li style={benefitsStyles.criteriaItem}>No accidents on record</li>
                    )}
                    {benefit.eligibilityCriteria.noTheftComplaints && (
                      <li style={benefitsStyles.criteriaItem}>No theft complaints</li>
                    )}
                    {benefit.eligibilityCriteria.maxTruckAge && (
                      <li style={benefitsStyles.criteriaItem}>
                        Truck age less than or equal to {benefit.eligibilityCriteria.maxTruckAge} years
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}