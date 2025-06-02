import React from 'react';
import { APP_LOGOUT_REDIRECT } from "../../assets/config";
import '../../styles/UnauthorizedAccess.css';

const UnauthorizedAccess = () => {
    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <div className="logo-container">
                    <img src="/1FBlack.svg" alt="1Finance Logo" className="welcome-logo" />
                </div>
                <div className="welcome-unauthenticated">
                    <div className="auth-error">
                        <div className="error-badge">401</div>
                        <h2>Access Restricted</h2>
                    </div>
                    <div className="welcome-info">
                        <div className="info-icon">🔒</div>
                        <div className="info-content">
                            <h3>Authentication Required</h3>
                            <p>Please log in to access the Locker Management System.</p>
                        </div>
                    </div>
                    <button
                        className="login-button"
                        onClick={() => {
                            window.location.href = `${APP_LOGOUT_REDIRECT}`;
                        }}
                    >
                        <span className="button-icon">→</span>
                        <span>Login to Access</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedAccess;
