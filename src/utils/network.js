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

function avatarURL(avatar) {
  if (!avatar) return '';
  return `https://www.mctzxc.com:15000/api/v1/getAvatar?account=${avatar.slice(
    0,
    -5
  )}`;
}

export default { post, get, avatarURL };
