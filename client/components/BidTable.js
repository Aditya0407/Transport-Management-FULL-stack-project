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
  accepted: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
  },
  rejected: {
    backgroundColor: '#FFCDD2',
    color: '#B71C1C',
  },
  expired: {
    backgroundColor: '#E0E0E0',
    color: '#616161',
  },
  noData: {
    textAlign: 'center',
    padding: '20px',
    color: '#757575',
    fontStyle: 'italic',
  },
  truckerInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  truckerName: {
    fontWeight: 'bold',
  },
  truckerEmail: {
    fontSize: '12px',
    color: '#757575',
  },
  eligibilityBadge: {
    padding: '3px 8px',
    borderRadius: '10px',
    display: 'inline-block',
    fontSize: '11px',
    marginLeft: '5px',
  },
  eligible: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
  },
  ineligible: {
    backgroundColor: '#FFCDD2',
    color: '#B71C1C',
  },
  actionButton: {
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  rejectButton: {
    backgroundColor: '#F44336',
    color: 'white',
    marginLeft: '8px',
  },
};

export default function BidTable({ bids, onAcceptBid, isShipper }) {
  const [sortConfig, setSortConfig] = useState({
    key: 'amount',
    direction: 'asc',
  });

  // Handle empty bids array
  if (!bids || bids.length === 0) {
    return (
      <div style={tableStyles.container}>
        <div style={tableStyles.noData}>No bids available for this load</div>
      </div>
    );
  }

  const sortedBids = [...bids].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return tableStyles.pending;
      case 'accepted':
        return tableStyles.accepted;
      case 'rejected':
        return tableStyles.rejected;
      case 'expired':
        return tableStyles.expired;
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
    <div style={tableStyles.container}>
      <table style={tableStyles.table}>
        <thead style={tableStyles.tableHeader}>
          <tr>
            <th 
              style={tableStyles.th} 
              onClick={() => requestSort('trucker.name')}
            >
              Trucker
              {sortConfig.key === 'trucker.name' && (
                <span style={tableStyles.sortIcon}>
                  {sortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
            <th 
              style={tableStyles.th} 
              onClick={() => requestSort('amount')}
            >
              Bid Amount
              {sortConfig.key === 'amount' && (
                <span style={tableStyles.sortIcon}>
                  {sortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
            <th 
              style={tableStyles.th} 
              onClick={() => requestSort('createdAt')}
            >
              Bid Date
              {sortConfig.key === 'createdAt' && (
                <span style={tableStyles.sortIcon}>
                  {sortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
            <th 
              style={tableStyles.th} 
              onClick={() => requestSort('status')}
            >
              Status
              {sortConfig.key === 'status' && (
                <span style={tableStyles.sortIcon}>
                  {sortConfig.direction === 'asc' ? '▲' : '▼'}
                </span>
              )}
            </th>
            <th style={tableStyles.th}>Notes</th>
            {isShipper && <th style={tableStyles.th}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedBids.map((bid) => (
            <tr key={bid._id}>
              <td style={tableStyles.td}>
                <div style={tableStyles.truckerInfo}>
                  <span style={tableStyles.truckerName}>
                    {bid.trucker?.name || 'Unknown'}
                    <span 
                      style={{
                        ...tableStyles.eligibilityBadge,
                        ...(bid.truckerEligible ? tableStyles.eligible : tableStyles.ineligible)
                      }}
                    >
                      {bid.truckerEligible ? 'Eligible' : 'Ineligible'}
                    </span>
                  </span>
                  <span style={tableStyles.truckerEmail}>{bid.trucker?.email || 'No email'}</span>
                </div>
              </td>
              <td style={tableStyles.td}>${bid.amount.toFixed(2)}</td>
              <td style={tableStyles.td}>{formatDate(bid.createdAt)}</td>
              <td style={tableStyles.td}>
                <span style={{ ...tableStyles.statusBadge, ...getStatusStyle(bid.status) }}>
                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                </span>
              </td>
              <td style={tableStyles.td}>{bid.notes || 'No notes'}</td>
              {isShipper && (
                <td style={tableStyles.td}>
                  {bid.status === 'pending' && bid.truckerEligible && (
                    <button
                      style={{ ...tableStyles.actionButton, ...tableStyles.acceptButton }}
                      onClick={() => onAcceptBid(bid._id)}
                    >
                      Accept Bid
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}