import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';

const navigationStyles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: 'white',
    borderBottom: '1px solid #eaeaea',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: '#333',
    cursor: 'pointer',
  },
  navButtons: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    color: '#333',
  },
  buttonHover: {
    backgroundColor: '#e0e0e0',
  },
  logoutButton: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    border: '1px solid #ffcdd2',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#555',
  },
  userRole: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  navLinks: {
    display: 'flex',
    gap: '15px',
    margin: '0 20px',
  },
  navLink: {
    fontSize: '14px',
    color: '#555',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
  }
};

export default function Navigation() {
  const router = useRouter();
  const { authState, logout } = useContext(AuthContext);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleHome = () => {
    router.push('/');
  };
  
  const handleLogout = () => {
    logout();
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  const isActive = (path) => {
    return router.pathname === path;
  };
  
  // Don't show navigation on login and register pages
  if (router.pathname === '/login' || router.pathname === '/register') {
    return null;
  }
  
  return (
    <div style={navigationStyles.container}>
      <div style={navigationStyles.logo} onClick={handleHome}>
        Load Posting System
      </div>
      
      {authState.user && (
        <div style={navigationStyles.navLinks}>
          {authState.user.role === 'trucker' && (
            <>
              <div 
                style={{
                  ...navigationStyles.navLink,
                  ...(isActive('/trucker/dashboard') ? navigationStyles.activeLink : {})
                }}
                onClick={() => navigateTo('/trucker/dashboard')}
              >
                Dashboard
              </div>
              <div 
                style={{
                  ...navigationStyles.navLink,
                  ...(isActive('/trucker/benefits') ? navigationStyles.activeLink : {})
                }}
                onClick={() => navigateTo('/trucker/benefits')}
              >
                Benefits
              </div>
              <div 
                style={{
                  ...navigationStyles.navLink,
                  ...(isActive('/trucker/finances') ? navigationStyles.activeLink : {})
                }}
                onClick={() => navigateTo('/trucker/finances')}
              >
                Finances
              </div>
            </>
          )}
          
          {authState.user.role === 'shipper' && (
            <div 
              style={{
                ...navigationStyles.navLink,
                ...(isActive('/shipper/dashboard') ? navigationStyles.activeLink : {})
              }}
              onClick={() => navigateTo('/shipper/dashboard')}
            >
              Dashboard
            </div>
          )}
          
          {(authState.user.role === 'admin' || authState.user.role === 'superadmin') && (
            <div 
              style={{
                ...navigationStyles.navLink,
                ...(isActive('/admin/dashboard') ? navigationStyles.activeLink : {})
              }}
              onClick={() => navigateTo('/admin/dashboard')}
            >
              Dashboard
            </div>
          )}
        </div>
      )}
      
      {authState.user && (
        <div style={navigationStyles.userInfo}>
          <span>{authState.user.name}</span>
          <span style={navigationStyles.userRole}>
            {authState.user.role.charAt(0).toUpperCase() + authState.user.role.slice(1)}
          </span>
        </div>
      )}
      
      <div style={navigationStyles.navButtons}>
        <button 
          style={navigationStyles.button} 
          onClick={handleBack}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = navigationStyles.buttonHover.backgroundColor;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = navigationStyles.button.backgroundColor;
          }}
        >
          Back
        </button>
        
        <button 
          style={navigationStyles.button} 
          onClick={handleHome}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = navigationStyles.buttonHover.backgroundColor;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = navigationStyles.button.backgroundColor;
          }}
        >
          Main Menu
        </button>
        
        {authState.user && (
          <button 
            style={{...navigationStyles.button, ...navigationStyles.logoutButton}} 
            onClick={handleLogout}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#ffcdd2';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = navigationStyles.logoutButton.backgroundColor;
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}