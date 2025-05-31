import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../assets/config';
import { ROLES, getRoleFromId } from '../constants/roles';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        role: null,
        isLoading: true,
        userName: null
    }); const validateToken = async () => {
        const token = localStorage.getItem('authToken');

        if (!token) {
            setAuth({ isAuthenticated: false, role: null, isLoading: false, userName: null });
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/users/validate`, '', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*'
                }
            });

            if (response.data.is_valid) {
                const role = getRoleFromId(response.data.role_id);
                setAuth({
                    isAuthenticated: true,
                    role: role,
                    userName: response.data.name,
                    userId: response.data.user_code,
                    isLoading: false
                });
            } else {
                localStorage.removeItem('authToken');
                setAuth({ isAuthenticated: false, role: null, isLoading: false, userName: null });
            }
        } catch (error) {
            localStorage.removeItem('authToken');
            setAuth({ isAuthenticated: false, role: null, isLoading: false, userName: null });
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