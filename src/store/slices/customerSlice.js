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
            return {
                primaryHolder: {
                    customerInfo: {
                        photo: 'https://t4.ftcdn.net/jpg/02/90/27/39/360_F_290273933_ukYZjDv8nqgpOBcBUo5CQyFcxAzYlZRW.jpg',
                        customerId: 'CUST001',
                        customerName: 'John Doe',
                        fatherOrHusbandName: 'Richard Doe',
                        dateOfBirth: '1990-01-01',
                        gender: 'MALE',
                        mobileNo: '9876543210',
                        emailId: 'john@example.com',
                        panNo: pan,
                        documentNo: 'AADHAR123456',
                        address: '123 Main Street, City',
                    },
                    biometric: {
                        fingerprints: []
                    },
                    attachments: {
                        identityProof: [{
                            id: 'doc1',
                            name: 'PAN Card.pdf',
                            type: 'application/pdf',
                            size: 1024 * 1024,
                            data: 'base64data...',
                            category: 'identityProof'
                        }],
                        addressProof: [{
                            id: 'doc2',
                            name: 'Aadhar Card.jpg',
                            type: 'image/jpeg',
                            size: 2 * 1024 * 1024,
                            data: 'base64data...',
                            category: 'addressProof'
                        }],
                        contactDocument: [],
                        otherDocument: []
                    }
                },
                lockerDetails: {
                    lockerId: 'LOCKER001',
                    assignedLocker: 'TH001',
                    lockerSize: 'Large',
                    lockerKeyNo: '123456',
                    isModalOpen: false,
                    isNomineeModalOpen: false,
                    nominees: [
                        {
                            name: 'Alice Doe', relation: 'Sister',
                            dob: '1998-04-04'
                        },
                        { name: 'Bob Doe', relation: 'Brother', dob: '2000-05-05' }
                    ],
                    rentDetails: {
                        deposit: '10000',
                        rent: '500',
                        admissionFees: '1000',
                        total: '11500',
                        selectedPlan: 'Annual Plan',
                        contractNumber: 'CONTRACT001',
                        moveInDate: '2023-01-01',
                        anticipatedMoveOutDate: '2024-01-01'
                    }
                },
                secondaryHolder: {
                    customerInfo: {
                        customerId: 'CUST002',
                        customerName: 'Jane Doe',
                        fatherOrHusbandName: 'Richard Doe',
                        dateOfBirth: '1992-02-02',
                        gender: 'Female',
                        mobileNo: '9876543211',
                        emailId: 'jane@example.com',
                        panNo: 'ABCDE1235F',
                        documentNo: 'AADHAR123457',
                        address: '123 Main Street, City',
                        photo: 'https://media.istockphoto.com/id/615279718/photo/businesswoman-portrait-on-white.jpg?s=612x612&w=0&k=20&c=Aa2Vy4faAPe9fAE68Z01jej9YqPqy-RbAteIlF3wcjk='
                    },
                    attachments: {
                        identityProof: [{
                            id: 'doc3',
                            name: 'PAN Card.pdf',
                            type: 'application/pdf',
                            size: 1024 * 1024,
                            data: 'base64data...',
                            category: 'identityProof'
                        }],
                        addressProof: [{
                            id: 'doc4',
                            name: 'Aadhar Card.jpg',
                            type: 'image/jpeg',
                            size: 2 * 1024 * 1024,
                            data: 'base64data...',
                            category: 'addressProof'
                        }],
                        contactDocument: [],
                        otherDocument: []
                    }
                },
                thirdHolder: {
                    customerInfo: {
                        customerId: 'CUST003',
                        customerName: 'Jim Doe',
                        fatherOrHusbandName: 'Richard Doe',
                        dateOfBirth: '1995-03-03',
                        gender: 'Male',
                        mobileNo: '9876543212',
                        emailId: 'jim@example.com',
                        panNo: 'ABCDE1236F',
                        documentNo: 'AADHAR123458',
                        address: '123 Main Street, City',
                        photo: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS95oxnB_1Qr8KwPY3VHtBJCim7YQIPBC_VGw&s`
                    },
                    attachments: {
                        identityProof: [{
                            id: 'doc5',
                            name: 'PAN Card.pdf',
                            type: 'application/pdf',
                            size: 1024 * 1024,
                            data: 'base64data...',
                            category: 'identityProof'
                        }],
                        addressProof: [{
                            id: 'doc6',
                            name: 'Aadhar Card.jpg',
                            type: 'image/jpeg',
                            size: 2 * 1024 * 1024,
                            data: 'base64data...',
                            category: 'addressProof'
                        }],
                        contactDocument: [],
                        otherDocument: []
                    }
                }
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Failed to fetch customer details' });
        }
    }
);

export const submitStageData = createAsyncThunk(
    'customer/submitStage',
    async ({ holder, stage, data }, { rejectWithValue }) => {
        try {
            // const token = localStorage.getItem('authToken');
            // const response = await axios.post(
            //     `${API_URL}${STAGE_ENDPOINTS[stage]}`,
            //     { holder, data },
            //     {
            //         headers: {
            //             'Authorization': `Bearer ${token}`,
            //             'Content-Type': 'application/json'
            //         }
            //     }
            // );

            const response = await {
                status: 200,
                data: {
                    customerId: 'CUST001',
                    message: 'Stage data submitted successfully',
                    holder,
                    stage,
                    data
                }
            };
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to submit stage data');
        }
    }
);

export const submitCustomerInfo = createAsyncThunk(
    'customer/submitCustomerInfo',
    async (customerData, { rejectWithValue }) => {
        try {
            // const token = localStorage.getItem('authToken');
            // const response = await axios.post(
            //     `${API_URL}/customers/create`,
            //     customerData,
            //     {
            //         headers: {
            //             'Authorization': `Bearer ${token}`,
            //             'Content-Type': 'application/json'
            //         }
            //     }
            // );
            // Mock response for testing
            const response = await {
                status: 200,
                data: {
                    customerId: 'CUST001',
                    message: 'Customer created successfully'
                }
            };
            if (response.status !== 200) {
                throw new Error('Failed to create customer');
            }
            return response.data; // Should include customerId in response
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

            console.log('Updating holder section:', action.section);
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
            })
            .addCase(fetchCustomerByPan.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.error = null;

                ['primaryHolder', 'secondaryHolder', 'thirdHolder'].forEach(holder => {
                    console.log('Holder:', holder, action.payload[holder]);
                    if (action.payload[holder]) {
                        Object.keys(action.payload[holder]).forEach(section => {
                            state.form[holder][section] = {
                                ...state.form[holder][section],
                                ...action.payload[holder][section]
                            };
                        });
                    }
                });
            })
            .addCase(fetchCustomerByPan.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            .addCase(submitStageData.pending, (state) => {
                state.isSubmitting = true;
                state.error = null;
            })
            .addCase(submitStageData.fulfilled, (state, action) => {
                state.isSubmitting = false;
            })
            .addCase(submitStageData.rejected, (state, action) => {
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
