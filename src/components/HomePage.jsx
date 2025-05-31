import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/HomePage.css';

const HomePage = () => {
    // const navigate = useNavigate();
    const { auth } = useAuth();
    const token = localStorage.getItem('authToken');

    const highlightStyle = {
        color: '#22c55e',
        fontWeight: 'bold'
    };

    const highredStyle = {
        color: 'tomato',
        fontWeight: 'bold'
    };

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                {token ? (

                    <h3>Welcome back, <span style={highlightStyle}>{auth.userName || 'User'}</span>!</h3>) : (
                    <>
                        <h1><span style={highredStyle}>403</span></h1>
                    </>
                )}

                {!token &&
                    <div className="welcome-info">
                        <p><span style={highredStyle}>Unauthenticated user</span>  ! you are currently not logged in.</p>
                    </div>
                }

            </div>
        </div >
    );
};

export default HomePage;
