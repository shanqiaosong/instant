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
    url,
    data,
  });
}

export default { post };
