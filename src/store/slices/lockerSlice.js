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

export const addNominee = createAsyncThunk(
    'locker/addNominee',
    async ({ customerId, nomineeData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/customers/nominees?customer_id=${customerId}`, nomineeData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to add nominee');
        }
    }
);

export const deleteNominee = createAsyncThunk(
    'locker/deleteNominee',
    async ({ customerId, nomineeId }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`${API_URL}/customers/nominees/${nomineeId}?customer_id=${customerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return nomineeId;
        } catch (error) {
            return rejectWithValue('Failed to delete nominee');
        }
    }
);

export const updateNominee = createAsyncThunk(
    'locker/updateNominee',
    async ({ customerId, nomineeId, nomineeData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                `${API_URL}/customers/nominees/${nomineeId}?customer_id=${customerId}`,
                nomineeData,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to update nominee');
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
            .addCase(addNominee.fulfilled, (state, action) => {
                state.loading = false;
                const newNominee = {
                    ...action.payload.data,
                    id: action.payload.data.unique_id
                };
                state.lockerDetails.nominees = [
                    ...state.lockerDetails.nominees,
                    newNominee
                ];
            })
            .addCase(deleteNominee.fulfilled, (state, action) => {
                state.loading = false;
                state.lockerDetails.nominees = state.lockerDetails.nominees.filter(
                    nominee => nominee.unique_id !== action.payload
                );
            })
            .addCase(updateNominee.fulfilled, (state, action) => {
                state.loading = false;
                const updatedNominee = {
                    ...action.payload.data,
                    id: action.payload.data.unique_id
                };
                state.lockerDetails.nominees = state.lockerDetails.nominees.map(nominee =>
                    nominee.unique_id === updatedNominee.unique_id ? updatedNominee : nominee
                );
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
