import React from 'react';
import {
  ClickAwayListener,
  IconButton,
  TextField,
  Tooltip,
} from '@material-ui/core';
import {
  Check,
  EmojiPeople,
  ErrorOutline,
  Help,
  HowToReg,
  InsertEmoticon,
  Lock,
  MoreHoriz,
  Send,
  VpnKey,
} from '@material-ui/icons';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Picker } from 'emoji-mart';
import style from './Dialog.sass';
import {
  clearDot,
  displayHistory,
  getMoreHistory,
  sendMessage,
} from '../redux/chatSlice';

class ChatDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      error: '',
      showEmoji: false,
    };
    this.inputRef = React.createRef();
    this.scroll = React.createRef();
  }

  componentDidMount() {
    this.toBottom();
    setTimeout(this.toBottom, 500);
  }

  componentDidUpdate(prevProps) {
    const { dispatch, friendAccount, history, selectedFriend } = this.props;
    console.log(friendAccount);
    if (friendAccount !== prevProps.friendAccount && friendAccount) {
      dispatch(displayHistory({ lastID: selectedFriend.last_message.id })).then(
        this.toBottom
      );
    }
    if (
      prevProps.history &&
      history &&
      history[history.length - 1]?.id !==
        prevProps.history[prevProps.history.length - 1]?.id
    )
      this.toBottom();
  }

  selectEmoji = (emoji) => {
    this.setState(({ input }) => ({
      input: input + emoji.native,
      showEmoji: false,
    }));
    this.inputRef.current.focus();
  };

  handleSend = () => {
    const {
      dispatch,
      friendAccount,
      keys: { [friendAccount]: friendKey },
    } = this.props;
    const { input } = this.state;
    this.setState({
      error: input ? '' : '不能发送空白消息',
    });
    if (!input) return;
    const clientID = String(Date.now()) + String(Math.random());
    const useKey = friendKey;
    dispatch(
      sendMessage({
        input,
        clientID,
        type: useKey ? 'secured' : 'text',
        useKey,
      })
    );
    this.setState({ input: '' });
  };

  toBottom = () => {
    const scrollElem = this.scroll.current;
    if (!scrollElem) return;
    scrollElem.scrollTop = scrollElem.scrollHeight;
  };

  handleScroll = () => {
    const scrollElem = this.scroll.current;
    const { dispatch, history } = this.props;
    if (Math.abs(scrollElem.scrollTop) === 0) {
      setTimeout(() => {
        if (Math.abs(scrollElem.scrollTop) === 0) {
          const content = scrollElem;

          const curScrollPos = content.scrollTop;
          const oldScroll = content.scrollHeight - content.clientHeight;

          dispatch(getMoreHistory({ lastID: history[0].id })).then(() => {
            const newScroll = content.scrollHeight - content.clientHeight;
            content.scrollTop = curScrollPos + (newScroll - oldScroll);
            if (curScrollPos + (newScroll - oldScroll) > 0)
              content.scrollTo({
                top: curScrollPos + (newScroll - oldScroll) - 90,
                behavior: 'smooth',
              });
          });
        }
      }, 300);
    }
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
    if (diag.type === 'key') {
      return (
        <div>
          <VpnKey className={style.typeIcon} /> 这是我的公钥
        </div>
      );
    }
    if (diag.type === 'secured') {
      return (
        <div>
          <Lock className={style.typeIcon} /> {diag.content}
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
    const { input, error, showEmoji } = this.state;
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
        <div
          ref={this.scroll}
          onScroll={() => {
            this.handleScroll();
          }}
          id="scroll"
          className={style.dialogList}
        >
          <div className={style.dialogInner}>
            {history.map((diag) => {
              const innerContent = diag && this.showContent(diag);
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
                  {/^\p{Extended_Pictographic}$/u.test(innerContent) ? (
                    <div key={diag.id} className={style.emoji}>
                      {innerContent}
                    </div>
                  ) : (
                    <div key={diag.id} className={style.pop}>
                      {innerContent}
                    </div>
                  )}
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
            multiline
            rowsMax={3}
            error={Boolean(error)}
            placeholder={error || '输入想要发送的内容'}
            variant="outlined"
            className={style.input}
            value={input}
            onChange={(e) => this.setState({ input: e.target.value })}
            onKeyPress={(ev) => {
              if (ev.key === 'Enter' && !ev.shiftKey) {
                this.handleSend();
                ev.preventDefault();
              }
            }}
            inputRef={this.inputRef}
          />
          {showEmoji && (
            <ClickAwayListener
              onClickAway={() => this.setState({ showEmoji: false })}
            >
              <div className={style.picker}>
                <Picker
                  color="#6b19ff"
                  native
                  showPreview={false}
                  showSkinTones={false}
                  onSelect={this.selectEmoji}
                />
              </div>
            </ClickAwayListener>
          )}
          <IconButton
            onClick={() => {
              this.setState({
                showEmoji: true,
              });
            }}
            className={style.emojiBtn}
          >
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
  keys: PropTypes.object.isRequired,
  selectedFriend: PropTypes.object.isRequired,
};

function stateMap({ chatSlice: { history, account, selectedFriend, keys } }) {
  return {
    history,
    account,
    friendAccount: selectedFriend.account ?? 0,
    selectedFriend,
    keys,
  };
}

export default connect(stateMap)(ChatDialog);
