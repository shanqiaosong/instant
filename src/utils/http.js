import network from './network';

// eslint-disable-next-line import/prefer-default-export
export function getHistoryHttp(user, startID) {
  if (Number.isNaN(startID)) {
    return network.get('/history', {
      toUser: user,
    });
  }
  return network.get('/history', {
    toUser: user,
    startid: startID,
    number: 5,
  });
}
