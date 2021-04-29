import React from 'react';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import {
  Check,
  CheckCircleOutline,
  EmojiPeople,
  ErrorOutline,
  Help,
  HowToReg,
  InsertEmoticon,
  MoreHoriz,
  Send,
} from '@material-ui/icons';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Tooltip } from '@material-ui/core';
import style from './Dialog.sass';
import { clearDot, displayHistory, sendMessage } from '../redux/chatSlice';

class ChatDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      error: '',
    };
  }

  componentDidMount() {
    this.toBottom();
    setTimeout(this.toBottom, 500);
  }

  componentDidUpdate(prevProps) {
    const { dispatch, friendAccount, history } = this.props;
    console.log(friendAccount);
    if (friendAccount !== prevProps.friendAccount && friendAccount)
      dispatch(displayHistory()).then(this.toBottom);
    if (history.length !== prevProps.history.length) this.toBottom();
  }

  handleSend = () => {
    const { dispatch } = this.props;
    const { input } = this.state;
    this.setState({
      error: input ? '' : '不能发送空白消息',
    });
    if (!input) return;
    const clientID = String(Date.now()) + String(Math.random());
    dispatch(sendMessage({ input, clientID }));
    this.setState({ input: '' });
  };

  toBottom = () => {
    const scrollElem = document.querySelector('#scroll');
    if (!scrollElem) return;
    scrollElem.scrollTop = scrollElem.scrollHeight;
  };

  showContent = (diag) => {
    if (diag.type === 'text') {
      return diag.content;
    }
    if (diag.type.includes('reply')) {
      return (
        <div>
          <HowToReg className={style.typeIcon} /> 我通过了你的好友请求
        </div>
      );
    }
    if (diag.type === 'requested' || diag.type === 'request') {
      return (
        <div>
          <EmojiPeople className={style.typeIcon} /> {diag.content}
        </div>
      );
    }
    return (
      <div>
        <Help className={style.typeIcon} /> 未识别的消息
      </div>
    );
  };

  showTime = (time) => {
    if (!time) return false;
    const diagTime = new Date(time);
    function getFullDate(d) {
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    }
    function getFullTime(d) {
      return d.toTimeString().slice(0, 5);
    }
    if (getFullDate(diagTime) === getFullDate(new Date())) {
      return getFullTime(diagTime);
    }
    return `${getFullDate(diagTime)} ${getFullTime(diagTime)}`;
  };

  render() {
    const { history, account, dispatch, friendAccount } = this.props;
    const { input, error } = this.state;
    if (!friendAccount) {
      return <div />;
    }
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
      <div
        onKeyDown={() => dispatch(clearDot())}
        onClick={() => dispatch(clearDot())}
        className={style.wrapper}
      >
        <div id="scroll" className={style.dialogList}>
          <div className={style.dialogInner}>
            {history.map((diag) => {
              return (
                <div
                  key={diag.id}
                  className={[
                    style.diagBox,
                    style[diag.fromUser === account ? 'to' : 'from'],
                  ].join(' ')}
                >
                  <div className={style.status}>
                    {diag.pending && (
                      <CircularProgress
                        className={style.loading}
                        color="primary"
                      />
                    )}
                    {!diag.pending && !diag.error && <Check color="primary" />}
                    {Boolean(diag.error) && (
                      <Tooltip arrow title={diag.error}>
                        <ErrorOutline color="primary" />
                      </Tooltip>
                    )}
                  </div>
                  <div className={style.pop}>{this.showContent(diag)}</div>
                  <div className={style.time}>
                    {this.showTime(diag.createdAt) || (
                      <MoreHoriz className={style.noTime} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={style.inputBox}>
          <TextField
            error={Boolean(error)}
            placeholder={error || '输入想要发送的内容'}
            variant="outlined"
            className={style.input}
            value={input}
            onChange={(e) => this.setState({ input: e.target.value })}
            onKeyPress={(ev) => {
              if (ev.key === 'Enter') {
                this.handleSend();
                ev.preventDefault();
              }
            }}
          />
          <IconButton className={style.emojiBtn}>
            <InsertEmoticon />
          </IconButton>
          <IconButton
            onClick={this.handleSend}
            className={style.sendBtn}
            color="primary"
          >
            <Send />
          </IconButton>
        </div>
      </div>
    );
  }
}

ChatDialog.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.array.isRequired,
  account: PropTypes.number.isRequired,
  friendAccount: PropTypes.number.isRequired,
};

function stateMap({
  chatSlice: {
    history,
    account,
    selectedFriend: { account: friendAccount },
  },
}) {
  return {
    history,
    account,
    friendAccount: friendAccount ?? 0,
  };
}

export default connect(stateMap)(ChatDialog);
