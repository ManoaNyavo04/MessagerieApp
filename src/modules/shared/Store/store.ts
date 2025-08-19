import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../../shared/Slices/authSlice";
import React from 'react'
import navigationReducer from '../Slices/listeNavigationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    navigations: navigationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store
