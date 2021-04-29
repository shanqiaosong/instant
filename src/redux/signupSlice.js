import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import utils from '../utils/network';

const signup = createAsyncThunk('signup', async (data) => {
  return utils.post('/signup', data);
});
export const signupSlice = createSlice({
  name: 'signupSlice',
  initialState: {
    signupInfo: {},
    pending: false,
  },
  reducers: {},
  extraReducers: {
    [signup.pending]: (state, action) => {
      console.log(state, action, 'pending');
      state.pending = true;
    },
    [signup.fulfilled]: (state, action) => {
      console.log(state, action, 'fulfilled');
      state.pending = false;
    },
    [signup.rejected]: (state, action) => {
      console.log(state, action, 'rejected');
      state.pending = false;
    },
  },
});

export default signupSlice.reducer;

export { signup };
