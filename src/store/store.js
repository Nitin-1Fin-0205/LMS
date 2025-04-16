import { configureStore } from '@reduxjs/toolkit';
import customerReducer from './slices/customerSlice';
import lockerReducer from './slices/lockerSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
    reducer: {
        customer: customerReducer,
        locker: lockerReducer,
        user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});
