import { configureStore } from '@reduxjs/toolkit';
import customerInfoReducer from './slices/customerInfoSlice';
import lockerReducer from './slices/lockerSlice';
import rentDetailsReducer from './slices/rentDetailsSlice';

export const store = configureStore({
    reducer: {
        customerInfo: customerInfoReducer,
        locker: lockerReducer,
        rentDetails: rentDetailsReducer
    }
});
