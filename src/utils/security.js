import Utf8 from 'crypto-js/enc-utf8';
import Base64 from 'crypto-js/enc-base64';
import { ipcRenderer } from 'electron';
import JSEncrypt from 'jsencrypt';
import state from '../redux/store';
import { saveKey } from '../redux/chatSlice';

export function toBase64(content) {
  try {
    return Base64.stringify(Utf8.parse(content));
  } catch (e) {
    return false;
  }
}

export function fromBase64(content) {
  try {
    return Utf8.stringify(Base64.parse(content));
  } catch (e) {
    return false;
  }
}

export function getMyKey(slice = state.getState().chatSlice) {
  if (slice.keys.my) {
    return slice.keys.my;
  }
  return false;
}

export function generateKey() {
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
