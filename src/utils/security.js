import Utf8 from 'crypto-js/enc-utf8';
import Base64 from 'crypto-js/enc-base64';
import { ipcRenderer } from 'electron';
import JSEncrypt from 'jsencrypt';
import state from '../redux/store';
import { saveKey, sendMessage } from '../redux/chatSlice';

export function toBase64(content) {
  try {
    return Base64.stringify(Utf8.parse(content));
  } catch (e) {
    return '无法解密';
  }
}

export function fromBase64(content) {
  try {
    return Utf8.stringify(Base64.parse(content));
  } catch (e) {
    return '无法解密';
  }
}

export function getMyKey() {
  if (state.getState().chatSlice.keys.my) {
    return state.getState().chatSlice.keys.my;
  }
  const { publicKey, privateKey } = ipcRenderer.sendSync('generateKey');
  console.log({ publicKey, privateKey });
  state.dispatch(saveKey({ user: 'my', key: { publicKey, privateKey } }));
  return { publicKey, privateKey };
}

export function encrypt(content, publicKey) {
  if (!publicKey) return content;
  const jsenc = new JSEncrypt();
  jsenc.setPublicKey(publicKey);
  return jsenc.encrypt(content);
}

export function decrypt(content, privateKey) {
  const jsenc = new JSEncrypt();
  jsenc.setPublicKey(privateKey);
  return jsenc.decrypt(content);
}
export function processChat(chat, curState) {
  if (chat.type === 'text') {
    return {
      ...chat,
      content: fromBase64(chat.content),
    };
  }
  if (chat.type === 'secured') {
    if (curState.keys.my && chat.toUser === curState.account) {
      return {
        ...chat,
        content: fromBase64(decrypt(chat.content, curState.keys.my.privateKey)),
      };
    }
    return {
      ...chat,
      content: '无法解密',
    };
  }
  return chat;
}

export function sendMyKey() {
  const clientID = String(Date.now()) + String(Math.random());
  const input = getMyKey().publicKey;
  state.dispatch(sendMessage({ type: 'key', clientID, input }));
}
