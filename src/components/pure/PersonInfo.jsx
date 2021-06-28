import Avatar from '@material-ui/core/Avatar';
import React from 'react';
import PropTypes from 'prop-types';
import { Lock } from '@material-ui/icons';
import { connect } from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';
import style from '../Info.sass';
import friendStyle from '../Friends.sass';
import network from '../../utils/network';
import { saveKey } from '../../redux/chatSlice';
import { genderIcon } from '../../utils/consts';

function PersonInfo(props) {
  const { nickname, account, avatar, secured, dispatch, gender } = props;
  return (
    <div className={style.inner}>
      <Avatar className={friendStyle.avatar} src={network.avatarURL(avatar)} />
      <div className={style.nickname}>
        {nickname} {genderIcon[gender]}{' '}
        {secured && (
          <Tooltip title="已保存对方的公钥，现在可以安全地向对方发送消息。点击删除对方公钥。">
            <Lock
              onClick={() => dispatch(saveKey({ user: account, key: null }))}
              className={style.lock}
            />
          </Tooltip>
        )}
      </div>
      <div className={style.content}>{account}</div>
    </div>
  );
}

PersonInfo.propTypes = {
  nickname: PropTypes.string,
  account: PropTypes.number,
  gender: PropTypes.number,
  avatar: PropTypes.string,
  secured: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
};

PersonInfo.defaultProps = {
  secured: false,
  avatar: '',
  nickname: '',
  account: 0,
  gender: 0,
};
export default connect()(PersonInfo);
