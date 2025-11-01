import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import './ErrorPage.css';

/**
 * ErrorPage Component
 * Displayed when a critical system error occurs
 */
function ErrorPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h1 className="error-title">Oops! Something Went Wrong</h1>
        <p className="error-message">
          We're experiencing technical difficulties with our system.
          <br />
          Please try again later.
        </p>
        <Button 
          onClick={handleGoHome}
          variant="primary"
          className="error-home-button"
        >
          Go Back to Home
        </Button>
      </div>
    </div>
  );
}

export default ErrorPage;
