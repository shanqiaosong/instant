import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import Badge from '@material-ui/core/Badge';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { ButtonBase } from '@material-ui/core';
import { PersonAdd } from '@material-ui/icons';
import { connect } from 'react-redux';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import style from './Friends.sass';
import network from '../utils/network';
import {
  clearDot,
  clearError,
  openAddConfirm,
  searchAccount,
  selectFriend,
} from '../redux/chatSlice';
import Message from '../model/Message';
import { messageStatus } from '../utils/consts';

function StyledBadge(props) {
  const OnlineBadge = withStyles((theme) => ({
    badge: {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: '$ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }))(Badge);
  const OfflineBadge = withStyles((theme) => ({
    badge: {
      backgroundColor: '#4c4c4c',
      color: '#4c4c4c',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: '1px solid currentColor',
        content: '""',
      },
    },
  }))(Badge);
  const { online, ...rest } = props;
  if (online) {
    return <OnlineBadge {...rest} />;
  }
  return <OfflineBadge {...rest} />;
}

StyledBadge.propTypes = {
  online: PropTypes.number.isRequired,
};

class Friends extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searching: '',
    };
  }

  handleSearchChange = (event) =>
    this.setState({ searching: event.target.value });

  handleSearch = () => {
    const { searching } = this.state;
    const { dispatch } = this.props;
    if (!searching) return;
    dispatch(searchAccount(searching));
  };

  render() {
    const { searching } = this.state;
    const { friends, searchErr, dispatch, selectedFriend } = this.props;
    return (
      <div className={style.wrapper}>
        <ClickAwayListener onClickAway={() => dispatch(clearError())}>
          <TextField
            label="搜索账号"
            variant="outlined"
            className={style.search}
            InputProps={{
              endAdornment: <SearchIcon />,
            }}
            error={Boolean(searchErr)}
            helperText={searchErr}
            value={searching}
            onChange={this.handleSearchChange}
            onKeyPress={(ev) => {
              if (ev.key === 'Enter') {
                this.handleSearch();
                ev.preventDefault();
              }
            }}
          />
        </ClickAwayListener>
        <div className={[style.listWrap, 'friendList'].join(' ')}>
          <div className={style.list}>
            {friends.length === 0 && (
              <div className={style.empty}>
                <PersonAdd /> <br />
                请在搜索框中键入对方账号来添加好友
              </div>
            )}
            {friends.map((friend) => {
              const {
                account,
                nickname,
                online,
                avatar,
                messageCnt,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                last_message,
                isRequest,
              } = friend;
              return (
                <ButtonBase
                  onClick={() => {
                    if (isRequest) {
                      dispatch(openAddConfirm(friend));
                    } else {
                      dispatch(selectFriend(friend));
                    }
                    dispatch(clearDot());
                  }}
                  onDragEnter={() => {
                    if (!isRequest) {
                      dispatch(selectFriend(friend));
                      dispatch(clearDot());
                    }
                  }}
                  key={account}
                  className={[
                    style.friend,
                    selectedFriend.account === account ? style.selected : null,
                  ].join(' ')}
                >
                  <StyledBadge
                    overlap="circle"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    variant="dot"
                    online={online}
                  >
                    <Avatar
                      className={style.avatar}
                      src={network.avatarURL(avatar)}
                    />
                  </StyledBadge>
                  <div className={style.nickname}>{nickname}</div>
                  <div className={style.content}>
                    {new Message(
                      messageStatus.stored,
                      last_message
                    ).getPreview()}
                  </div>

                  <Badge
                    color="error"
                    className={style.messageCnt}
                    badgeContent={messageCnt}
                  />
                </ButtonBase>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

Friends.propTypes = {
  friends: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  searchErr: PropTypes.string.isRequired,
  selectedFriend: PropTypes.object.isRequired,
};

function stateMap({ chatSlice: { friends, searchErr, selectedFriend } }) {
  return {
    friends,
    searchErr,
    selectedFriend,
  };
}

export default connect(stateMap)(Friends);
