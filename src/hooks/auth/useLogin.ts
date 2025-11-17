import { useState } from "react"
import axiosInstance from "@/services/axiosInstance"
import { decodeJwt } from "@/utils/functions/decodeJwt"
import Cookies from "js-cookie"
import { useAuthStore } from "@/stores/AuthStore"

export interface LoginParams {
  email: string
  password: string
}
export const setCookieAsync = (
  name: string,
  value: string,
  options: Cookies.CookieAttributes
): Promise<void> => {
  return new Promise((resolve) => {
    Cookies.set(name, value, options)
    resolve()
  })
}

const useLogin = () => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { setAuthUser } = useAuthStore()

  const login = async ({ email, password }: LoginParams) => {
    setLoading(true)
    setError(null)

    try {
      const response = await axiosInstance.post("auth/login", {
        email,
        password,
      })

      const data = response.data
      const user = decodeJwt(data.access_token)
      
      const userAuth = {
        user: user,
        token: data.access_token,
      }
      setAuthUser(userAuth)

      await setCookieAsync("token", data.access_token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      })

      window.location.href = "/"

      return null
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setError("Email o contraseña incorrectos.")
        throw new Error("Email o contraseña incorrectos.")
      } else {
        setError("Error en la autenticación.")
        throw error
      }
    } finally {
      setLoading(false)
    }
  }

  return { loading, login, error }
}

export default useLogin
