// 引入axios
import axios from 'axios'
import Qs from 'qs'

let cancel = {}
let promiseArr = {}
const CancelToken = axios.CancelToken
// 请求拦截器
axios.interceptors.request.use(config => {
  // 发起请求时，取消掉当前正在进行的相同请求
  if (promiseArr[config.url]) {
    promiseArr[config.url]('操作取消')
    promiseArr[config.url] = cancel
  } else {
    promiseArr[config.url] = cancel
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器即异常处理
axios.interceptors.response.use(response => {
  return response
}, err => {
  if (err && err.response) {
    switch (err.response.status) {
      case 400:
        err.message = '错误请求'
        break
      case 401:
        err.message = '未授权，请重新登录'
        break
      case 403:
        err.message = '拒绝访问'
        break
      case 404:
        err.message = '请求错误,未找到该资源'
        break
      case 405:
        err.message = '请求方法未允许'
        break
      case 408:
        err.message = '请求超时'
        break
      case 500:
        err.message = '服务器端出错'
        break
      case 501:
        err.message = '网络未实现'
        break
      case 502:
        err.message = '网络错误'
        break
      case 503:
        err.message = '服务不可用'
        break
      case 504:
        err.message = '网络超时'
        break
      case 505:
        err.message = 'http版本不支持该请求'
        break
      default:
        err.message = `连接错误${err.response.status}`
    }
  } else {
    err.message = '连接到服务器失败'
  }
  // message.err(err.message)
  return Promise.resolve(err.response)
})
// `baseURL` 将自动加在 `url` 前面，除非 `url` 是一个绝对 URL。
// 它可以通过设置一个 `baseURL` 便于为 axios 实例的方法传递相对 URL
axios.defaults.baseURL = '/'
// 设置默认请求头
// axios.defaults.headers['Content-Type'] = 'application/json'
// axios.defaults.headers = {
//   'X-Requested-With': 'XMLHttpRequest'
// }
axios.defaults.timeout = 10000

// 这里可以在发送请求之前对请求数据做处理，比如form-data格式化等，这里可以使用开头引入的Qs（这个模块在安装axios的时候就已经安装了，不需要另外安装）
axios.defaults.transformRequest = (data) => {
  return Qs.stringify(data)
}
export default {
  // get请求
  get(url, param) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url,
        params: param,
        cancelToken: new CancelToken(c => {
          cancel = c
        })
      }).then(res => {
        resolve(res)
      })
    })
  },
  // post请求
  post(url, param) {
    return new Promise((resolve, reject) => {
      axios({
        method: 'POST',
        url,
        params: param,
        cancelToken: new CancelToken(c => {
          cancel = c
        })
      }).then(res => {
        resolve(res)
      })
    })
  },
  ajax(baseMsg, param) {
    return new Promise((resolve, reject) => {
      let msd = baseMsg['method'] ? baseMsg['method'] : 'GET'
      let url = baseMsg['url']
      if (msd === 'get' || msd === 'GET') {
        axios({
          method: msd,
          url,
          cancelToken: new CancelToken(c => {
            cancel = c
          })
        }
        ).then(res => {
          resolve(res)
        })
      } else {
        // post 和 put请求
        axios({
          method: msd,
          url,
          data: param,
          cancelToken: new CancelToken(c => {
            cancel = c
          })
        }
        ).then(res => {
          resolve(res)
        })
      }
    })
  }
}
