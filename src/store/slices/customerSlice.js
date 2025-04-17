import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../assets/config';
import { formDataStructure } from '../../models/customerModel';

export const addCustomer = createAsyncThunk(
    'customer/add',
    async (customerData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/customers`, customerData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateCustomer = createAsyncThunk(
    'customer/update',
    async ({ customerId, customerData }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(`${API_URL}/customers/${customerId}`, customerData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

const customerSlice = createSlice({
    name: 'customer',
    initialState: {
        formData: {
            primaryHolder: formDataStructure.primaryHolder,
            secondHolder: formDataStructure.secondHolder,
            thirdHolder: formDataStructure.thirdHolder
        },
        isSubmitting: false,
        error: null,
    },
    reducers: {
        updateFormData: (state, action) => {
            const { holderType, section, data } = action.payload;
            console.log('Updating form data:', holderType, section, data);
            state.formData[holderType][section] = {
                ...state.formData[holderType][section],
                ...data
            };
        },
        resetForm: (state) => {
            state.formData = {
                primaryHolder: formDataStructure.primaryHolder,
                secondHolder: formDataStructure.secondHolder,
                thirdHolder: formDataStructure.thirdHolder
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addCustomer.pending, (state) => {
                state.isSubmitting = true;
            })
            .addCase(addCustomer.fulfilled, (state) => {
                state.isSubmitting = false;
                state.error = null;
            })
            .addCase(addCustomer.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            .addCase(updateCustomer.pending, (state) => {
                state.isSubmitting = true;
            })
            .addCase(updateCustomer.fulfilled, (state) => {
                state.isSubmitting = false;
                state.error = null;
            })
            .addCase(updateCustomer.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            });
    },
});

export const { updateFormData, resetForm } = customerSlice.actions;
export default customerSlice.reducer;
