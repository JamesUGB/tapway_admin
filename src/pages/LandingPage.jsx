// src/pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import Button from '../components/common/Button';

export const LandingPage = () => {
  return (
    <div className="landing-page">
      <h1>Welcome to Tapway Admin</h1>
      <p>Manage your emergency response system efficiently</p>
      <Link to={ROUTES.LOGIN}>
        <Button variant="primary">Login to Dashboard</Button>
      </Link>
    </div>
  );
};