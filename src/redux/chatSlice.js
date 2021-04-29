import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import network from '../utils/network';

const searchAccount = createAsyncThunk('searchAccount', (data) => {
  return network.get('/search', { toUser: data });
});
const sendRequest = createAsyncThunk('sendRequest', (data, thunkAPI) => {
  return new Promise((resolve, reject) => {
    const {
      token,
      account: fromUser,
      addInfo: { account: toUser },
    } = thunkAPI.getState().chatSlice;
    const { content } = data;
    const clientID = String(Date.now()) + String(Math.random());
    window.socket.emit('sendMessage', {
      token,
      message: {
        fromUser,
        toUser,
        type: 'request',
        content,
        clientID,
      },
    });
    window.socket.once('verifySend', (result) => {
      if (result.clientID === clientID) {
        resolve();
      }
    });
    setTimeout(reject, 4000);
  });
});
const incomingRequest = createAsyncThunk('incomingRequest', (data) => {
  console.log('incomingRequest', data);
  return new Promise((resolve, reject) => {
    network
      .get('/search', { toUser: data.fromUser })
      .then(({ data: userData }) => {
        userData.content = data.content;
        userData.id = data.id;
        resolve(userData);
      })
      .catch((err) => reject(err));
  });
});
const confirmRequest = createAsyncThunk('confirmRequest', (data, thunkAPI) => {
  return new Promise((resolve, reject) => {
    const { token, account: fromUser } = thunkAPI.getState().chatSlice;
    const { id, toUser } = data;
    const clientID = String(Date.now()) + String(Math.random());
    window.socket.emit('sendMessage', {
      token,
      message: {
        fromUser,
        toUser,
        type: `reply${id}`,
        clientID,
        content: 'agree',
      },
    });
    window.socket.once('verifySend', (result) => {
      if (result.clientID === clientID) {
        resolve(data);
      }
    });
    setTimeout(reject, 4000);
  });
});
const displayHistory = createAsyncThunk('displayHistory', (data, thunkAPI) => {
  return network.get('/history', {
    toUser: thunkAPI.getState().chatSlice.selectedFriend.account,
  });
});
const sendMessage = createAsyncThunk('sendMessage', (data, thunkAPI) => {
  console.log(thunkAPI.getState());
  return new Promise((resolve, reject) => {
    const {
      token,
      account: fromUser,
      selectedFriend: { account: toUser },
    } = thunkAPI.getState().chatSlice;
    const { input: content, clientID } = data;
    window.socket.emit('sendMessage', {
      token,
      message: {
        fromUser,
        toUser,
        type: 'text',
        content,
        clientID,
      },
    });
    const verifyListener = (result) => {
      if (result.clientID === clientID) {
        if (result.status !== 'ok') reject(result.message);
        else resolve(result);
        window.socket.off('verifySend', verifyListener);
      }
    };
    window.socket.on('verifySend', verifyListener);
    setTimeout(reject, 4000);
  });
});
const newFriend = createAsyncThunk('newFriend', ({ fromUser: toUser }) => {
  return network.get('/search', { toUser });
});
const ping = createAsyncThunk('ping', (data, thunkAPI) => {
  const { token } = thunkAPI.getState().chatSlice;
  return network.post('/ping', { token });
});

function changeLastMessage(state, account, message, addCnt = 0) {
  const friendPos = state.friends.findIndex(
    (value) => value.account === account
  );
  if (friendPos === -1) return friendPos;
  state.friends[friendPos].last_message.content = message;
  state.friends[friendPos].messageCnt =
    (state.friends[friendPos].messageCnt || 0) + addCnt;
  return friendPos;
}

function showSnack(state, message, type) {
  state.mainLoading = false;
  state.showSnackbar = true;
  state.snackbarMessage = message;
  state.snackbarType = type;
}

const initialState = {
  errors: {},
  pending: false,
  account: 0,
  birthday: '',
  email: '',
  gender: 0,
  nickname: '',
  token: '',
  avatar: '',
  friends: [],
  showAddDialog: false,
  addInfo: {},
  adderInfo: {},
  mainLoading: false,
  searchErr: '',
  showSnackbar: false,
  snackbarMessage: '',
  snackbarType: '',
  showAddConfirm: false,
  selectedFriend: {},
  history: [],
};

