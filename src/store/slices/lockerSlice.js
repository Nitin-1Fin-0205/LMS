import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../assets/config';

export const fetchLockerMaster = createAsyncThunk(
    'locker/fetchLockerMaster',
    async (centerId, { rejectWithValue }) => {
        try {
            if (!API_URL) {
                throw new Error('API URL is not configured');
            }

            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/lockers/locker-master?lockerCenterId=${centerId}&customerId=1`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch locker data');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const lockerSlice = createSlice({
    name: 'locker',
    initialState: {
        lockerData: null,
        loading: false,
        error: null
    },
    reducers: {
        clearLockerData: (state) => {
            state.lockerData = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLockerMaster.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLockerMaster.fulfilled, (state, action) => {
                state.loading = false;
                state.lockerData = action.payload;
            })
            .addCase(fetchLockerMaster.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearLockerData } = lockerSlice.actions;
export default lockerSlice.reducer;
