// eslint-disable-next-line import/prefer-default-export
export function socketSend(data) {
  return new Promise((resolve, reject) => {
    window.socket.emit('sendMessage', data);
    const { clientID } = data.message;
    const verifyListener = (result) => {
      if (result.clientID === clientID) {
        if (result.status !== 'ok') reject(result.message);
        else resolve(result);
        window.socket.off('verifySend', verifyListener);
      }
    };
    window.socket.on('verifySend', verifyListener);
    setTimeout(() => reject(new Error('network error')), 4000);
  });
}
