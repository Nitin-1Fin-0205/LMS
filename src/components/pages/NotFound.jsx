import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import '../../styles/UnauthorizedAccess.css';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <div className="logo-container">
                    <img src="/1FBlack.svg" alt="1Finance Logo" className="welcome-logo" />
                </div>
                <div className="welcome-unauthenticated">
                    <div className="auth-error">
                        <div className="error-badge">404</div>
                        <h2>Page Not Found</h2>
                    </div>
                    <div className="welcome-info">                    <div className="info-icon">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </div>
                        <div className="info-content">
                            <h3>Page Unavailable</h3>
                            <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                        </div>
                    </div>
                    <div className="error-actions">
                        <button
                            className="login-button secondary-button"
                            onClick={() => navigate(-1)}
                        >
                            <span className="button-icon">
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </span>
                            <span>Go Back</span>
                        </button>
                        <button
                            className="login-button"
                            onClick={() => navigate(ROUTES.HomePage)}
                        >
                            <span className="button-icon">
                                <FontAwesomeIcon icon={faHome} />
                            </span>
                            <span>Go to Homepage</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
