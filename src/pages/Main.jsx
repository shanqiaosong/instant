import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withSnackbar } from 'notistack';
import { io } from 'socket.io-client';
import { connect } from 'react-redux';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { Divider } from '@material-ui/core';
import animateToSize from '../utils/animateToSize';
import LeftList from '../components/LeftList';
import animateToggleMain from '../utils/animateToggleMain';
import style from './Main.sass';
import Friends from '../components/Friends';
import Header from '../components/Header';
import Info from '../components/Info';
import {
  closeAddConfirm,
  closeAddDialog,
  closeSnackbar,
  confirmRequest,
  getNewMessage,
  ping,
  reconnect,
  reconnectAttempt,
  recvMessageCenter,
  sendRequest,
} from '../redux/chatSlice';
import ChatDialog from '../components/ChatDialog';
import PersonInfo from '../components/pure/PersonInfo';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class Main extends React.Component {
  width = 1045;

  height = 661;

  constructor(props) {
    super(props);
    this.state = {
      content: '',
      error: '',
    };
  }

  componentDidMount() {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { closeSnackbar, token, dispatch } = this.props;
    // history.push('/signup');
    animateToSize(this.width, this.height);
    animateToggleMain.toggleToMain();
    // 消除所有提示
    closeSnackbar();

    window.socket = io('http://mctzxc.com:15001', {
      auth: { token },
      path: '/api/v1/socket',
    });

    window.socket.on('recvMessage', (message) => {
      dispatch(recvMessageCenter(message));
    });

    dispatch(getNewMessage());

    window.pingIntv = setInterval(() => {
      dispatch(ping());
    }, 10 * 60 * 1000); // 10min
    window.socket.io.on('reconnect_attempt', () => {
      dispatch(reconnectAttempt());
    });

    window.socket.io.on('reconnect', () => {
      dispatch(reconnect());
    });
  }

  handleClose = () => {
    const { dispatch } = this.props;
    dispatch(closeAddDialog());
  };

  handleSnackClose = () => {
    const { dispatch } = this.props;
    dispatch(closeSnackbar());
  };

  handleAddConfirmClose = () => {
    const { dispatch } = this.props;
    dispatch(closeAddConfirm());
  };

  handleAddRequest = () => {
    const { content } = this.state;
    const { dispatch } = this.props;
    this.setState({
      error: content ? '' : '请输入验证消息',
    });
    if (!content) return;
    dispatch(sendRequest({ content }));
  };

  render() {
    const {
      showAddDialog,
      mainLoading,
      dispatch,
      showSnackbar,
      snackbarMessage,
      snackbarType,
      addInfo,
      showAddConfirm,
      adderInfo,
    } = this.props;
    const { content, error } = this.state;
    return (
      <div className="Main">
        <Snackbar
          className={style.snackbar}
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={this.handleSnackClose}
        >
          <Alert onClose={this.handleSnackClose} severity={snackbarType}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Dialog
          fullWidth
          open={showAddDialog}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            添加 {addInfo.nickname} 为好友
          </DialogTitle>
          <DialogContent>
            <PersonInfo
              account={addInfo.account}
              avatar={addInfo.avatar}
              nickname={addInfo.nickname}
            />
            <Divider className={style.divider} />
            <TextField
              onChange={(e) => {
                this.setState({ content: e.target.value });
              }}
              value={content}
              error={Boolean(error)}
              helperText={error}
              autoFocus
              margin="normal"
              label="我是..."
              fullWidth
              onKeyPress={(ev) => {
                if (ev.key === 'Enter') {
                  this.handleAddRequest();
                  ev.preventDefault();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              disabled={mainLoading}
              onClick={this.handleClose}
              color="primary"
            >
              取消
            </Button>
            <Button
              disabled={mainLoading}
              onClick={this.handleAddRequest}
              color="primary"
            >
              发送
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={showAddConfirm}
          onClose={this.handleAddConfirmClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            是否添加 {adderInfo.nickname} 为好友？
          </DialogTitle>
          <DialogContent>
            验证信息：
            <ul>
              {adderInfo.requests?.map((request) => (
                <li key={request.id}>{request.content}</li>
              ))}
            </ul>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleAddConfirmClose} color="primary">
              拒绝
            </Button>
            <Button
              onClick={() =>
                dispatch(
                  confirmRequest({
                    id: adderInfo.requests[0].id,
                    toUser: adderInfo.account,
                  })
                )
              }
              color="primary"
              autoFocus
            >
              同意
            </Button>
          </DialogActions>
        </Dialog>
        <div className={style.left}>
          <LeftList />
        </div>
        <div className={style.right}>
          <div className={style.header}>
            <Header loading={mainLoading} title="聊天" />
          </div>
          <div className={style.friendList}>
            <Friends />
          </div>
          <div className={style.infoCard}>
            <Info
              friend={{
                nickname: '哈哈哈',
                online: 1,
                info: '你好啊',
              }}
            />
          </div>
          <div className={style.dialog}>
            <ChatDialog />
          </div>
        </div>
      </div>
    );
  }
}

Main.propTypes = {
  closeSnackbar: PropTypes.func.isRequired,
  showAddDialog: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  mainLoading: PropTypes.bool.isRequired,
  token: PropTypes.string.isRequired,
  showSnackbar: PropTypes.bool.isRequired,
  snackbarMessage: PropTypes.string.isRequired,
  snackbarType: PropTypes.string.isRequired,
  addInfo: PropTypes.object.isRequired, // 在请求添加别人时
  adderInfo: PropTypes.object.isRequired, // 收到请求时
  showAddConfirm: PropTypes.bool.isRequired,
};

function stateMap({
  chatSlice: {
    token,
    showAddDialog,
    mainLoading,
    showSnackbar,
    snackbarMessage,
    snackbarType,
    addInfo,
    showAddConfirm,
    adderInfo,
  },
}) {
  return {
    token,
    showAddDialog,
    mainLoading,
    showSnackbar,
    snackbarMessage,
    snackbarType,
    addInfo,
    showAddConfirm,
    adderInfo,
  };
}

export default connect(stateMap)(withRouter(withSnackbar(Main)));
