import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from "../../constants/routes";
import '../../styles/UnauthorizedAccess.css';

const Forbidden = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <div className="logo-container">
                    <img src="/1FBlack.svg" alt="1Finance Logo" className="welcome-logo" />
                </div>
                <div className="welcome-unauthenticated">
                    <div className="auth-error">
                        <div className="error-badge">403</div>
                        <h2>Access Denied</h2>
                    </div>
                    <div className="welcome-info">
                        <div className="info-icon">⚠️</div>
                        <div className="info-content">
                            <h3>Insufficient Permissions</h3>
                            <p>You don't have the necessary permissions to access this page.</p>
                        </div>
                    </div>
                    <button
                        className="login-button"
                        onClick={() => navigate(ROUTES.HomePage)}
                    >
                        <span className="button-icon">←</span>
                        <span>Return to Dashboard</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Forbidden;