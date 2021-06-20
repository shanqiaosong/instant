import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Link } from 'react-router-dom';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import ModeCommentOutlinedIcon from '@material-ui/icons/ModeCommentOutlined';
import SettingsApplicationsOutlinedIcon from '@material-ui/icons/SettingsApplicationsOutlined';
import { ButtonBase } from '@material-ui/core';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import style from './LeftList.sass';
import network from '../utils/network';
import { logout } from '../redux/chatSlice';

class LeftList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { nickname, avatar, dispatch, account } = this.props;
    return (
      <div className={style.wrapper}>
        <Avatar src={network.avatarURL(avatar)} className={style.avatar} />
        <div className={style.nickname}>{nickname}</div>
        <div className={style.account}>{account}</div>
        <div className={style.tabs}>
          <ButtonBase className={[style.tab, style.chosen].join(' ')}>
            <Link to="/login">
              <ModeCommentOutlinedIcon /> 聊天
            </Link>
          </ButtonBase>
          <Link to="/login">
            <ButtonBase
              onClick={() => {
                window.socket?.disconnect();
                dispatch(logout());
                console.log('disconnect');
              }}
              className={style.tab}
            >
              <ExitToAppOutlinedIcon /> 登出
            </ButtonBase>
          </Link>
          <ButtonBase className={style.tab}>
            <Link to="/signup">
              <SettingsApplicationsOutlinedIcon /> 设置
            </Link>
          </ButtonBase>
        </div>
      </div>
    );
  }
}

LeftList.propTypes = {
  nickname: PropTypes.string.isRequired,
  account: PropTypes.number.isRequired,
  avatar: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function stateMap({ chatSlice: { nickname, account, avatar } }) {
  return {
    nickname,
    account,
    avatar: avatar || '',
  };
}

export default connect(stateMap)(LeftList);
