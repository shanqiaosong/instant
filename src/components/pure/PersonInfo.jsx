import Avatar from '@material-ui/core/Avatar';
import React from 'react';
import PropTypes from 'prop-types';
import style from '../Info.sass';
import friendStyle from '../Friends.sass';
import network from '../../utils/network';

function PersonInfo(props) {
  const { nickname, account, avatar } = props;
  return (
    <div className={style.inner}>
      <Avatar className={friendStyle.avatar} src={network.avatarURL(avatar)} />
      <div className={style.nickname}>{nickname}</div>
      <div className={style.content}>{account}</div>
    </div>
  );
}

PersonInfo.propTypes = {
  nickname: PropTypes.string,
  account: PropTypes.number,
  avatar: PropTypes.string,
};

PersonInfo.defaultProps = {
  avatar: '',
  nickname: '',
  account: 0,
};
export default PersonInfo;
