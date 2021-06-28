import React from 'react';
import {
  ClickAwayListener,
  IconButton,
  TextField,
  Tooltip,
} from '@material-ui/core';
import {
  Check,
  ErrorOutline,
  InsertEmoticon,
  MoreHoriz,
  Send,
} from '@material-ui/icons';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import { clipboard, ipcRenderer } from 'electron';

import { Picker } from 'emoji-mart';
import style from './Dialog.sass';
import { clearDot, displayHistory, getMoreHistory } from '../redux/chatSlice';
import Message from '../model/Message';
import { messageStatus, messageTypes } from '../utils/consts';

class ChatDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      error: '',
      showEmoji: false,
      showDropMask: false,
    };
    this.inputRef = React.createRef();
    this.scroll = React.createRef();
    this.innerContent = React.createRef();
  }

  componentDidMount() {
    this.toBottom();
    setTimeout(this.toBottom, 500);
  }

  componentDidUpdate(prevProps) {
    const { dispatch, friendAccount, history, selectedFriend } = this.props;
    console.log(friendAccount);
    if (friendAccount !== prevProps.friendAccount && friendAccount) {
      dispatch(
        displayHistory({
          lastID: selectedFriend.last_message.id,
          user: friendAccount,
        })
      );
    } else if (
      prevProps.history &&
      history &&
      (history[history.length - 1]?.id ||
        history[history.length - 1]?.clientID) !==
        (prevProps.history[prevProps.history.length - 1]?.id ||
          prevProps.history[prevProps.history.length - 1]?.clientID)
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
      friendAccount,
      keys: { [friendAccount]: friendKey },
    } = this.props;
    const { input } = this.state;
    try {
      const message = new Message(messageStatus.uncommitted, {
        content: input,
        toUser: friendAccount,
        type: friendKey ? messageTypes.secured : messageTypes.text,
      });
      message.send();
      this.setState({
        input: '',
      });
    } catch ({ message }) {
      this.setState({
        error: message,
        input: '',
      });
    }
  };

  toBottom = () => {
    const scrollElem = this.scroll.current;
    if (!scrollElem) return;
    setTimeout(() => {
      scrollElem.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  handleScroll = () => {
    const scrollElem = this.scroll.current;
    const contentElem = this.innerContent.current;
    const { dispatch, history, friendAccount } = this.props;
    if (!history.length) return;
    console.log(
      contentElem.clientHeight,
      scrollElem.clientHeight,
      contentElem.scrollTop,
      scrollElem.scrollTop
    );
    const checkRefresh = () =>
      Math.abs(
        contentElem.clientHeight -
          scrollElem.clientHeight +
          scrollElem.scrollTop
      ) < 10;
    if (checkRefresh()) {
      setTimeout(() => {
        if (checkRefresh()) {
          dispatch(
            getMoreHistory({ user: friendAccount, lastID: history[0].id })
          ).then(() => {
            scrollElem.scrollTo({
              top: scrollElem.scrollTop - 90,
              behavior: 'smooth',
            });
          });
        }
      }, 300);
    }
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

  handleDrop = (ev) => {
    ev.preventDefault();
    if (!ev.dataTransfer.items) return;
    let sent = false;
    for (let j = 0; j < ev.dataTransfer.items.length; j += 1) {
      // 先检查一遍是否存在自定义文件，如果有则之后不再检查其他内容
      if (ev.dataTransfer.items[j].type === 'custom/file') {
        sent = true;
        ev.dataTransfer.items[j].getAsString((string) => {
          if (window.customFile && window.customFile.name === string) {
            this.sendFile(window.customFile);
            // 如果发送了文件，则不再添加其他文字
          }
        });
        return;
      }
    }
    if (sent) return;
    for (let i = 0; i < ev.dataTransfer.items.length; i += 1) {
      console.log(ev.dataTransfer.items[i]);
      if (ev.dataTransfer.items[i].kind === 'file') {
        // 从系统拖动发送文件
        const f = ev.dataTransfer.items[i].getAsFile();
        if (!f.type && f.size % 4096 === 0) {
          this.setState({
            error: '只能发送文件',
            input: '',
          });
          return;
        }
        this.sendFile(f);
      } else if (ev.dataTransfer.items[i].type === 'text/plain') {
        // 文字
        ev.dataTransfer.items[i].getAsString((string) => {
          this.setState((state) => ({
            input: state.input + string,
          }));
        });
      } else {
        // 其他，打印出来debug用
        console.log(ev.dataTransfer.items[i]);
        ev.dataTransfer.items[i].getAsString((string) => {
          console.log(string);
        });
      }
    }
  };

  async sendFile(file) {
    const { friendAccount } = this.props;
    try {
      const message = new Message(messageStatus.uncommitted, {
        content: file,
        toUser: friendAccount,
        type: file.name.match(/.(jpg|jpeg|png|gif)$/i)
          ? messageTypes.image
          : messageTypes.file,
      });
      message.send();
    } catch ({ message }) {
      this.setState({
        error: message,
        input: '',
      });
      console.error(message);
    }
  }

  render() {
    const { history, account, dispatch, friendAccount } = this.props;
    const { input, error, showEmoji, showDropMask } = this.state;
    if (!friendAccount) {
      return <div />;
    }
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
      <div
        onKeyDown={() => dispatch(clearDot())}
        onClick={() => dispatch(clearDot())}
        className={style.wrapper}
        onDragEnter={(e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('enter');
          this.setState({ showDropMask: true });
        }}
        onDragOver={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <div
          onDragOver={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('leave');
            this.setState({ showDropMask: false });
          }}
          onDrop={(e) => {
            this.handleDrop(e);
            e.stopPropagation();
            e.preventDefault();
            console.log('drop');
            this.setState({ showDropMask: false });
          }}
          className={showDropMask ? style.showDropMask : style.hideDropMask}
        />
        <div
          ref={this.scroll}
          onScroll={() => {
            this.handleScroll();
          }}
          id="scroll"
          className={style.dialogList}
        >
          <div ref={this.innerContent} className={style.dialogInner}>
            {history.map((diag) => {
              const innerContent =
                diag && new Message(messageStatus.stored, diag).getDialogView();
              return (
                <div
                  key={diag.id || diag.clientID}
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
            onPaste={() => {
              if (clipboard.readText()) return;
              const image = clipboard.readImage().toPNG();
              const imageFile = new File([image], `${Date.now()}.png`, {
                type: 'image/png',
              });
              if (imageFile.size > 0) {
                this.sendFile(imageFile);
                return;
              }
              const fileName =
                clipboard
                  .readBuffer('FileNameW')
                  .toString('ucs2')
                  .replace(RegExp(String.fromCharCode(0), 'g'), '') ||
                clipboard.read('public.file-url');
              const fileContent = ipcRenderer.sendSync('readFile', fileName);
              const file = new File(
                [fileContent],
                fileName.slice(fileName.lastIndexOf('\\') + 1)
              );
              if (file.size > 0) {
                this.sendFile(file);
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
          >
            <InsertEmoticon />
          </IconButton>
          <IconButton onClick={this.handleSend} color="primary">
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
