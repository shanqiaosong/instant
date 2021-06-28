import axios from 'axios';
import store from '../redux/store';

function post(url, data, file) {
  if (file) {
    const formData = new FormData();
    formData.append(file.name, file.content);
    return axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  return axios({
    method: 'post',
    url: `https://www.mctzxc.com:15000/api/v1${url}`,
    data,
  }).then((res) => {
    if (res.data.status === 'error') {
      throw new Error(res.data.message);
    } else {
      return res.data;
    }
  });
}
function get(url, data, type = 'json') {
  let sendData = data;
  console.log(store.getState());
  const token = store.getState().chatSlice?.token;
  if (token) {
    sendData = { token, ...data };
  }
  return axios({
    method: 'get',
    url: `https://www.mctzxc.com:15000/api/v1${url}`,
    params: sendData,
    responseType: type,
  }).then((res) => {
    if (res.data.status === 'error') {
      throw new Error(res.data.message);
    } else {
      return res.data;
    }
  });
}

function uploadFile(file, token, authorize = 'public') {
  console.log('[messageProcess]', file, token);
  const data = new FormData();
  data.append('avatar', file);
  return axios({
    url: 'https://mctzxc.com:15000/api/v1/upload',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      token,
      authorize, // who can download this file except myself
    },
  })
    .then((res) => {
      if (!res.data) {
        throw new Error('server error');
      }
      if (res.data.status === 'error') {
        throw new Error(res.data.message);
      } else {
        return res.data;
      }
    })
    .catch((e) => {
      console.error(e);
    });
}
function avatarURL(avatar) {
  if (!avatar) return '';
  return `https://www.mctzxc.com:15000/api/v1/getAvatar?account=${avatar.slice(
    0,
    -5
  )}`;
}

function fileURL(file) {
  const token = store.getState().chatSlice?.token;
  return `https://www.mctzxc.com:15000/api/v1/download?token=${token}&fileid=${file}`;
}
function checkUpdate() {
  return axios({
    method: 'get',
    url: `https://root.shanqiaosong.com/shan/dev/instant/checkUpdate.php`,
  }).then((res) => {
    if (res.data.status === 'error') {
      throw new Error(res.data.message);
    } else {
      return res.data;
    }
  });
}
export default { post, get, uploadFile, avatarURL, fileURL, checkUpdate };