export const chatSlice = createSlice({
  name: 'chatSlice',
  initialState,
  reducers: {
    setInitInfo: (state, action) => {
      console.log('setInitInfo', action.payload);
      const {
        account,
        birthday,
        email,
        gender,
        nickname,
        token,
        friends,
        avatar,
      } = action.payload;
      state.account = account;
      state.nickname = nickname;
      state.email = email;
      state.gender = gender;
      state.birthday = birthday;
      state.token = token;
      state.friends = friends;
      state.avatar = avatar;
    },
    closeAddDialog(state) {
      state.showAddDialog = false;
    },
    clearError(state) {
      state.searchErr = '';
    },
    closeSnackbar(state) {
      state.showSnackbar = false;
    },
    openSnackbar(state, action) {
      state.showSnackbar = true;
      state.snackbarType = action.payload.type;
      state.snackbarMessage = action.payload.message;
    },
    openAddConfirm(state, action) {
      state.showAddConfirm = true;
      state.adderInfo = action.payload;
    },
    closeAddConfirm(state) {
      state.showAddConfirm = false;
    },
    selectFriend(state, action) {
      state.selectedFriend = action.payload;
    },
    incomingMessage(state, action) {
      console.log(action.payload);
      const { fromUser: account, content: message } = action.payload;
      changeLastMessage(state, account, message, 1);
      if (state.selectedFriend?.account === account) {
        state.history.push(action.payload);
      }
    },
    clearDot(state) {
      const friendPos = state.friends.findIndex(
        (value) =>
          value.account === state.selectedFriend?.account ||
          state.adderInfo.account
      );
      if (friendPos === -1) return;
      state.friends[friendPos].messageCnt = 0;
    },
    logout(state) {
      Object.assign(state, initialState);
    },
    reconnectAttempt(state) {
      console.log('socket断开');
      state.mainLoading = true;
    },
    reconnect(state) {
      state.mainLoading = false;
    },
  },
  extraReducers: {
    [searchAccount.pending]: (state) => {
      state.searchErr = '';
      state.mainLoading = true;
    },
    [searchAccount.fulfilled]: (state, action) => {
      state.showAddDialog = true;
      state.mainLoading = false;
      state.addInfo = action.payload.data;
    },
    [searchAccount.rejected]: (state, action) => {
      console.log(action);
      state.mainLoading = false;
      if (action.error.message === 'account not exist') {
        state.searchErr = '账号不存在';
      } else {
        state.searchErr = action.error.message;
      }
    },
    [sendRequest.pending]: (state) => {
      state.mainLoading = true;
    },
    [sendRequest.fulfilled]: (state) => {
      state.showAddDialog = false;
      showSnack(state, '已发送', 'success');
    },
    [sendRequest.rejected]: (state) => {
      showSnack(state, '网络错误，无法发送请求', 'error');
    },
    [incomingRequest.fulfilled]: (state, action) => {
      const { avatar, account, nickname, content, id } = action.payload;
      const friendPos = state.friends.findIndex(
        (value) => value.account === account
      );
      console.log(friendPos);

      if (friendPos > -1) {
        state.friends[friendPos].last_message.content = `好友请求：${content}`;
        state.friends[friendPos].requests?.push({ id, content });
        state.friends[friendPos].messageCnt += 1;
      } else {
        state.friends.unshift({
          avatar,
          account,
          nickname,
          last_message: { content: `好友请求：${content}` },
          messageCnt: 1,
          requests: [{ id, content }],
          isRequest: true,
        });
      }
    },
    [incomingRequest.rejected]: (state) => {
      showSnack(state, '有一个新的好友请求，但获取详情失败', 'error');
    },
    [confirmRequest.pending]: (state) => {
      state.mainLoading = true;
    },
    [confirmRequest.fulfilled]: (state, action) => {
      showSnack(state, '已确认', 'success');
      const friendIndex = state.friends.findIndex(
        (friend) => friend.account === action.payload.toUser
      );
      state.friends[friendIndex].last_message.content = '我通过了你的好友请求';
      state.friends[friendIndex].isRequest = false;
      state.showAddConfirm = false;
    },
    [confirmRequest.rejected]: (state) => {
      showSnack(state, '网络错误，无法接受', 'error');
    },
    [displayHistory.pending]: (state) => {
      state.mainLoading = true;
    },
    [displayHistory.fulfilled]: (state, action) => {
      state.mainLoading = false;
      state.history = action.payload.data;
    },
    [displayHistory.rejected]: (state) => {
      showSnack(state, '网络错误，无法展示历史记录', 'error');
    },
    [sendMessage.pending]: (state, action) => {
      const {
        account: fromUser,
        selectedFriend: { account: toUser },
      } = state;
      const { input: content, clientID } = action.meta.arg;
      state.history.push({
        fromUser,
        toUser,
        content,
        clientID,
        type: 'text',
        pending: true,
        id: clientID,
      });
      changeLastMessage(state, toUser, content);
    },
    [sendMessage.fulfilled]: (state, action) => {
      // 暂时只考虑选中的情况
      console.log(action);
      const { clientID, id, createdAt } = action.payload;
      const historyIndex = state.history.findIndex(
        (message) => message.clientID === clientID
      );
      if (historyIndex === -1) return;
      state.history[historyIndex].pending = false;
      state.history[historyIndex].id = id;
      state.history[historyIndex].createdAt = createdAt;
      // const { input: content, clientID } = action.meta.arg;
    },
    [sendMessage.rejected]: (state, action) => {
      // 暂时只考虑选中的情况
      const { clientID } = action.meta.arg;
      const historyIndex = state.history.findIndex(
        (message) => message.clientID === clientID
      );
      if (historyIndex === -1) return;
      state.history[historyIndex].pending = false;
      state.history[historyIndex].error = action.error.message;
    },
    [newFriend.fulfilled]: (state, action) => {
      const { account, avatar, nickname, online } = action.payload.data;
      state.friends.push({
        account,
        avatar,
        last_message: { content: '我通过了你的好友请求' },
        nickname,
        online,
      });
    },
    [newFriend.rejected]: (state) => {
      showSnack(state, '有一个新的好友请求通过，但获取详情失败', 'error');
    },
    // 这里必须用字符串，因为有循环依赖
    'getNewMessage/pending': (state) => {
      state.mainLoading = true;
    },
    'getNewMessage/rejected': (state) => {
      showSnack(state, '无法获取历史消息', 'error');
    },
    'getNewMessage/fulfilled': (state) => {
      state.mainLoading = false;
    },
    [ping.pending]: (state) => {
      state.mainLoading = true;
    },
    [ping.fulfilled]: (state, action) => {
      state.friends = action.payload.data.friends;
      if (action.data.token) {
        state.token = action.data.token;
      }
    },
    [ping.rejected]: (state) => {
      state.mainLoading = false;
      showSnack(state, '无法连接服务器', 'error');
    },
  },
});

