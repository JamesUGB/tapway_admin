// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { login } from '../services/auth';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    setLoading(true);
    const { success, error, user } = await login(values.email, values.password);
    
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError(error || 'Login failed. Please try again.');
    }
    setLoading(false);
    setSubmitting(false);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: '400px' }}>
        <h2 className="text-center mb-4">Admin Login</h2>
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}
        
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  placeholder="admin@example.com"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger small"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                  placeholder="••••••••"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-danger small"
                />
              </div>
              
              <Button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isSubmitting || loading}
              >
                {loading ? <LoadingSpinner small /> : 'Login'}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}