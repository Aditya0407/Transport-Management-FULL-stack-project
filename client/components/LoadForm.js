import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  origin: Yup.string().required('Required'),
  destination: Yup.string().required('Required'),
  shipmentDate: Yup.date().required('Required'),
  weight: Yup.number().required('Required'),
  dimensions: Yup.object().shape({
    length: Yup.number().required('Required'),
    width: Yup.number().required('Required'),
    height: Yup.number().required('Required'),
  })
});

const formStyles = {
  formContainer: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid #e0e0e0',
    maxWidth: '600px',
    margin: '0 auto'
  },
  formTitle: {
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '24px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
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
  dimensionsContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px'
  },
  dimensionInput: {
    flex: 1,
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
    padding: '12px',
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};

export default function LoadForm({ onSubmit }) {
  return (
    <div style={formStyles.formContainer}>
      <h2 style={formStyles.formTitle}>Post a New Load</h2>
      <Formik
        initialValues={{
          origin: '',
          destination: '',
          shipmentDate: '',
          weight: '',
          dimensions: {
            length: '',
            width: '',
            height: '',
          }
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <div style={formStyles.formGroup}>
              <label style={formStyles.label}>Origin</label>
              <Field type="text" name="origin" style={formStyles.input} />
              <ErrorMessage name="origin" component="div" style={formStyles.errorMessage} />
            </div>
            <div style={formStyles.formGroup}>
              <label style={formStyles.label}>Destination</label>
              <Field type="text" name="destination" style={formStyles.input} />
              <ErrorMessage name="destination" component="div" style={formStyles.errorMessage} />
            </div>
            <div style={formStyles.formGroup}>
              <label style={formStyles.label}>Shipment Date</label>
              <Field type="date" name="shipmentDate" style={formStyles.input} />
              <ErrorMessage name="shipmentDate" component="div" style={formStyles.errorMessage} />
            </div>
            <div style={formStyles.formGroup}>
              <label style={formStyles.label}>Weight (kg)</label>
              <Field type="number" name="weight" style={formStyles.input} />
              <ErrorMessage name="weight" component="div" style={formStyles.errorMessage} />
            </div>
            <div style={formStyles.formGroup}>
              <label style={formStyles.label}>Dimensions (L x W x H)</label>
              <div style={formStyles.dimensionsContainer}>
                <Field type="number" name="dimensions.length" placeholder="Length" style={formStyles.dimensionInput} />
                <Field type="number" name="dimensions.width" placeholder="Width" style={formStyles.dimensionInput} />
                <Field type="number" name="dimensions.height" placeholder="Height" style={formStyles.dimensionInput} />
              </div>
              <ErrorMessage name="dimensions.length" component="div" style={formStyles.errorMessage} />
              <ErrorMessage name="dimensions.width" component="div" style={formStyles.errorMessage} />
              <ErrorMessage name="dimensions.height" component="div" style={formStyles.errorMessage} />
            </div>
            <button type="submit" style={formStyles.submitButton}>Post Load</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
