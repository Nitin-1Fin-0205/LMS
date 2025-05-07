import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../assets/config';
import { CustomerFormModel } from '../../models/CustomerModel';

const initialState = {
    isSubmitting: false,
    error: null,
    customerId: null,
    isCustomerCreated: false,
    form: { ...CustomerFormModel }
};

export const fetchCustomerByPan = createAsyncThunk(
    'customer/fetchByPan',
    async ({ pan, centerId }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/customers/details?pan=${pan}&locker_center_id=${centerId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });

            // this is response structure from the API
            // {
            //     "status_code": 200,
            //     "message": "Customers Data Fetched Successfully !",
            //     "data": {
            //       "member_id": "MBR6",
            //       "customer_code": "00000000-0000-0000-0000-000000000000",
            //   "first_name": "Niokhil Test",
            //   "middle_name": "",
            //   "last_name": "",
            //       "dob": "2025-09-09",
            //       "email": "nikhil@ghmail.com",
            //       "mobile_number": "7877676767",
            //       "pan": "BSGHG76867G",
            //       "gender": "Male",
            //       "aadhar": "786656543333",
            //       "type": "primary",
            //       "parent_customer_id": null,
            //       "locker_center_id": 1,
            //       "guardian": "Name",
            //       "profile_img": ""
            //     }
            //   }

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

// export const submitStageData = createAsyncThunk(
//     'customer/submitStage',
//     async ({ holder, stage, data }, { rejectWithValue }) => {

//         try {
//             const token = localStorage.getItem('authToken');
//             const response = await axios.post(`${API_URL}/customer/${holder}/${stage}`, data, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });
//             return response.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || 'Failed to submit stage data');
//         }
//     }
// );

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
                    gender: action.payload.gender,
                    aadharNo: action.payload.aadhar,
                    fatherOrHusbandName: action.payload.guardian,
                    photo: action.payload.profile_img,
                    customerCode: action.payload.customer_code,
                    lockerCenterId: action.payload.locker_center_id,
                    type: action.payload.type,
                    address: action.payload.address,
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
            .addCase(submitCustomerInfo.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.customerId = action.payload.customerId;
                state.isCustomerCreated = true;
            });
    }
});

export const { updateHolderSection, resetForm } = customerSlice.actions;
export default customerSlice.reducer;
