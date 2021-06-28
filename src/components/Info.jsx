import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import Tooltip from '@material-ui/core/Tooltip';
import style from './Info.sass';
import PersonInfo from './pure/PersonInfo';
import { deleteFriend } from '../redux/chatSlice';
import Message from '../model/Message';
import { messageStatus, messageTypes } from '../utils/consts';

function Info(props) {
  const { selectedFriend, dispatch, keys } = props;
  const { avatar, nickname, account, gender } = selectedFriend;
  if (!selectedFriend.account) {
    return <div />;
  }
  return (
    <div className={style.wrapper}>
      <PersonInfo
        secured={!!keys[account]}
        nickname={nickname}
        account={account}
        avatar={avatar}
        gender={gender}
      />
      <Tooltip title="向对方发送我的公钥，则对方可以安全地向我发送信息。">
        <IconButton
          onClick={() => {
            const message = new Message(messageStatus.uncommitted, {
              toUser: selectedFriend.account,
              type: messageTypes.key,
            });
            message.send();
          }}
          className={style.sendKey}
          aria-label="sendKey"
        >
          <VpnKeyIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="删除好友">
        <IconButton
          onClick={() => dispatch(deleteFriend({ toUser: account }))}
          className={style.delete}
          aria-label="delete"
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
}

Info.propTypes = {
  selectedFriend: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  keys: PropTypes.object.isRequired,
};

function stateMap({ chatSlice: { selectedFriend, keys } }) {
  return {
    selectedFriend,
    keys,
  };
}

export default connect(stateMap)(Info);
