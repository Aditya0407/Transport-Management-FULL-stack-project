import React from 'react';
import LoadTable from '../components/LoadTable';

export default function DemoTable() {
  // Sample data from the API response
  const sampleLoads = [
    {
      "dimensions": {
        "length": 10,
        "width": 5,
        "height": 5
      },
      "_id": "67d2bc500632b85c6745ccf9",
      "shipper": {
        "_id": "67d2bc4f0632b85c6745ccef",
        "name": "Shipper One",
        "email": "shipper1@example.com"
      },
      "origin": "New York, NY",
      "destination": "Los Angeles, CA",
      "shipmentDate": "2025-03-20T11:06:56.332Z",
      "weight": 5000,
      "status": "pending",
      "createdAt": "2025-03-13T11:06:56.336Z",
      "__v": 0,
      "winningBid": "67d2bc500632b85c6745cd00"
    },
    {
      "dimensions": {
        "length": 8,
        "width": 4,
        "height": 4
      },
      "_id": "67d2bc500632b85c6745ccfa",
      "shipper": {
        "_id": "67d2bc4f0632b85c6745ccf0",
        "name": "Shipper Two",
        "email": "shipper2@example.com"
      },
      "origin": "Chicago, IL",
      "destination": "Houston, TX",
      "shipmentDate": "2025-03-20T11:06:56.332Z",
      "weight": 3500,
      "status": "pending",
      "createdAt": "2025-03-13T11:06:56.337Z",
      "__v": 0,
      "winningBid": "67d2bc500632b85c6745cd02"
    },
    {
      "dimensions": {
        "length": 15,
        "width": 8,
        "height": 7
      },
      "_id": "67d2bc500632b85c6745ccfb",
      "shipper": {
        "_id": "67d2bc4f0632b85c6745ccef",
        "name": "Shipper One",
        "email": "shipper1@example.com"
      },
      "origin": "Miami, FL",
      "destination": "Seattle, WA",
      "shipmentDate": "2025-03-20T11:06:56.332Z",
      "weight": 7500,
      "status": "pending",
      "createdAt": "2025-03-13T11:06:56.337Z",
      "__v": 0,
      "winningBid": "67d2bc500632b85c6745cd04"
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>Load Data Visualization</h1>
      <p style={{ marginBottom: '20px', textAlign: 'center' }}>
        Below is a demonstration of how the same JSON data can be displayed in a more readable tabular format.
      </p>
      
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '10px', color: '#333' }}>Tabular Format (Improved Visualization)</h2>
        <LoadTable loads={sampleLoads} />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '10px', color: '#333' }}>Raw JSON Format (Original)</h2>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          overflowX: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          color: '#333',
          border: '1px solid #ddd'
        }}>
          {JSON.stringify(sampleLoads, null, 2)}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p>The tabular format provides:</p>
        <ul style={{ display: 'inline-block', textAlign: 'left' }}>
          <li>Better readability with organized columns</li>
          <li>Sortable data (click on column headers)</li>
          <li>Visual status indicators</li>
          <li>Formatted dates and numbers</li>
          <li>Responsive design that works on all screen sizes</li>
        </ul>
      </div>
    </div>
  );
}