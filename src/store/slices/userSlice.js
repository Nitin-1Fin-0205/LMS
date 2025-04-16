import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../assets/config';

export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateUserRole = createAsyncThunk(
    'users/updateRole',
    async ({ userId, role }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.patch(
                `${API_URL}/api/users/${userId}/role`,
                { role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return { userId, role };
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        users: [],
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
                state.error = null;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                const { userId, role } = action.payload;
                const user = state.users.find(u => u.id === userId);
                if (user) {
                    user.role = role;
                }
            });
    },
});

export default userSlice.reducer;
