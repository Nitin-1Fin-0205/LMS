import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../../assets/config';
import axios from 'axios';
import { LockerDetailsModel, RentDetailsModel } from '../../models/LockerModel';

const initialState = {
    loading: false,
    error: null,
    lockerDetails: { ...LockerDetailsModel },
    // rentDetails: { ...RentDetailsModel },
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
                    pay_frequency: lockerData.payFrequency
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
                deposit: action.payload.deposit,
                rent: action.payload.rent,
                admissionFees: action.payload.admissionFees,
                total: action.payload.total
            };
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
            })
            .addCase(fetchLockerDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                const lockerData = action.payload.data.lockers[0];

                state.lockerDetails = {
                    ...state.lockerDetails,
                    assignedLocker: lockerData.lockerNumber,
                    lockerId: lockerData.lockerId,
                    center: lockerData.center_id,
                    lockerKey: lockerData.locker_key,
                    selectedPlan: lockerData.plan_id,
                    rentDetails: lockerData.rent_details || {
                        deposit: 0,
                        rent: 0,
                        admissionFees: 0,
                        total: 0
                    }
                };
            })
            .addCase(fetchLockerDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchNominees.fulfilled, (state, action) => {
                state.loading = false;
                state.lockerDetails.nominees = action.payload.data.nominees.map(nominee => ({
                    ...nominee,
                    id: nominee.unique_id,
                }));
            })
            .addCase(deleteNominee.fulfilled, (state, action) => {
                state.loading = false;
                state.lockerDetails.nominees = state.lockerDetails.nominees.filter(
                    nominee => nominee.unique_id !== action.payload
                );
            })
            .addCase(assignLocker.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignLocker.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Update locker details after successful assignment if needed
            })
            .addCase(assignLocker.rejected, (state, action) => {
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
                state.lockerDetails.nominees = action.payload.data.nominees;
            })
            .addCase(updateNominees.rejected, (state, action) => {
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
    clearAllLockerData
} = lockerSlice.actions;

export default lockerSlice.reducer;
