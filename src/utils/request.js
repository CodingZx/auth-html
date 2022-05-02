import axios from 'axios'
import router from '@/router'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import { getToken, setToken } from '@/utils/auth'
import { useUserStore } from '@/store/user'
let reqConfig
let loadingE

const service = axios.create({
  timeout: 15000,
  baseURL: import.meta.env.VITE_APP_BASE_URL
})

// 请求拦截
service.interceptors.request.use(
  (request) => {
    // token setting
    request.headers['X-Access-Token'] = getToken()
    /* download file*/
    if (request.isDownLoadFile) {
      request.responseType = 'blob'
    }
    /* upload file*/
    if (request.isUploadFile) {
      request.headers['Content-Type'] = 'multipart/form-data'
    }
    reqConfig = request
    if (request.bfLoading) {
      loadingE = ElLoading.service({
        lock: true,
        text: '数据载入中',
        // spinner: 'el-icon-ElLoading',
        background: 'rgba(0, 0, 0, 0.1)'
      })
    }
    return request
  },
  (err) => {
    Promise.reject(err)
  }
)
// 响应拦截
service.interceptors.response.use(
  (res) => {
    if (reqConfig.afHLoading && loadingE) {
      loadingE.close()
    }
    // 如果是下载文件直接返回
    if (reqConfig.isDownLoadFile) {
      return res
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
    if (loadingE) loadingE.close()
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
  bfLoading,
  afHLoading,
  isUploadFile,
  isDownLoadFile,
}) {
  return service({
    url: url,
    method: method ?? 'get',
    data: data ?? {},
    params: params ?? {},
    bfLoading: bfLoading ?? false,
    afHLoading: afHLoading ?? true,
    isUploadFile: isUploadFile ?? false,
    isDownLoadFile: isDownLoadFile ?? false,
  })
}

export default axiosReq
