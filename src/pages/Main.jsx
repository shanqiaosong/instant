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
import { ipcRenderer, shell } from 'electron';
import animateToSize from '../utils/animateToSize';
import animateToggleMain from '../utils/animateToggleMain';
import style from './Main.sass';
import Header from '../components/Header';
import Info from '../components/Info';
import Friends from '../components/Friends';
import LeftList from '../components/LeftList';
import {
  clearDot,
  closeAddConfirm,
  closeAddDialog,
  closeSnackbar,
  getNewMessage,
  openSnackbar,
  ping,
  reconnect,
  reconnectAttempt,
  recvMessageCenter,
} from '../redux/chatSlice';
import ChatDialog from '../components/ChatDialog';
import PersonInfo from '../components/pure/PersonInfo';
import { messageStatus, messageTypes, version } from '../utils/consts';
import Message from '../model/Message';
import network from '../utils/network';

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
      update: {},
      neverShowUpdate: false,
      showUpdate: false,
    };
  }

  componentDidMount() {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { closeSnackbar, token, dispatch } = this.props;
    // history.push('/signup');
    animateToSize(this.width, this.height);
    animateToggleMain.toggleToMain();
    // ??????????????????
    closeSnackbar();

    window.socket = io('http://mctzxc.com:15001', {
      auth: { token },
      path: '/api/v1/socket',
    });

    window.socket.on('recvMessage', (message) => {
      dispatch(recvMessageCenter({ message }));
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

    // checkUpdate
    window.checkUpdateIntv = setInterval(
      () => this.checkUpdate(),
      1000 * 60 * 10 // 10min
      // 10000 // 10s
    );
    setTimeout(() => {
      this.checkUpdate();
    }, 2000);

    const NOTIFICATION_TITLE = `Instant ??????????????????`;
    const NOTIFICATION_BODY = '???????????????????????????????????????';

    new Notification(NOTIFICATION_TITLE, {
      body: NOTIFICATION_BODY,
    }).onclick = () => ipcRenderer.sendSync('focus');
  }

  componentWillUnmount() {
    clearInterval(window.pingIntv);
    clearInterval(window.checkUpdateIntv);
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
    const {
      addInfo: { account: toUser },
    } = this.props;
    this.setState({
      error: content ? '' : '?????????????????????',
    });
    if (!content) return;
    const message = new Message(messageStatus.uncommitted, {
      toUser,
      content,
      type: messageTypes.request,
    });
    message.send();
  };

  async checkUpdate(force = false) {
    const { neverShowUpdate } = this.state;
    if (neverShowUpdate && !force) return;
    const { dispatch } = this.props;
    try {
      const update = await network.checkUpdate();
      if (update.latest > version) {
        this.setState({
          update,
          showUpdate: true,
        });
      } else if (force) {
        dispatch(
          openSnackbar({ type: 'success', message: '?????????????????????????????????' })
        );
      }
    } catch (e) {
      dispatch(openSnackbar({ type: 'error', message: '??????????????????' }));
      this.setState({
        neverShowUpdate: true,
      });
    }
  }

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
    const { content, error, update, showUpdate } = this.state;
    return (
      <div className="Main">
        {/* ??????????????? */}
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
        {/* ????????????????????? */}
        <Dialog
          fullWidth
          disableBackdropClick
          open={showAddDialog}
          onClose={this.handleClose}
        >
          <DialogTitle>?????? {addInfo.nickname} ?????????</DialogTitle>
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
              label="??????..."
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
              ??????
            </Button>
            <Button
              disabled={mainLoading}
              onClick={this.handleAddRequest}
              color="primary"
            >
              ??????
            </Button>
          </DialogActions>
        </Dialog>
        {/* ??????????????????????????? */}
        <Dialog
          disableBackdropClick
          open={showAddConfirm}
          onClose={this.handleAddConfirmClose}
        >
          <DialogTitle>???????????? {adderInfo.nickname} ????????????</DialogTitle>
          <DialogContent>
            ???????????????
            <ul>
              {adderInfo.requests?.map((request) => (
                <li key={request.id}>{request.content}</li>
              ))}
            </ul>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleAddConfirmClose} color="primary">
              ??????
            </Button>
            <Button
              onClick={() => {
                const message = new Message(messageStatus.uncommitted, {
                  toUser: adderInfo.account,
                  type: `reply${adderInfo.requests[0].id}`,
                });
                message.send();
                dispatch(clearDot());
              }}
              color="primary"
              autoFocus
            >
              ??????
            </Button>
          </DialogActions>
        </Dialog>
        {/* ??????????????? */}
        <Dialog disableBackdropClick open={showUpdate}>
          <DialogTitle>??????????????????{update.latest}</DialogTitle>
          <DialogContent>
            ???????????????
            <ul>
              {update.info?.map((info, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={idx}>{info}</li>
              ))}
            </ul>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                this.setState({ showUpdate: false });
              }}
              color="primary"
            >
              ????????????
            </Button>
            <Button
              onClick={() => {
                this.setState({ showUpdate: false, neverShowUpdate: true });
              }}
              color="primary"
            >
              ??????????????????
            </Button>
            <Button
              onClick={() => {
                shell.openExternal(update.url);
              }}
              color="primary"
              autoFocus
            >
              ??????
            </Button>
          </DialogActions>
        </Dialog>
        <div className={style.left}>
          <LeftList checkUpdate={() => this.checkUpdate(true)} />
        </div>
        <div className={style.right}>
          <div>
            <Header loading={mainLoading} title="??????" />
          </div>
          <div className={style.friendList}>
            <Friends />
          </div>
          <div className={style.infoCard}>
            <Info
              friend={{
                nickname: '?????????',
                online: 1,
                info: '?????????',
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
  addInfo: PropTypes.object.isRequired, // ????????????????????????
  adderInfo: PropTypes.object.isRequired, // ???????????????
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
