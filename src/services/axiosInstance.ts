import axios, { AxiosError } from "axios"
/* import Cookies from "js-cookie" */
/* 
const token = Cookies.get("token") */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
 /*  withCredentials: true, */
})

axiosInstance.interceptors.request.use(
  function (config: any) {
  /*   if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } */

    return config
  },

  function (error: any) {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  function (response: any) {
    return response
  },
  
  function (error: AxiosError) {
    return Promise.reject(error)
  }
)

export default axiosInstance
