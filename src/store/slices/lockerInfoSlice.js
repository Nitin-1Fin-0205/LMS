import { createSlice } from '@reduxjs/toolkit';
import { lockerInfoModel } from '../../models/formModels';

const lockerInfoSlice = createSlice({
    name: 'lockerInfo',
    initialState: {
        data: { ...lockerInfoModel },
        loading: false,
        error: null
    },
    reducers: {
        updateLockerInfo: (state, action) => {
            state.data = { ...state.data, ...action.payload };
        },
        resetLockerInfo: (state) => {
            state.data = { ...lockerInfoModel };
        }
    }
});

export const { updateLockerInfo, resetLockerInfo } = lockerInfoSlice.actions;
export default lockerInfoSlice.reducer;
