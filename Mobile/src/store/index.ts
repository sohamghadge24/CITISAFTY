import { configureStore } from '@reduxjs/toolkit';

import trafficReducer from './slices/trafficSlice';
import userReducer from './slices/userSlice';
import alertsReducer from './slices/alertsSlice';

export const store = configureStore({
    reducer: {
        traffic: trafficReducer,
        user: userReducer,
        alerts: alertsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
