import { configureStore } from '@reduxjs/toolkit';
import customerReducer from './slices/customerSlice';
import lockerReducer from './slices/lockerSlice';

export const store = configureStore({
    reducer: {
        customer: customerReducer,
        locker: lockerReducer
    }
});
