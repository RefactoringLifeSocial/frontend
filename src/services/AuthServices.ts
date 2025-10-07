import axiosInstance from "./axiosInstance"

interface loginProps {
  email: string
  password: string
}
export default async function login({ email, password }: loginProps) {
  const response = await axiosInstance.get(
    `users?email=${email}&password=${password}`
  )
  return response
}
