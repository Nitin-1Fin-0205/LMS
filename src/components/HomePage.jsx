import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/HomePage.css';
import { ROUTES } from '../constants/routes';

const HomePage = () => {
    const { auth } = useAuth();
    // const token = localStorage.getItem('authToken');

    // if (!token) {
    //     return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
    // }

    const highlightStyle = {
        color: '#22c55e',
        fontWeight: 'bold'
    };

    const highredStyle = {
        color: 'tomato',
        fontWeight: 'bold'
    }; return (
        <div className="welcome-container">
            <div className="welcome-content">
                <div className="logo-container">
                    <img src="/1FBlack.svg" alt="1Finance Logo" className="welcome-logo" />
                </div>

                <div className="welcome-authenticated">
                    <div className="welcome-header">
                        <h2>Welcome back, <span style={highlightStyle}>{auth.userName || 'User'}</span>!</h2>
                        <p className="subtitle">Locker Management System Dashboard</p>
                    </div>
                    {/* <div className="dashboard-stats">
                        <div className="stat-card">
                            <div className="stat-icon">🔐</div>
                            <div className="stat-content">
                                <h3>Manage Lockers</h3>
                                <p>Access and manage locker assignments</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <h3>Customer Details</h3>
                                <p>View and update customer information</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-content">
                                <h3>Track Access</h3>
                                <p>Monitor locker access and usage</p>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
