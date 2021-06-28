const dict = {
  'target already in your friend list': '对方已是您的朋友',
  'account not exist': '账号不存在',
  'target not in your friend list': '对方不是您的好友',
  'jwt expired': '登录已过期，请重新登录',
  'network error': '网络连接失败',
  'Network Error': '网络连接失败',
  'server error': '服务器错误',
  'message too long': '消息过长',
};

export default function getTranslate(code) {
  return dict[code] || code;
}
