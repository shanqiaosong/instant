import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import network from '../utils/network';
import { socketSend } from '../utils/socket';
import { updateHistory, updateLastMessage } from './chatUtils';
import { getHistoryHttp } from '../utils/http';
import Message from '../model/Message';
import { messageStatus } from '../utils/consts';
import getTranslate from '../utils/translate';

// 搜索账号
const searchAccount = createAsyncThunk('searchAccount', (data) => {
  return network.get('/search', { toUser: data });
});
const socketSendWrapper = ({ message }, thunkAPI) => {
  const { token } = thunkAPI.getState().chatSlice;
  return socketSend({
    token,
    message: message.toSendable(),
  });
};
// 发送好友请求
const sendRequest = createAsyncThunk('sendRequest', socketSendWrapper);
// 收到好友请求
const incomingRequest = createAsyncThunk('incomingRequest', ({ message }) => {
  console.log('incomingRequest', message);
  return new Promise((resolve, reject) => {
    network
      .get('/search', { toUser: message.fromUser })
      .then(({ data: userData }) => {
        userData.message = message;
        resolve(userData);
      })
      .catch((err) => reject(err));
  });
});
// 通过申请
const confirmRequest = createAsyncThunk('confirmRequest', socketSendWrapper);
// 获取历史消息记录
const displayHistory = createAsyncThunk('displayHistory', ({ user, lastID }) =>
  getHistoryHttp(user, lastID + 1)
);
const getMoreHistory = createAsyncThunk('getMoreHistory', ({ user, lastID }) =>
  getHistoryHttp(user, lastID)
);
// 发消息
const sendMessage = createAsyncThunk('sendMessage', socketSendWrapper);
// 对方同意
const newFriend = createAsyncThunk(
  'newFriend',
  ({ message: { fromUser: toUser } }) => {
    return network.get('/search', { toUser });
  }
);
// 周期与服务器同步
const ping = createAsyncThunk('ping', (data, thunkAPI) => {
  const { token } = thunkAPI.getState().chatSlice;
  return network.post('/ping', { token });
});
// 删除好友
const deleteFriend = createAsyncThunk(
  'deleteFriend',
  ({ toUser }, thunkAPI) => {
    const { token } = thunkAPI.getState().chatSlice;
    return network.post('/delete', { token, toUser });
  }
);

