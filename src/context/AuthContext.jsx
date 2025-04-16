import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../assets/config';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        role: null,
        isLoading: true
    });

    const validateToken = async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setAuth({ isAuthenticated: false, role: null, isLoading: false });
            return;
        }

        try {
            // For Testing purposes, we are using a mock API endpoint to validate the token.
            const mockResponse = {
                data: {
                    valid: true,
                    role: ROLES.ADMIN
                }
            };
            const response = mockResponse;

            // const response = await axios.get(`${API_URL}/api/auth/validate`, {
            //     headers: {
            //         Authorization: `Bearer ${token}`
            //     }
            // });

            if (response.data.valid) {
                setAuth({
                    isAuthenticated: true,
                    role: response.data.role,
                    isLoading: false
                });
            } else {
                localStorage.removeItem('authToken');
                setAuth({ isAuthenticated: false, role: null, isLoading: false });
            }
        } catch (error) {
            localStorage.removeItem('authToken');
            setAuth({ isAuthenticated: false, role: null, isLoading: false });
        }
    };

    useEffect(() => {
        validateToken();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, validateToken }}>
            {!auth.isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);