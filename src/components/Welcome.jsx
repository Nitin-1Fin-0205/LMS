import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Welcome.css';

const Welcome = () => {
    // const navigate = useNavigate();
    const { auth } = useAuth();
    const token = localStorage.getItem('authToken');

    const highlightStyle = {
        color: '#22c55e',
        fontWeight: 'bold'
    };

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <h1>Welcome to LMS Dashboard</h1>
                <p>
                    {token ? (
                        <>
                            Welcome back, <span style={highlightStyle}>{auth.userName || 'User'}</span>!
                        </>
                    ) : (
                        'Please provide token to access the system'
                    )}
                </p>
                {!token &&
                    <div className="welcome-info">
                        <p>You will be automatically redirected once a valid token is provided</p>
                    </div>
                }

            </div>
        </div>
    );
};

export default Welcome;
