import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Bid amount is required')
    .positive('Amount must be positive'),
  notes: Yup.string()
});

const formStyles = {
  formContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
    maxWidth: '400px',
    margin: '0 auto'
  },
  formTitle: {
    color: '#333',
    marginBottom: '15px',
    fontSize: '18px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: 'black'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: 'black'
  },
  errorMessage: {
    color: '#d32f2f',
    fontSize: '14px',
    marginTop: '5px'
  },
  submitButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  eligibilityWarning: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  eligibilitySuccess: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px'
  }
};

export default function BidForm({ loadId, onSubmit, eligibilityStatus }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await onSubmit({ ...values, loadId });
      resetForm();
      setSuccess('Bid placed successfully!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Error placing bid');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={formStyles.formContainer}>
      <h3 style={formStyles.formTitle}>Place a Bid</h3>
      
      {eligibilityStatus !== undefined && (
        <div style={eligibilityStatus ? formStyles.eligibilitySuccess : formStyles.eligibilityWarning}>
          {eligibilityStatus 
            ? 'You are eligible to bid on this load.'
            : 'You are not eligible to bid on this load due to eligibility criteria.'}
        </div>
      )}
      
      {error && <div style={{ ...formStyles.eligibilityWarning, marginBottom: '15px' }}>{error}</div>}
      {success && <div style={{ ...formStyles.eligibilitySuccess, marginBottom: '15px' }}>{success}</div>}
      
      <Formik
        initialValues={{
          amount: '',
          notes: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div style={formStyles.formGroup}>
              <label htmlFor="amount" style={formStyles.label}>Bid Amount ($)</label>
              <Field 
                type="number" 
                id="amount" 
                name="amount" 
                style={formStyles.input} 
                placeholder="Enter your bid amount"
              />
              <ErrorMessage name="amount" component="div" style={formStyles.errorMessage} />
            </div>
            
            <div style={formStyles.formGroup}>
              <label htmlFor="notes" style={formStyles.label}>Notes (Optional)</label>
              <Field 
                as="textarea" 
                id="notes" 
                name="notes" 
                style={{...formStyles.input, height: '80px'}} 
                placeholder="Add any notes about your bid"
              />
              <ErrorMessage name="notes" component="div" style={formStyles.errorMessage} />
            </div>
            
            <button 
              type="submit" 
              style={formStyles.submitButton} 
              disabled={isSubmitting || submitting}
            >
              {submitting ? 'Submitting...' : 'Place Bid'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}