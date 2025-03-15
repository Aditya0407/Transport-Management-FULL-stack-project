import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../context/AuthContext';

const financeStyles = {
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
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
  },
  balanceAmount: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#28a745',
  },
  balanceLabel: {
    fontSize: '16px',
    color: '#6c757d',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px',
    borderBottom: '2px solid #ddd',
    color: '#333',
  },
  td: {
    padding: '10px',
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
  cancelled: {
    backgroundColor: '#E0E0E0',
    color: '#616161',
  },
  payment: {
    color: '#d32f2f',
  },
  payout: {
    color: '#388e3c',
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  summaryCard: {
    flex: '1',
    margin: '0 10px',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  summaryTitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
};

export default function TruckerFinances() {
  const router = useRouter();
  const { authState } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    thisMonthEarnings: 0,
  });

  useEffect(() => {
    if (!authState.token) return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/user`, {
          headers: {
            'x-auth-token': authState.token,
          }
        });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const data = await res.json();
        setTransactions(data);

        // Calculate summary
        const totalEarnings = data
          .filter(t => t.type === 'payout' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        const pendingPayments = data
          .filter(t => t.type === 'payout' && t.status === 'pending')
          .reduce((sum, t) => sum + t.amount, 0);

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthEarnings = data
          .filter(t => {
            const date = new Date(t.createdAt);
            return t.type === 'payout' && 
                   t.status === 'completed' && 
                   date.getMonth() === currentMonth &&
                   date.getFullYear() === currentYear;
          })
          .reduce((sum, t) => sum + t.amount, 0);

        setSummary({
          totalEarnings,
          pendingPayments,
          thisMonthEarnings,
        });
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
        return financeStyles.pending;
      case 'completed':
        return financeStyles.completed;
      case 'failed':
        return financeStyles.failed;
      case 'cancelled':
        return financeStyles.cancelled;
      default:
        return {};
    }
  };

  const getAmountStyle = (type) => {
    return type === 'payout' ? financeStyles.payout : financeStyles.payment;
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
    <div style={financeStyles.container}>
      <div style={financeStyles.header}>
        <h1 style={financeStyles.title}>Financial Management</h1>
        <p style={financeStyles.subtitle}>
          Track your earnings, payments, and transaction history
        </p>
      </div>

      {authState.user && (
        <div style={financeStyles.balanceCard}>
          <div>
            <div style={financeStyles.balanceLabel}>Current Balance</div>
            <div style={financeStyles.balanceAmount}>
              {formatCurrency(authState.user.balance)}
            </div>
          </div>
          <div>
            {/* Future: Add withdraw button or payment method setup */}
          </div>
        </div>
      )}

      <div style={financeStyles.summary}>
        <div style={financeStyles.summaryCard}>
          <div style={financeStyles.summaryTitle}>Total Earnings</div>
          <div style={financeStyles.summaryValue}>{formatCurrency(summary.totalEarnings)}</div>
        </div>
        <div style={financeStyles.summaryCard}>
          <div style={financeStyles.summaryTitle}>Pending Payments</div>
          <div style={financeStyles.summaryValue}>{formatCurrency(summary.pendingPayments)}</div>
        </div>
        <div style={financeStyles.summaryCard}>
          <div style={financeStyles.summaryTitle}>This Month</div>
          <div style={financeStyles.summaryValue}>{formatCurrency(summary.thisMonthEarnings)}</div>
        </div>
      </div>

      <div style={financeStyles.section}>
        <h2 style={financeStyles.sectionTitle}>Transaction History</h2>
        {loading ? (
          <p>Loading transactions...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <div style={financeStyles.card}>
            <table style={financeStyles.table}>
              <thead>
                <tr>
                  <th style={financeStyles.th}>Date</th>
                  <th style={financeStyles.th}>Description</th>
                  <th style={financeStyles.th}>Amount</th>
                  <th style={financeStyles.th}>Type</th>
                  <th style={financeStyles.th}>Status</th>
                  <th style={financeStyles.th}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction._id}>
                    <td style={financeStyles.td}>{formatDate(transaction.createdAt)}</td>
                    <td style={financeStyles.td}>{transaction.description}</td>
                    <td style={{...financeStyles.td, ...getAmountStyle(transaction.type)}}>
                      {transaction.type === 'payout' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td style={financeStyles.td}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </td>
                    <td style={financeStyles.td}>
                      <span style={{
                        ...financeStyles.statusBadge,
                        ...getStatusStyle(transaction.status)
                      }}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td style={financeStyles.td}>{transaction.reference || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}