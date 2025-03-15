import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }
    
    try {
      await login(email, password);
      // The AuthContext will handle redirection after successful login
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role) => {
    router.push(`/${role}/dashboard`);
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '40px auto', 
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      backgroundColor: 'white'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px', color: 'black' }}>Login</h1>
      
      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        
        <div style={{ marginBottom: '24px' }}>
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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              color: 'black' 
            }}
            placeholder="Enter your password"
            required
          />
        </div>
        
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
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ color: 'black', marginBottom: '15px' }}>Don't have an account? <a href="/register" style={{ color: '#2196f3', textDecoration: 'none' }}>Register</a></p>
        
        <div style={{ marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#555' }}>Quick Access:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              onClick={() => handleRoleSelection('shipper')}
              style={{
                padding: '10px 15px',
                backgroundColor: '#e3f2fd',
                color: '#1565c0',
                border: '1px solid #bbdefb',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px'
              }}
            >
              Shipper Portal
            </button>
            <button
              onClick={() => handleRoleSelection('trucker')}
              style={{
                padding: '10px 15px',
                backgroundColor: '#e8f5e9',
                color: '#2e7d32',
                border: '1px solid #c8e6c9',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px'
              }}
            >
              Trucker Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}