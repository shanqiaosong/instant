export function updateLastMessage(state, message, updateID = true) {
  state.friends.forEach((friend) => {
    if (
      friend.account === message.toUser ||
      friend.account === message.fromUser
    ) {
      if (
        friend.account === message.fromUser &&
        message.id !== friend.last_message.id &&
        friend.account !== state.selectedFriend?.account
      ) {
        friend.messageCnt = (friend.messageCnt || 0) + 1;
      }
      const originalID = friend.last_message.id;
      friend.last_message = message.toStorable();
      if (!updateID) {
        friend.last_message.id = originalID;
      }
    }
  });
}
export function updateHistory(state, message) {
  if (
    state.selectedFriend.account !== message.toUser &&
    state.selectedFriend.account !== message.fromUser
  ) {
    return false;
  }
  const idx = state.history.findIndex((chat) => {
    return (
      (chat.id && chat.id === message.id) ||
      (chat.clientID && chat.clientID === message.clientID)
    );
  });
  console.log(idx, message);
  if (idx === -1) {
    state.history.push(message.toStorable());
  } else {
    state.history[idx] = message.toStorable();
  }
  return true;
}
