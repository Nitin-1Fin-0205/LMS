import axios from 'axios';
import { API_URL } from '../assets/config';

const userApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

userApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// userApi.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response?.status === 401) {
//             localStorage.removeItem('authToken');
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

export const fetchUsers = async (page = 1, limit = 10, search = '') => {
    const params = { page, limit };
    if (search) {
        params.search = search;
    }

    const response = await userApi.get('/users/list', { params });
    return response.data;
};

export const updateUserRole = async (userId, role) => {
    const response = await userApi.put(`/users/${userId}/role`, { role });
    return response.data;
};

export const getUserStats = async () => {
    const response = await userApi.get('/users/stats');
    return response.data;
};

export default {
    fetchUsers,
    updateUserRole,
    getUserStats
};
