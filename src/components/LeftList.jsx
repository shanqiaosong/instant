import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Link } from 'react-router-dom';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import ModeCommentOutlinedIcon from '@material-ui/icons/ModeCommentOutlined';
import SettingsApplicationsOutlinedIcon from '@material-ui/icons/SettingsApplicationsOutlined';
import {
  ButtonBase,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import style from './LeftList.sass';
import network from '../utils/network';
import { logout } from '../redux/chatSlice';

class LeftList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showAbout: false };
  }

  render() {
    const { nickname, avatar, dispatch, account } = this.props;
    const { showAbout } = this.state;
    return (
      <div className={style.wrapper}>
        <Dialog
          onClose={() => this.setState({ showAbout: false })}
          open={showAbout}
          title="关于"
          classes={{ paper: style.about }}
        >
          <DialogTitle>关于我们</DialogTitle>
          <DialogContent>
            <b>
              北京大学{' '}
              <span aria-label="school" role="img">
                🎓
              </span>
            </b>
            <br />
            <b>
              JavaScript 语言 Web 程序设计{' '}
              <span aria-label="school" role="img">
                📖
              </span>{' '}
              课程作业
            </b>
            <br />
            By
            <br />
            马驰腾
            <br />
            山芝涵
            <br />
            Created with ❤️
          </DialogContent>
        </Dialog>
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
          <ButtonBase
            onClick={() => {
              this.setState({
                showAbout: true,
              });
            }}
            className={style.tab}
          >
            <SettingsApplicationsOutlinedIcon /> 关于
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
