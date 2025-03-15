

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LoadTable from "../components/LoadTable";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    // Define the fetch function
    const fetchData = () => {
      if (!authState.token) {
        setError("Authentication required. Please log in.");
        setIsLoading(false);
        return;
      }

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/loads`, {
        headers: {
          'x-auth-token': authState.token
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`API responded with status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("API Error:", err);
          setError(err.message || "Failed to fetch data from API");
          setIsLoading(false);
        });
    };

    // Call the fetch function
    fetchData();
    
    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [authState]);

  return (
    <div style={{ 
      textAlign: "center", 
      padding: "40px", 
      maxWidth: "1000px", 
      margin: "0 auto",
      fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
      backgroundColor: "white",
      color: "black",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <h1 style={{ marginBottom: "20px", color: "#333" }}>Load Posting System</h1>
      
      {error && (
        <div style={{ 
          padding: "20px", 
          backgroundColor: "#fff8f8", 
          borderRadius: "8px", 
          marginBottom: "20px",
          color: "#d32f2f",
          border: "1px solid #ffcdd2"
        }}>
          <h3 style={{ color: "#c62828" }}>API Connection Error</h3>
          <p>{error}</p>
          {error === "Authentication required. Please log in." && (
            <button 
              onClick={() => window.location.href = '/login'} 
              style={{
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px",
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              Go to Login
            </button>
          )}
          {error !== "Authentication required. Please log in." && (
            <p style={{ fontSize: "14px", marginTop: "10px", color: "#555" }}>
              Make sure the backend server is running at {process.env.NEXT_PUBLIC_API_URL}
            </p>
          )}
        </div>
      )}
      
      {isLoading && !error && (
        <div style={{ padding: "20px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
          <p style={{ color: "#555" }}>Loading data from API...</p>
        </div>
      )}
      
      {data && (
        <div style={{ 
          backgroundColor: "white", 
          padding: "20px", 
          borderRadius: "8px",
          textAlign: "left",
          overflow: "auto",
          border: "1px solid #e0e0e0",
          marginBottom: "20px"
        }}>
          <h3 style={{ color: "#333", marginBottom: "15px" }}>Available Loads:</h3>
          <LoadTable loads={data} />
        </div>
      )}
      
      {!isLoading && !data && !error && (
        <div style={{ padding: "20px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
          <p style={{ color: "#555" }}>No data available</p>
        </div>
      )}
      
      <div style={{ 
        marginTop: "40px", 
        padding: "30px", 
        backgroundColor: "white", 
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        <h2 style={{ color: "#333", marginBottom: "15px" }}>Welcome to the Load Posting System</h2>
        <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.6" }}>A platform connecting Shippers and Truckers for efficient load management.</p>
        <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.6" }}>Shippers can post loads, and Truckers can bid on them based on their preferences.</p>
        <p style={{ color: "#777", fontSize: "14px", marginTop: "20px" }}>Designed by Aditya</p>
      </div>
    </div>
  );
}
