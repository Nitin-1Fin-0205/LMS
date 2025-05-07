import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../assets/config';
import axios from 'axios';
import { LockerDetailsModel, RentDetailsModel } from '../../models/LockerModel';

const initialState = {
    loading: false,
    error: null,
    lockerDetails: { ...LockerDetailsModel },
    rentDetails: { ...RentDetailsModel },
    plans: [],
    lockerData: null,
    mappedLockers: []
};

// Add fetchLockerDetails thunk
export const fetchLockerDetails = createAsyncThunk(
    'locker/fetchDetails',
    async (lockerId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`https://newuat.support-backend.onefin.app/lockers/locker-master?lockerCenterId=1`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status !== 200 || response.status !== 201) {
                throw new Error('Failed to fetch locker details');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch locker details');
        }
    }
);

// Add fetchLockerMaster thunk
export const fetchLockerMaster = createAsyncThunk(
    'locker/fetchMaster',
    async (centerId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/lockers/locker-master?lockerCenterId=${centerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            // Return error message string instead of object
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch locker master');
        }
    }
);

const lockerSlice = createSlice({
    name: 'locker',
    initialState,
    reducers: {
        clearLockerData: (state) => {
            state.lockerData = null;
            state.loading = false;
            state.error = null;
        },
        updateLockerDetails: (state, action) => {
            state.lockerDetails = {
                ...state.lockerDetails,
                ...action.payload
            };
        },
        updateRentDetails: (state, action) => {
            state.rentDetails = {
                ...state.rentDetails,
                ...action.payload
            };
        },
        setLockerData: (state, action) => {
            state.lockerData = action.payload;
        },
        updateNominees: (state, action) => {
            state.lockerDetails.nominees = action.payload;
        },
        clearAllLockerData: (state) => {
            Object.assign(state, initialState);
            localStorage.removeItem('customerState');
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
                state.error = null;
            })
            .addCase(fetchLockerMaster.rejected, (state, action) => {
                state.loading = false;
                // Store error message as string
                state.error = typeof action.payload === 'string' ? action.payload : 'Failed to load lockers';
            })
            .addCase(fetchLockerDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLockerDetails.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.lockerDetails) {
                    state.lockerDetails = {
                        ...state.lockerDetails,
                        ...action.payload.lockerDetails
                    };
                }
                if (action.payload.rentDetails) {
                    state.rentDetails = {
                        ...state.rentDetails,
                        ...action.payload.rentDetails
                    };
                }
                state.plans = action.payload.plans || [];
            })
            .addCase(fetchLockerDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    clearLockerData,
    updateLockerDetails,
    updateRentDetails,
    setLockerData,
    updateNominees,
    clearAllLockerData
} = lockerSlice.actions;

export default lockerSlice.reducer;
