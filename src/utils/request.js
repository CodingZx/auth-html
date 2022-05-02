import axios from 'axios'
import router from '@/router'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { getToken, setToken } from '@/utils/auth'
import { uuid } from '@/utils/uuid'
import CryptoJS from 'crypto-js/crypto-js'
import { useUserStore } from '@/store/user'

const service = axios.create({
  timeout: 15000,
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  },
})

// 请求拦截
service.interceptors.request.use(
  (request) => {
    // token setting
    var userToken = getToken()
    if (typeof(userToken) != 'undefined' && userToken != null) {
      request.headers['X-Access-Token'] = userToken
    } else {
        userToken = ""
    }

    // download file
    if (request.isDownLoadFile) {
      request.responseType = 'blob'
    }

    //Upload file
    if (request.isUploadFile) {
      request.headers['Content-Type'] = 'multipart/form-data'
    }

    var timestamp = new Date().getTime()
    request.headers['X-Access-Timestamp'] = timestamp

    // 来源
    var source = 1
    request.headers['X-Access-Source'] = source

    var params = ""
    if(request.params) {
        params = Object.keys(request.params).sort().map((key) => key + "=" + request.params[key]).join("&")
    }
    var body = ""
    if (request.data && (request.method == "post" || request.method == "put")) {
        body = JSON.stringify(request.data);
        request.data = body;
    }

    // 随机字符串
    var nonce = uuid()
    request.headers['X-Access-Nonce'] = nonce

    // 版本
    var version = import.meta.env.VITE_APP_SIGN_VERSION
    request.headers['X-Access-Version'] = version

    // 签名
    var signStr = request.url + '\n' + request.method.toUpperCase() + '\n' + version + '\n' + (timestamp+','+userToken+','+source+','+nonce) + '\n' + body + '\n' + params

    request.headers['X-Access-Sign'] = CryptoJS.HmacSHA256(signStr, import.meta.env.VITE_APP_SIGN_KEY)

    return request
  },
  (err) => {
    Promise.reject(err)
  }
)
// 响应拦截
service.interceptors.response.use(
  (res) => {
    // 如果是下载文件直接返回
    if(res.request.responseType == 'blob') {
      return res.data // 下载文件
    }
    const { message, code } = res.data
   
    if (code == 200) {
      return res.data
    } else {
      if (code === 999) {
        ElMessageBox.confirm('请重新登录', {
          confirmButtonText: '登录失效',
          type: 'warning'
        }).then(() => {
          const userStore = useUserStore()
          userStore.resetState().then(() => {
            router.push({ path: '/login' })
          })
        })
      }
      //返回错误信息
      //如果未catch 走unhandledrejection进行收集
      //注：如果没有return 则，会放回到请求方法中.then ,返回的res为 undefined
      return Promise.reject({
        code: res.data.code,
        message: res.data.message
      })
    }
  },
  (err) => {
    /*http错误处理，处理跨域，404，401，500*/
    ElMessage({
      message: err,
      type: 'error',
      duration: 2 * 1000
    })
    //如果是跨域
    //Network Error,cross origin
    const errObj = {
      message: err.toString(),
      reqUrl: reqConfig.baseURL + reqConfig.url,
      params: reqConfig.params ? reqConfig.params : reqConfig.data
    }
    return Promise.reject(errObj)
  }
)

export function axiosReq({
  url,
  data,
  method,
  params,
  isUploadFile,
  isDownLoadFile,
}) {
  return service({
    url: url,
    method: method ?? 'get',
    data: data ?? {},
    params: params ?? {},
    isUploadFile: isUploadFile ?? false,
    isDownLoadFile: isDownLoadFile ?? false,
  })
}

export default axiosReq
