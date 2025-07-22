import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../assets/config';
import { HOLDER_TYPES } from '../../constants/holderConstants';
import { CustomerFormModel } from '../../models/customerModel';

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
    async ({ pan }, { rejectWithValue }) => {

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/customers/details?pan=${pan}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });

            if (response.status !== 200 && response.status !== 201) {
                console.log('Error response:', response);
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
            return rejectWithValue(error?.response?.data?.message || 'Failed to fetch customer info');
        }
    }
);

// export const fetchCustomerAttachments = createAsyncThunk(
//     'customer/fetchAttachments',
//     async (customerId, { rejectWithValue }) => {
//         try {
//             const token = localStorage.getItem('authToken');
//             const response = await axios.get(`${API_URL}/customers/${customerId}/attachments`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             return response.data;
//         } catch (error) {
//             return rejectWithValue('Failed to fetch attachments');
//         }
//     }
// );

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
    'customer/submitCustomerInfo', async ({ customerData, holderType }, { rejectWithValue }) => {
        console.log('Submitting customer data:', customerData, holderType);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/customers/add-update/personal-details`,
                customerData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
            if (response.status === 200 || response.status === 201) {

                return {
                    customerId: response?.data?.data?.customer_id,
                    holderType
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
                state.customerId = action.payload.customer_id;
                // Map API response to primaryHolder customerInfo
                state.form.primaryHolder.customerInfo = {
                    ...state.form.primaryHolder.customerInfo,
                    memberId: action.payload.member_id,
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
                    permanentAddressLine1: action.payload.permanent_address_line1,
                    permanentAddressLine2: action.payload.permanent_address_line2,
                    permanentAddressLine3: action.payload.permanent_address_line3,
                    permanentCity: action.payload.permanent_city,
                    permanentState: action.payload.permanent_state,
                    permanentStatecode: action.payload.permanent_state_code,
                    correspondenceAddressLine1: action.payload.correspondence_address_line1,
                    correspondenceAddressLine2: action.payload.correspondence_address_line2,
                    correspondenceAddressLine3: action.payload.correspondence_address_line3,
                    correspondenceCity: action.payload.correspondence_city,
                    correspondenceState: action.payload.correspondence_state,
                    correspondenceStatecode: action.payload.correspondence_state_code,
                    allowSendingAgreement: action.payload.locker_id ? true : false,
                    agreementLink: action.payload.agreement_link || '',
                    agreementStatus: action.payload.agreement_status || '',
                    agreementName: action.payload.agreement_name || '',
                    agreementSource: action.payload.agreement_source || '',

                    // // Legacy address fields (for backward compatibility)
                    // address: action.payload.address,
                    // city: action.payload.city,
                    // state: action.payload.state,
                    // statecode: action.payload.state_code
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
                    gender: customerData.gender ? customerData.gender.toUpperCase() : '',
                    aadharNo: customerData.aadhar,
                    fatherOrHusbandName: customerData.guardian,
                    photo: customerData.profile_img,
                    // New address fields
                    permanentAddressLine1: customerData.permanent_address_line1,
                    permanentAddressLine2: customerData.permanent_address_line2,
                    permanentAddressLine3: customerData.permanent_address_line3,
                    permanentCity: customerData.permanent_city,
                    permanentState: customerData.permanent_state,
                    permanentStatecode: customerData.permanent_state_code,
                    correspondenceAddressLine1: customerData.correspondence_address_line1,
                    correspondenceAddressLine2: customerData.correspondence_address_line2,
                    correspondenceAddressLine3: customerData.correspondence_address_line3,
                    correspondenceCity: customerData.correspondence_city,
                    correspondenceState: customerData.correspondence_state,
                    correspondenceStatecode: customerData.correspondence_state_code,
                    // Legacy address fields (for backward compatibility)
                    address: customerData.address,
                    city: customerData.city,
                    state: customerData.state,
                    statecode: customerData.state_code,
                };

                // Update the correct holder based on holderType
                if (holderType === HOLDER_TYPES.SECONDARY) {
                    state.form.secondaryHolder.customerInfo = customerInfo;
                } else if (holderType === HOLDER_TYPES.THIRD) {
                    state.form.thirdHolder.customerInfo = customerInfo;
                }
            })
            .addCase(fetchCustomerById.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            .addCase(submitCustomerInfo.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(submitCustomerInfo.fulfilled, (state, action) => {
                state.isSubmitting = false;

                // Get the customerId and holderType from the action payload
                const { customerId, holderType } = action.payload;

                console.log('Customer ID:', customerId);
                console.log('Holder Type:', holderType);

                // Update customerId in the appropriate holder section based on holderType

                if (holderType === HOLDER_TYPES.PRIMARY) {
                    state.customerId = customerId;
                    state.form.primaryHolder.customerInfo.customerId = customerId;
                } else if (holderType === HOLDER_TYPES.SECONDARY) {
                    state.form.secondaryHolder.customerInfo.customerId = customerId;
                } else if (holderType === HOLDER_TYPES.THIRD) {
                    state.form.thirdHolder.customerInfo.customerId = customerId;
                }
            })
            .addCase(submitCustomerInfo.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            });
    }
});

export const { updateHolderSection, resetForm } = customerSlice.actions;
export default customerSlice.reducer;
