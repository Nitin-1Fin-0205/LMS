import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../assets/config';
import axios from 'axios';
import { LockerDetailsModel, RentDetailsModel } from '../../models/LockerModel';

const initialState = {
    loading: false,
    error: null,
    plans: [],
    lockerData: null,
    mappedLockers: []
};

export const fetchLockerDetails = createAsyncThunk(
    'locker/fetchDetails',
    async (customerId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/lockers/locker-details?customer_id=${customerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.data?.data?.lockers?.[0]) {
                throw new Error('No locker details found');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch locker details');
        }
    }
);

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
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch locker master');
        }
    }
);

export const fetchNominees = createAsyncThunk(
    'locker/fetchNominees',
    async (customerId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/customers/nominees?customer_id=${customerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.data?.data?.nominees) {
                throw new Error('No nominees data found');
            }
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch nominees');
        }
    }
);

export const deleteNominee = createAsyncThunk(
    'locker/deleteNominee',
    async ({ customerId, nomineeId }, { rejectWithValue }) => {

        console.log('Deleting nominee with ID:', nomineeId, 'for customer ID:', customerId);
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`${API_URL}/customers/nominees?customer_id=${customerId}&nominee_id=${nomineeId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return nomineeId;
        } catch (error) {
            return rejectWithValue('Failed to delete nominee');
        }
    }
);


export const assignLocker = createAsyncThunk(
    'locker/assignLocker',
    async (lockerData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/lockers/assignLocker`,
                {
                    customer_id: lockerData.customerId,
                    locker_id: lockerData.lockerId,
                    center_id: lockerData.centerId,
                    plan_id: lockerData.planId,
                    expiry_date: lockerData.expiryDate,
                    pay_frequency: lockerData.payFrequency,
                    upi_id: lockerData.upiId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                return response.data;
            }
            throw new Error('Failed to assign locker');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to assign locker');
        }
    }
);

// Add new thunk for updating nominees
export const updateNominees = createAsyncThunk(
    'locker/updateNominees',
    async ({ customerId, nominees }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/customers/nominees`,
                {
                    customer_id: customerId,
                    nominees: nominees
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update nominees');
        }
    }
);

// Thunk for initiating surrender (sends OTP)
export const initiateSurrenderLocker = createAsyncThunk(
    'locker/initiateSurrenderLocker',
    async ({ customerId, lockerId }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/lockers/surrender/initiate`,
                {
                    customer_id: customerId,
                    locker_id: lockerId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                return response.data;
            }
            throw new Error('Failed to initiate surrender');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to initiate surrender');
        }
    }
);

// Thunk for completing surrender after OTP verification
export const surrenderLocker = createAsyncThunk(
    'locker/surrenderLocker',
    async ({ customerId, lockerId }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/lockers/surrender/complete`,
                {
                    customer_id: customerId,
                    locker_id: lockerId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                return response.data;
            }
            throw new Error('Failed to surrender locker');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to surrender locker');
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
        setLockerData: (state, action) => {
            state.lockerData = action.payload;
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
                state.error = typeof action.payload === 'string' ? action.payload : 'Failed to load lockers';
            })
            .addCase(fetchLockerDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            }).addCase(fetchLockerDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Store raw locker data for other components that might need it
                state.lockerData = action.payload;
            })
            .addCase(fetchLockerDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchNominees.fulfilled, (state, action) => {
                state.loading = false;
                // Nominees are now managed by individual components
            })
            .addCase(deleteNominee.fulfilled, (state, action) => {
                state.loading = false;
                // Nominee deletion is now managed by individual components
            })
            .addCase(assignLocker.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignLocker.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Update locker details after successful assignment if needed
            }).addCase(assignLocker.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(initiateSurrenderLocker.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(initiateSurrenderLocker.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // OTP has been sent, ready for user input
            })
            .addCase(initiateSurrenderLocker.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateNominees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateNominees.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(updateNominees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(surrenderLocker.pending, (state) => {
                state.loading = true;
                state.error = null;
            }).addCase(surrenderLocker.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Clear stored locker data after successful surrender
                state.lockerData = null;
            })
            .addCase(surrenderLocker.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {
    clearLockerData,
    setLockerData,
    clearAllLockerData
} = lockerSlice.actions;

export default lockerSlice.reducer;
