import { configureStore } from '@reduxjs/toolkit';
import signupReducer from './signupSlice';
import loginReducer from './loginSlice';
import chatReducer from './chatSlice';

const state = configureStore({
  reducer: {
    signupSlice: signupReducer,
    loginSlice: loginReducer,
    chatSlice: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

window.store = state;

export default state;
