import axiosInstance from "./axiosInstance"

interface loginProps {
  email: string
  password: string
}
export async function login({ email, password }: loginProps) {
  const response = await axiosInstance.get(
    `users?email=${email}&password=${password}`
  )
  return response
}

interface registerProps {
  name: string
  email: string
  password: string
}
export async function registerUser({ name, email, password }: registerProps) {
  const response = await axiosInstance.post("/users", {
    name,
    email,
    password,
  })
  return response
}
