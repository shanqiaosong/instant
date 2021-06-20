import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import style from './Info.sass';
import PersonInfo from './pure/PersonInfo';
import { deleteFriend } from '../redux/chatSlice';

function Info(props) {
  const { selectedFriend, dispatch } = props;
  const { avatar, nickname, account } = selectedFriend;
  if (!selectedFriend.account) {
    return <div />;
  }
  return (
    <div className={style.wrapper}>
      <PersonInfo nickname={nickname} account={account} avatar={avatar} />
      <IconButton
        onClick={() => dispatch(deleteFriend({ toUser: account }))}
        className={style.delete}
        aria-label="delete"
      >
        <DeleteIcon />
      </IconButton>
    </div>
  );
}

Info.propTypes = {
  selectedFriend: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function stateMap({ chatSlice: { selectedFriend } }) {
  return {
    selectedFriend,
  };
}

export default connect(stateMap)(Info);