const sendFile = createAsyncThunk('sendFile', ({ message }, thunkAPI) => {
  const { token } = thunkAPI.getState().chatSlice;
  console.log('[chatSlice]', message);
  return network.uploadFile(message.rawContent, token).then((result) => {
    thunkAPI.dispatch(
      sendMessage({
        message: new Message(messageStatus.uncommitted, {
          type: message.type,
          content: result.data.id,
          toUser: message.toUser,
          clientID: message.clientID,
        }),
      })
    );
  });
});

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
  keys: {},
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
      state.friends = friends.map((friend) => {
        return {
          ...friend,
          last_message: new Message(
            messageStatus.committed,
            friend.last_message,
            state
          ).toStorable(),
        };
      });
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
      state.friends.forEach((friend) => {
        if (friend.account === state.adderInfo.account) {
          friend.messageCnt = 0;
        }
      });
    },
    closeAddConfirm(state) {
      state.showAddConfirm = false;
      state.friends.splice(
        state.friends.findIndex(
          (friend) => friend.account === state.adderInfo.account
        ),
        1
      );
      state.adderInfo = {};
    },
    selectFriend(state, action) {
      if (action.payload.account !== state.selectedFriend.account)
        state.history = [];
      state.selectedFriend = action.payload;
    },
    incomingMessage(state, action) {
      const { message } = action.payload;
      updateHistory(state, message);
      updateLastMessage(state, message);
    },
    clearDot(state) {
      state.friends.forEach((friend) => {
        if (friend.account === state.selectedFriend?.account) {
          friend.messageCnt = 0;
        }
      });
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
    saveKey(state, action) {
      console.log(action.payload);
      state.keys[action.payload.user] = action.payload.key;
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
      state.searchErr = getTranslate(action.error.message);
    },
    [sendRequest.pending]: (state) => {
      state.mainLoading = true;
    },
    [sendRequest.fulfilled]: (state, action) => {
      const { id, createdAt } = action.payload;
      state.showAddDialog = false;
      showSnack(state, '已发送', 'success');
      const { message } = action.meta.arg;
      message.id = id;
      message.createdAt = createdAt;
      message.pending = false;
      updateHistory(state, message);
      updateLastMessage(state, message);
    },
    [sendRequest.rejected]: (state, action) => {
      showSnack(state, getTranslate(action.error.message), 'error');
    },
    [incomingRequest.fulfilled]: (state, action) => {
      const { avatar, account, nickname, message, online } = action.payload;
      const friendPos = state.friends.findIndex(
        (value) => value.account === account
      );
      console.log(friendPos);
      const requestListView = message.getRequestListView();

      if (friendPos > -1) {
        const friend = state.friends[friendPos];
        friend.last_message = message.toStorable();
        if (friend.requests) friend.requests.push(requestListView);
        else friend.requests = [requestListView];
        friend.isRequest = true;
        // 如果对方删掉重新添加，并且此时正在与对方聊天，
        // 要更新聊天界面记录，并且弹出提示
        if (updateHistory(state, message)) {
          state.showAddConfirm = true;
          state.adderInfo = friend;
        } else {
          friend.messageCnt += 1;
        }
      } else {
        state.friends.unshift({
          avatar,
          account,
          nickname,
          last_message: message.toStorable(),
          messageCnt: 1,
          requests: [requestListView],
          isRequest: true,
          online,
        });
      }
    },
    [incomingRequest.rejected]: (state, action) => {
      showSnack(
        state,
        getTranslate('有一个新的好友请求，但', action.error.message),
        'error'
      );
    },
    [confirmRequest.pending]: (state) => {
      state.mainLoading = true;
    },
    [confirmRequest.fulfilled]: (state, action) => {
      showSnack(state, '已确认', 'success');
      const { id } = action.payload;
      console.log(id);
      const friendIndex = state.friends.findIndex(
        (friend) => friend.account === action.payload.toUser
      );
      state.friends[friendIndex].last_message.content = '我通过了你的好友请求';
      state.friends[friendIndex].last_message.type = 'reply';
      state.friends[friendIndex].last_message.id = id;
      state.friends[friendIndex].isRequest = false;
      state.friends[friendIndex].requests = [];
      state.showAddConfirm = false;
      state.selectedFriend = state.friends[friendIndex];
    },
    [confirmRequest.rejected]: (state, action) => {
      showSnack(state, getTranslate(action.error.message), 'error');
    },
    [displayHistory.pending]: (state) => {
      state.mainLoading = true;
    },
    [displayHistory.fulfilled]: (state, action) => {
      state.mainLoading = false;
      state.history = action.payload.data
        .map((message) =>
          new Message(messageStatus.committed, message, state).toStorable()
        )
        .sort(({ id: idA }, { id: idB }) => idA - idB)
        // 防止太多导致显示缓慢
        .slice(-5);
    },
    [displayHistory.rejected]: (state, action) => {
      showSnack(state, getTranslate(action.error.message), 'error');
    },
    [getMoreHistory.pending]: (state) => {
      state.mainLoading = true;
    },
    [getMoreHistory.fulfilled]: (state, action) => {
      state.mainLoading = false;
      state.history = [
        ...action.payload.data
          .filter(({ id }) => id < state.history[0].id)
          .map((chat) =>
            new Message(messageStatus.committed, chat, state).toStorable()
          )
          .sort(({ id: idA }, { id: idB }) => idA - idB),
        ...state.history,
      ];
    },
    [getMoreHistory.rejected]: (state, action) => {
      showSnack(state, getTranslate(action.error.message), 'error');
    },
    [sendMessage.pending]: (state, action) => {
      try {
        const { message } = action.meta.arg;
        updateHistory(state, message);
        // 为了防止发送失败时拉取不到消息，成功时再进行更新
        // updateLastMessage(state, message);
      } catch (e) {
        console.error(e);
      }
    },
    [sendMessage.fulfilled]: (state, action) => {
      const { id, createdAt } = action.payload;
      const { message } = action.meta.arg;
      message.pending = false;
      message.id = id;
      message.createdAt = createdAt;
      updateHistory(state, message);
      updateLastMessage(state, message);
    },
    [sendMessage.rejected]: (state, action) => {
      const { message } = action.meta.arg;
      message.pending = false;
      message.error = getTranslate(action.error.message);
      updateHistory(state, message);
      updateLastMessage(state, message, false);
    },
    [newFriend.fulfilled]: (state, action) => {
      const { account, avatar, nickname, online } = action.payload.data;
      const { message } = action.meta.arg;
      const idx = state.friends.findIndex(
        (friend) => friend.account === account
      );
      if (idx !== -1) {
        updateLastMessage(state, message);
        // 如果此时正在与对方聊天，
        // 要更新聊天界面记录
        updateHistory(state, message);
      } else {
        state.friends.unshift({
          account,
          avatar,
          last_message: message.toStorable(),
          nickname,
          online,
        });
      }
    },
    [newFriend.rejected]: (state, action) => {
      showSnack(
        state,
        `有一个新的好友请求通过，但${getTranslate(action.error.message)}`,
        'error'
      );
    },
    // 这里必须用字符串，因为有循环依赖
    'getNewMessage/pending': (state) => {
      state.mainLoading = true;
    },
    'getNewMessage/rejected': (state, action) => {
      showSnack(state, getTranslate(action.error.message), 'error');
    },
    'getNewMessage/fulfilled': (state) => {
      state.mainLoading = false;
    },
    [ping.pending]: (state) => {
      state.mainLoading = true;
    },
    [ping.fulfilled]: (state, action) => {
      state.friends = state.friends
        .filter(({ isRequest }) => isRequest)
        .concat(
          action.payload.data.friends.map((friend) => {
            return {
              ...friend,
              last_message: new Message(
                messageStatus.committed,
                friend.last_message,
                state
              ).toStorable(),
            };
          })
        );
      if (action.payload.data.new_token) {
        state.token = action.payload.data.new_token;
      }
      state.mainLoading = false;
    },
    [ping.rejected]: (state, action) => {
      state.mainLoading = false;
      showSnack(state, getTranslate(action.error.message), 'error');
    },
    [deleteFriend.pending]: (state) => {
      state.mainLoading = true;
    },
    [deleteFriend.fulfilled]: (state, action) => {
      console.log(state, action);
      state.friends.splice(
        state.friends.findIndex(
          ({ account }) => account === action.meta.arg.toUser
        ),
        1
      );
      showSnack(state, '已删除', 'success');
      state.selectedFriend = {};
      state.mainLoading = false;
    },
    [deleteFriend.rejected]: (state, action) => {
      state.mainLoading = false;
      showSnack(state, getTranslate(action.error.message), 'error');
    },
    [sendFile.pending]: (state) => {
      state.mainLoading = true;
      showSnack(state, '上传中', 'info');
    },
    [sendFile.rejected]: (state, action) => {
      state.mainLoading = true;
      showSnack(state, getTranslate(action.error.message), 'error');
    },
    [sendFile.fulfilled]: (state) => {
      state.mainLoading = true;
      showSnack(state, '发送成功', 'success');
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
  saveKey,
} = chatSlice.actions;

const recvMessageCenter = createAsyncThunk(
  'recvMessageCenter',
  ({ message: rawMessage }, thunkAPI) => {
    const message = new Message(
      messageStatus.committed,
      rawMessage,
      thunkAPI.getState().chatSlice
    );
    message.react();
  }
);

const getNewMessage = createAsyncThunk('getHistory', (_, thunkAPI) => {
  return network.get('/history', { newMessages: true }).then(({ data }) => {
    data.forEach((message) =>
      thunkAPI.dispatch(recvMessageCenter({ message }))
    );
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
  deleteFriend,
  getMoreHistory,
  sendFile,
};
