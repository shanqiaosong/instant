import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import style from './Info.sass';
import PersonInfo from './pure/PersonInfo';

function Info(props) {
  const { selectedFriend } = props;
  const { avatar, nickname, account } = selectedFriend;
  if (!selectedFriend.account) {
    return <div />;
  }
  return (
    <div className={style.wrapper}>
      <PersonInfo nickname={nickname} account={account} avatar={avatar} />
    </div>
  );
}

Info.propTypes = {
  selectedFriend: PropTypes.object.isRequired,
};

function stateMap({ chatSlice: { selectedFriend } }) {
  return {
    selectedFriend,
  };
}

export default connect(stateMap)(Info);
