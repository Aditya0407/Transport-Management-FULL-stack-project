import React, { useState } from 'react';

const tableStyles = {
  container: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
    margin: '20px 0',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    position: 'sticky',
    top: 0,
  },
  th: {
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333',
    borderBottom: '2px solid #ddd',
    cursor: 'pointer',
  },
  td: {
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
    color: '#333',
  },
  sortIcon: {
    marginLeft: '5px',
    fontSize: '12px',
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
  noData: {
    textAlign: 'center',
    padding: '20px',
    color: '#757575',
    fontStyle: 'italic',
  },
  dimensionCell: {
    whiteSpace: 'nowrap',
  },
  shipperInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  shipperName: {
    fontWeight: 'bold',
  },
  shipperEmail: {
    fontSize: '12px',
    color: '#757575',
  },
  tableRow: {
    transition: 'background-color 0.2s',
  },
  tableRowHover: {
    backgroundColor: '#f9f9f9',
  },
};

export default function LoadTable({ loads, onRowClick }) {
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc',
  });
  const [hoveredRow, setHoveredRow] = useState(null);

  // Get row style based on hover state
  const getRowStyle = (loadId) => {
    return {
      ...tableStyles.tableRow,
      ...(hoveredRow === loadId ? tableStyles.tableRowHover : {}),
      cursor: onRowClick ? 'pointer' : 'default'
    };
  };

  // Handle empty loads array
  if (!loads || loads.length === 0) {
    return (
      <div style={tableStyles.container}>
        <div style={tableStyles.noData}>No loads available</div>
      </div>
    );
  }

  // Sort function
  const sortedLoads = [...loads].sort((a, b) => {
    if (sortConfig.key === 'dimensions') {
      // Sort by volume (length * width * height)
      const volumeA = a.dimensions.length * a.dimensions.width * a.dimensions.height;
      const volumeB = b.dimensions.length * b.dimensions.width * b.dimensions.height;
      return sortConfig.direction === 'asc' ? volumeA - volumeB : volumeB - volumeA;
    } else if (sortConfig.key === 'shipper') {
      // Sort by shipper name
      return sortConfig.direction === 'asc'
        ? a.shipper.name.localeCompare(b.shipper.name)
        : b.shipper.name.localeCompare(a.shipper.name);
    } else {
      // Sort by other fields
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }
  });

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort direction indicator
  const getSortDirectionIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    let style = { ...tableStyles.statusBadge };
    
    switch (status.toLowerCase()) {
      case 'pending':
        style = { ...style, ...tableStyles.pending };
        break;
      case 'in transit':
      case 'intransit':
        style = { ...style, ...tableStyles.inTransit };
        break;
      case 'delivered':
        style = { ...style, ...tableStyles.delivered };
        break;
      case 'cancelled':
        style = { ...style, ...tableStyles.cancelled };
        break;
      default:
        style = { ...style, ...tableStyles.pending };
    }
    
    return <span style={style}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  return (
    <div style={tableStyles.container}>
      <table style={tableStyles.table}>
        <thead style={tableStyles.tableHeader}>
          <tr>
            <th style={tableStyles.th} onClick={() => requestSort('shipper')}>
              Shipper{getSortDirectionIndicator('shipper')}
            </th>
            <th style={tableStyles.th} onClick={() => requestSort('origin')}>
              Origin{getSortDirectionIndicator('origin')}
            </th>
            <th style={tableStyles.th} onClick={() => requestSort('destination')}>
              Destination{getSortDirectionIndicator('destination')}
            </th>
            <th style={tableStyles.th} onClick={() => requestSort('shipmentDate')}>
              Shipment Date{getSortDirectionIndicator('shipmentDate')}
            </th>
            <th style={tableStyles.th} onClick={() => requestSort('weight')}>
              Weight (kg){getSortDirectionIndicator('weight')}
            </th>
            <th style={tableStyles.th} onClick={() => requestSort('dimensions')}>
              Dimensions (L×W×H){getSortDirectionIndicator('dimensions')}
            </th>
            <th style={tableStyles.th} onClick={() => requestSort('status')}>
              Status{getSortDirectionIndicator('status')}
            </th>
            <th style={tableStyles.th} onClick={() => requestSort('createdAt')}>
              Created{getSortDirectionIndicator('createdAt')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedLoads.map((load, index) => (
            <tr 
              key={load._id} 
              style={getRowStyle(load._id)}
              onMouseEnter={() => setHoveredRow(load._id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => onRowClick && onRowClick(load._id)}
            >
              <td style={tableStyles.td}>
                <div style={tableStyles.shipperInfo}>
                  <span style={tableStyles.shipperName}>{load.shipper.name}</span>
                  <span style={tableStyles.shipperEmail}>{load.shipper.email}</span>
                </div>
              </td>
              <td style={tableStyles.td}>{load.origin}</td>
              <td style={tableStyles.td}>{load.destination}</td>
              <td style={tableStyles.td}>{formatDate(load.shipmentDate)}</td>
              <td style={tableStyles.td}>{load.weight.toLocaleString()}</td>
              <td style={tableStyles.dimensionCell}>
                {`${load.dimensions.length} × ${load.dimensions.width} × ${load.dimensions.height}`}
              </td>
              <td style={tableStyles.td}>{renderStatusBadge(load.status)}</td>
              <td style={tableStyles.td}>{formatDate(load.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}