import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../assets/config';
import { CustomerFormModel } from '../../models/CustomerModel';
import { HOLDER_TYPES } from '../../constants/holderConstants';

const initialState = {
    isSubmitting: false,
    error: null,
    customerId: null,
    isCustomerCreated: false,
    form: { ...CustomerFormModel }
};

// This API is used to fetch customer details by PAN number
export const fetchCustomerByPan = createAsyncThunk(
    'customer/fetchByPan',
    async ({ pan, centerId }, { rejectWithValue }) => {

        // // // TODO: remove this response and use the actual response when the API is ready
        // return {
        //     "member_id": "MBR1",
        //     "customer_id": 1,
        //     "customer_code": "97709a61-d13d-4dc0-8d99-38ec101157a0",
        //     "name": "string",
        //     "first_name": "Nitin ",
        //     "middle_name": "Kishan",
        //     "last_name": "Gupta",
        //     "dob": "1990-05-12",
        //     "email": "nitingupta1906@gmail.com",
        //     "mobile_number": "9876543210",
        //     "pan": "ABCPE1234F",
        //     "gender": "MALE",
        //     "aadhar": "ABCPE1234F",
        //     "type": "primary",
        //     "parent_customer_id": null,
        //     "locker_center_id": 1,
        //     "guardian": "Kishan Gupta",
        //     "address": "gugujh",
        //     "secondary_holder_id": 3,
        //     "third_holder_id": 5,
        //     "locker_number": "",
        //     "locker_id": null,
        //     "profile_img": "https://media.istockphoto.com/id/615279718/photo/businesswoman-portrait-on-white.jpg?s=612x612&w=0&k=20&c=Aa2Vy4faAPe9fAE68Z01jej9YqPqy-RbAteIlF3wcjk="
        // }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/customers/details?pan=${pan}&locker_center_id=${centerId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });

            if (response.status !== 200 && response.status !== 201) {
                throw new Error('Failed to fetch customer info');
            }
            if (response.data.status_code !== 200) {
                throw new Error(response.data.message || 'Failed to fetch customer info');
            }
            if (!response.data.data) {
                throw new Error('No customer data found');
            }
            if (!response.data.data.member_id) {
                throw new Error('Invalid member ID');
            }

            return response.data.data;

        } catch (error) {
            return rejectWithValue('Failed to fetch customer info');
        }
    }
);

export const fetchCustomerAttachments = createAsyncThunk(
    'customer/fetchAttachments',
    async (customerId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/customers/${customerId}/attachments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch attachments');
        }
    }
);

export const fetchBiometricData = createAsyncThunk(
    'customer/fetchBiometric',
    async (customerId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/customers/${customerId}/biometric`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch biometric data');
        }
    }
);

// This API is used to fetch customer details by ID
export const fetchCustomerById = createAsyncThunk(
    'customer/fetchById',
    async ({ customerId, holderType }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/customers/details-by-id?customer_id=${customerId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.data?.data) {
                throw new Error('No customer data found');
            }

            return {
                ...response.data.data,
                holderType
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer details');
        }
    }
);

// This API is used to create a new customer or update an existing one
export const submitCustomerInfo = createAsyncThunk(
    'customer/submitCustomerInfo',
    async (customerData, { rejectWithValue }) => {
        console.log('Submitting customer data:', customerData);
        try {
            const response = await axios.post(`${API_URL}/customers/add-update/personal-details`, customerData);
            if (response.status === 200 || response.status === 201) {

                return {
                    customerId: response?.data?.data?.customer_id,
                };
            }
            throw new Error('Failed to create customer');
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create customer');
        }
    }
);

const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        updateHolderSection: (state, action) => {
            const { holder, section, data } = action.payload;
            state.form[holder][section] = {
                ...state.form[holder][section],
                ...data
            };
        },
        resetForm: () => initialState
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomerByPan.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
                // Reset all sections of both holders when fetching by PAN
                state.form.primaryHolder = { ...CustomerFormModel.primaryHolder };
            })
            .addCase(fetchCustomerByPan.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.error = null;

                // Map API response to primaryHolder customerInfo
                state.form.primaryHolder.customerInfo = {
                    ...state.form.primaryHolder.customerInfo,
                    customerId: action.payload.customer_id,
                    firstName: action.payload.first_name,
                    middleName: action.payload.middle_name,
                    lastName: action.payload.last_name,
                    dateOfBirth: action.payload.dob,
                    emailId: action.payload.email,
                    mobileNo: action.payload.mobile_number,
                    panNo: action.payload.pan,
                    gender: action.payload.gender.toUpperCase(),
                    aadharNo: action.payload.aadhar,
                    fatherOrHusbandName: action.payload.guardian,
                    photo: action.payload.profile_img,
                    customerCode: action.payload.customer_code,
                    lockerCenterId: action.payload.locker_center_id,
                    type: action.payload.type,
                    address: action.payload.address,
                };

                state.form.secondaryHolder.customerInfo = {
                    ...state.form.secondaryHolder.customerInfo,
                    customerId: action.payload.secondary_holder_id
                };

                state.form.thirdHolder.customerInfo = {
                    ...state.form.thirdHolder.customerInfo,
                    customerId: action.payload.third_holder_id
                };

            })
            .addCase(fetchCustomerByPan.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            .addCase(fetchCustomerAttachments.fulfilled, (state, action) => {
                state.form.primaryHolder.attachments = action.payload;
            })
            .addCase(fetchBiometricData.fulfilled, (state, action) => {
                state.form.primaryHolder.biometric = action.payload;
            })
            .addCase(fetchCustomerById.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(fetchCustomerById.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.error = null;
                const customerData = action.payload;
                const holderType = customerData.holderType;

                const customerInfo = {
                    customerId: customerData.customer_id,
                    firstName: customerData.first_name,
                    middleName: customerData.middle_name,
                    lastName: customerData.last_name,
                    dateOfBirth: customerData.dob,
                    emailId: customerData.email,
                    mobileNo: customerData.mobile_number,
                    panNo: customerData.pan,
                    gender: customerData.gender.toUpperCase(),
                    aadharNo: customerData.aadhar,
                    fatherOrHusbandName: customerData.guardian,
                    photo: customerData.profile_img,
                    address: customerData.address
                };

                // Update the correct holder based on holderType
                if (holderType === HOLDER_TYPES.SECONDARY) {
                    state.form.secondaryHolder.customerInfo = customerInfo;
                } else if (holderType === HOLDER_TYPES.THIRD) {
                    state.form.thirdHolder.customerInfo = customerInfo;
                }
                // else {
                //     state.form.primaryHolder.customerInfo = customerInfo;
                // }
            })
            .addCase(fetchCustomerById.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            .addCase(submitCustomerInfo.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.customerId = action.payload.customerId;
                state.isCustomerCreated = true;
            });
    }
});

export const { updateHolderSection, resetForm } = customerSlice.actions;
export default customerSlice.reducer;
