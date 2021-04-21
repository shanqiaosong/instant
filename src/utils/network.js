import axios from 'axios';

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

export default { post };
