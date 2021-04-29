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
});

export default state;
