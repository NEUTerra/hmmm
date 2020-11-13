import axios from 'axios'

const photoServerRequest = axios.create({
  baseURL: 'http://127.0.0.1:8888/api/private/v1/'
})

photoServerRequest.interceptors.request.use(
  config => {
    config.url = 'http://127.0.0.1:8888/api/private/v1/' + config.url
    const token = sessionStorage.getItem('photoToken')
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  err => {
    console.log(err)
  }
)

export default photoServerRequest
