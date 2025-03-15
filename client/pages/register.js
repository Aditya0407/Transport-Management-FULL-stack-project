import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'shipper', // Default role
    accidents: 0,
    theftComplaints: 0,
    truckAge: 0,
    driversLicenseYears: 0
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const { 
    name, 
    email, 
    password, 
    password2, 
    role, 
    accidents, 
    theftComplaints, 
    truckAge, 
    driversLicenseYears 
  } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (password !== password2) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      // Convert numeric fields from string to number
      const userData = {
        ...formData,
        accidents: Number(accidents),
        theftComplaints: Number(theftComplaints),
        truckAge: Number(truckAge),
        driversLicenseYears: Number(driversLicenseYears)
      };
      
      // Remove password confirmation as it's not needed for the API
      delete userData.password2;
      
      await register(userData);
      // The AuthContext will handle redirection after successful registration
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '40px auto', 
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      backgroundColor: 'white'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px', color: 'black' }}>Register</h1>
      
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: 'white', 
          color: 'black', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label 
            htmlFor="name" 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold', 
              color: 'black' 
            }}
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={onChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              color: 'black' 
            }}
            placeholder="Enter your name"
            required
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label 
            htmlFor="email" 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold', 
              color: 'black' 
            }}
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={onChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              color: 'black' 
            }}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label 
            htmlFor="password" 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold', 
              color: 'black' 
            }}
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={onChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              color: 'black' 
            }}
            placeholder="Enter your password"
            minLength="6"
            required
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label 
            htmlFor="password2" 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold', 
              color: 'black' 
            }}
          >
            Confirm Password
          </label>
          <input
            id="password2"
            name="password2"
            type="password"
            value={password2}
            onChange={onChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              color: 'black' 
            }}
            placeholder="Confirm your password"
            minLength="6"
            required
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label 
            htmlFor="role" 
            style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold', 
              color: 'black' 
            }}
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={onChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              color: 'black' 
            }}
            required
          >
            <option value="shipper">Shipper</option>
            <option value="trucker">Trucker</option>
          </select>
        </div>
        
        {role === 'trucker' && (
          <>
            <h3 style={{ marginTop: '20px', marginBottom: '16px', color: 'black' }}>Trucker Eligibility Information</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="accidents" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  color: 'black' 
                }}
              >
                Number of Accidents
              </label>
              <input
                id="accidents"
                name="accidents"
                type="number"
                value={accidents}
                onChange={onChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd', 
                  color: 'black' 
                }}
                min="0"
                required
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="theftComplaints" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  color: 'black' 
                }}
              >
                Number of Theft Complaints
              </label>
              <input
                id="theftComplaints"
                name="theftComplaints"
                type="number"
                value={theftComplaints}
                onChange={onChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd', 
                  color: 'black' 
                }}
                min="0"
                required
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="truckAge" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  color: 'black' 
                }}
              >
                Truck Age (years)
              </label>
              <input
                id="truckAge"
                name="truckAge"
                type="number"
                value={truckAge}
                onChange={onChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd', 
                  color: 'black' 
                }}
                min="0"
                required
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="driversLicenseYears" 
                style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  color: 'black' 
                }}
              >
                Driver's License Experience (years)
              </label>
              <input
                id="driversLicenseYears"
                name="driversLicenseYears"
                type="number"
                value={driversLicenseYears}
                onChange={onChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd', 
                  color: 'white' 
                }}
                min="0"
                required
              />
            </div>
          </>
        )}
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#2196f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            marginTop: '20px'
          }}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ color: 'black' }}>Already have an account? <a href="/login" style={{ color: '#2196f3', textDecoration: 'none' }}>Login</a></p>
      </div>
    </div>
  );
}