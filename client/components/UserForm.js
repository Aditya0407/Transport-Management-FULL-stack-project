import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  role: Yup.string().oneOf(['shipper', 'trucker', 'admin'], 'Invalid role').required('Role is required'),
  // Trucker specific fields
  accidents: Yup.number().when('role', {
    is: 'trucker',
    then: Yup.number().min(0, 'Cannot be negative').required('Required for truckers')
  }),
  theftComplaints: Yup.number().when('role', {
    is: 'trucker',
    then: Yup.number().min(0, 'Cannot be negative').required('Required for truckers')
  }),
  truckAge: Yup.number().when('role', {
    is: 'trucker',
    then: Yup.number().min(0, 'Cannot be negative').required('Required for truckers')
  }),
  driversLicenseYears: Yup.number().when('role', {
    is: 'trucker',
    then: Yup.number().min(0, 'Cannot be negative').required('Required for truckers')
  }),
});

const formStyles = {
  formContainer: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
    maxWidth: '600px',
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
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  errorAlert: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '15px'
  },
  formColumn: {
    flex: '1 0 calc(50% - 15px)',
    minWidth: '200px',
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: 'black'
  },
  truckerFields: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '4px',
    marginTop: '15px',
    marginBottom: '15px',
    border: '1px solid #eee'
  },
  truckerFieldsTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333'
  }
};

export default function UserForm({ onSubmit }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await onSubmit(values);
      resetForm();
      setSuccess('User created successfully!');
    } catch (err) {
      setError(err.message || 'Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={formStyles.formContainer}>
      <h3 style={formStyles.formTitle}>Create New User</h3>
      
      {error && <div style={formStyles.errorAlert}>{error}</div>}
      {success && <div style={formStyles.successMessage}>{success}</div>}
      
      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
          role: 'shipper',
          accidents: 0,
          theftComplaints: 0,
          truckAge: 0,
          driversLicenseYears: 0
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form>
            <div style={formStyles.formRow}>
              <div style={formStyles.formColumn}>
                <div style={formStyles.formGroup}>
                  <label htmlFor="name" style={formStyles.label}>Full Name</label>
                  <Field 
                    type="text" 
                    id="name" 
                    name="name" 
                    style={formStyles.input} 
                    placeholder="Enter full name"
                  />
                  <ErrorMessage name="name" component="div" style={formStyles.errorMessage} />
                </div>
              </div>
              
              <div style={formStyles.formColumn}>
                <div style={formStyles.formGroup}>
                  <label htmlFor="email" style={formStyles.label}>Email Address</label>
                  <Field 
                    type="email" 
                    id="email" 
                    name="email" 
                    style={formStyles.input} 
                    placeholder="Enter email address"
                  />
                  <ErrorMessage name="email" component="div" style={formStyles.errorMessage} />
                </div>
              </div>
            </div>
            
            <div style={formStyles.formRow}>
              <div style={formStyles.formColumn}>
                <div style={formStyles.formGroup}>
                  <label htmlFor="password" style={formStyles.label}>Password</label>
                  <Field 
                    type="password" 
                    id="password" 
                    name="password" 
                    style={formStyles.input} 
                    placeholder="Enter password"
                  />
                  <ErrorMessage name="password" component="div" style={formStyles.errorMessage} />
                </div>
              </div>
              
              <div style={formStyles.formColumn}>
                <div style={formStyles.formGroup}>
                  <label htmlFor="role" style={formStyles.label}>User Role</label>
                  <Field 
                    as="select" 
                    id="role" 
                    name="role" 
                    style={formStyles.select}
                  >
                    <option value="shipper">Shipper</option>
                    <option value="trucker">Trucker</option>
                    <option value="admin">Admin</option>
                  </Field>
                  <ErrorMessage name="role" component="div" style={formStyles.errorMessage} />
                </div>
              </div>
            </div>
            
            {values.role === 'trucker' && (
              <div style={formStyles.truckerFields}>
                <h4 style={formStyles.truckerFieldsTitle}>Trucker Eligibility Information</h4>
                <div style={formStyles.formRow}>
                  <div style={formStyles.formColumn}>
                    <div style={formStyles.formGroup}>
                      <label htmlFor="accidents" style={formStyles.label}>Number of Accidents</label>
                      <Field 
                        type="number" 
                        id="accidents" 
                        name="accidents" 
                        style={formStyles.input} 
                        min="0"
                      />
                      <ErrorMessage name="accidents" component="div" style={formStyles.errorMessage} />
                    </div>
                  </div>
                  
                  <div style={formStyles.formColumn}>
                    <div style={formStyles.formGroup}>
                      <label htmlFor="theftComplaints" style={formStyles.label}>Theft Complaints</label>
                      <Field 
                        type="number" 
                        id="theftComplaints" 
                        name="theftComplaints" 
                        style={formStyles.input} 
                        min="0"
                      />
                      <ErrorMessage name="theftComplaints" component="div" style={formStyles.errorMessage} />
                    </div>
                  </div>
                </div>
                
                <div style={formStyles.formRow}>
                  <div style={formStyles.formColumn}>
                    <div style={formStyles.formGroup}>
                      <label htmlFor="truckAge" style={formStyles.label}>Truck Age (years)</label>
                      <Field 
                        type="number" 
                        id="truckAge" 
                        name="truckAge" 
                        style={formStyles.input} 
                        min="0"
                      />
                      <ErrorMessage name="truckAge" component="div" style={formStyles.errorMessage} />
                    </div>
                  </div>
                  
                  <div style={formStyles.formColumn}>
                    <div style={formStyles.formGroup}>
                      <label htmlFor="driversLicenseYears" style={formStyles.label}>Driver's License (years held)</label>
                      <Field 
                        type="number" 
                        id="driversLicenseYears" 
                        name="driversLicenseYears" 
                        style={formStyles.input} 
                        min="0"
                      />
                      <ErrorMessage name="driversLicenseYears" component="div" style={formStyles.errorMessage} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              type="submit" 
              style={formStyles.submitButton} 
              disabled={isSubmitting || submitting}
            >
              {submitting ? 'Creating User...' : 'Create User'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}