export default chatSlice.reducer;

export const {
  setInitInfo,
  closeAddDialog,
  clearError,
  closeSnackbar,
  openSnackbar,
  closeAddConfirm,
  openAddConfirm,
  selectFriend,
  incomingMessage,
  clearDot,
  logout,
  reconnectAttempt,
  reconnect,
} = chatSlice.actions;

const recvMessageCenter = createAsyncThunk(
  'recvMessageCenter',
  (data, thunkAPI) => {
    console.log('center', data);
    const { type } = data;
    if (type === 'request') {
      // 好友请求
      thunkAPI.dispatch(incomingRequest(data));
    } else if (type.includes('reply')) {
      // 好友通过
      thunkAPI.dispatch(newFriend(data));
    } else {
      // 消息
      thunkAPI.dispatch(incomingMessage(data));
    }
  }
);

const getNewMessage = createAsyncThunk('getHistory', (_, thunkAPI) => {
  return network.get('/history', { newMessages: true }).then(({ data }) => {
    data.forEach((message) => thunkAPI.dispatch(recvMessageCenter(message)));
  });
});

const loginSuccess = createAsyncThunk('loginSuccess', (data, thunkAPI) => {
  thunkAPI.dispatch(setInitInfo(data));
});

export {
  sendRequest,
  loginSuccess,
  searchAccount,
  incomingRequest,
  confirmRequest,
  displayHistory,
  sendMessage,
  newFriend,
  recvMessageCenter,
  getNewMessage,
  ping,
};
