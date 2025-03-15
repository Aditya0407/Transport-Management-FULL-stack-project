import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';

const ledgerStyles = {
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
  balanceCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #BBDEFB',
    padding: '20px',
    marginBottom: '20px',
  },
  balanceTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1565C0',
  },
  balanceAmount: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1565C0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
  },
  th: {
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333',
    borderBottom: '2px solid #ddd',
  },
  td: {
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
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
  completed: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
  },
  failed: {
    backgroundColor: '#FFCDD2',
    color: '#B71C1C',
  },
  payment: {
    backgroundColor: '#FFCDD2',
    color: '#B71C1C',
  },
  payout: {
    backgroundColor: '#C8E6C9',
    color: '#2E7D32',
  },
  noData: {
    textAlign: 'center',
    padding: '20px',
    color: '#757575',
    fontStyle: 'italic',
  },
};

export default function TruckerLedger() {
  const router = useRouter();
  const { authState } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authState.token) return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/user`, {
          headers: {
            'x-auth-token': authState.token,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error(err);
        setError('Error loading transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [authState.token]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return ledgerStyles.pending;
      case 'completed':
        return ledgerStyles.completed;
      case 'failed':
        return ledgerStyles.failed;
      default:
        return {};
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'payment':
        return ledgerStyles.payment;
      case 'payout':
        return ledgerStyles.payout;
      default:
        return {};
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div style={ledgerStyles.container}>
      <div style={ledgerStyles.header}>
        <h1 style={ledgerStyles.title}>Financial Ledger</h1>
        <p style={ledgerStyles.subtitle}>
          Track your earnings and payments
        </p>
      </div>

      {authState.user && (
        <div style={ledgerStyles.balanceCard}>
          <div style={ledgerStyles.balanceTitle}>Current Balance</div>
          <div style={ledgerStyles.balanceAmount}>{formatCurrency(authState.user.balance || 0)}</div>
        </div>
      )}

      <div style={ledgerStyles.section}>
        <h2 style={ledgerStyles.sectionTitle}>Transaction History</h2>
        <div style={ledgerStyles.card}>
          {loading ? (
            <p>Loading transactions...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : transactions.length === 0 ? (
            <div style={ledgerStyles.noData}>No transactions found</div>
          ) : (
            <table style={ledgerStyles.table}>
              <thead style={ledgerStyles.tableHeader}>
                <tr>
                  <th style={ledgerStyles.th}>Date</th>
                  <th style={ledgerStyles.th}>Description</th>
                  <th style={ledgerStyles.th}>Type</th>
                  <th style={ledgerStyles.th}>Amount</th>
                  <th style={ledgerStyles.th}>Status</th>
                  <th style={ledgerStyles.th}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td style={ledgerStyles.td}>{formatDate(transaction.createdAt)}</td>
                    <td style={ledgerStyles.td}>{transaction.description}</td>
                    <td style={ledgerStyles.td}>
                      <span style={{
                        ...ledgerStyles.statusBadge,
                        ...getTypeStyle(transaction.type)
                      }}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </td>
                    <td style={ledgerStyles.td}>{formatCurrency(transaction.amount)}</td>
                    <td style={ledgerStyles.td}>
                      <span style={{
                        ...ledgerStyles.statusBadge,
                        ...getStatusStyle(transaction.status)
                      }}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td style={ledgerStyles.td}>{transaction.reference || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}