import { createSlice } from '@reduxjs/toolkit';
import { customerInfoModel } from '../../models/formModels';

const customerInfoSlice = createSlice({
    name: 'customerInfo',
    initialState: {
        primary: { ...customerInfoModel },
        secondary: { ...customerInfoModel }
    },
    reducers: {
        updateCustomerInfo: (state, action) => {
            const { holderType, data } = action.payload;
            state[holderType] = { ...state[holderType], ...data };
        },
        resetCustomerInfo: (state, action) => {
            const { holderType } = action.payload;
            state[holderType] = { ...customerInfoModel };
        }
    }
});

export const { updateCustomerInfo, resetCustomerInfo } = customerInfoSlice.actions;
export default customerInfoSlice.reducer;
