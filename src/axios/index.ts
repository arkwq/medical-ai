import { computed, ref } from 'vue'
import axios, { type AxiosRequestHeaders } from 'axios'
import { createDiscreteApi, lightTheme, darkTheme, type ConfigProviderProps } from 'naive-ui'
import { PORT } from '../config'

const baseURl = `http://${window.location.hostname}:${PORT}/`

const service = axios.create({
  baseURL: baseURl,
  timeout: 15000 // 请求超时时间
})

// request拦截器 添加token
service.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    const reqHeader = config.headers as AxiosRequestHeaders
    reqHeader.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

const themeRef = ref<'light' | 'dark'>('dark')
const configProviderPropsRef = computed<ConfigProviderProps>(() => ({
  theme: themeRef.value === 'light' ? lightTheme : darkTheme
}))
const { message } = createDiscreteApi(
  ['message'],
  { configProviderProps: configProviderPropsRef }
)

//  response拦截器
service.interceptors.response.use(response => {
  if(response.data.status === 200) {
    if(!response.data.data) {
      return response.data
    }
    return response.data.data
  } else {
    message.error(response.data.message)
    return Promise.reject()
  }
})

export default service