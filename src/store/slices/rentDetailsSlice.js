import { createSlice } from '@reduxjs/toolkit';
import { rentDetailsModel } from '../../models/formModels';

const rentDetailsSlice = createSlice({
    name: 'rentDetails',
    initialState: {
        data: { ...rentDetailsModel },
        loading: false,
        error: null
    },
    reducers: {
        updateRentDetails: (state, action) => {
            state.data = { ...state.data, ...action.payload };
        },
        resetRentDetails: (state) => {
            state.data = { ...rentDetailsModel };
        }
    }
});

export const { updateRentDetails, resetRentDetails } = rentDetailsSlice.actions;
export default rentDetailsSlice.reducer;
