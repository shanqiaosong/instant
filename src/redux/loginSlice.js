import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import network from '../utils/network';

const login = createAsyncThunk('login', async (data) => {
  return network.post('/login', data);
});

export const loginSlice = createSlice({
  name: 'loginSlice',
  initialState: {
    errors: {},
    pending: false,
  },
  reducers: {},
  extraReducers: {
    [login.pending]: (state, action) => {
      state.errors = {};
      console.log(state, action, 'pending');
      state.pending = true;
    },
    [login.fulfilled]: (state, action) => {
      console.log(state, action, 'fulfilled');
      state.pending = false;
    },
    [login.rejected]: (state, action) => {
      const e = action.error;
      console.error(e);
      if (
        e.message === 'account not exist' ||
        e.message === 'invalid account'
      ) {
        state.errors = { account: '此账号不存在' };
      } else if (e.message === 'wrong password') {
        state.errors = { password: '密码错误' };
      }
      state.pending = false;
    },
  },
});

export default loginSlice.reducer;

export { login };
