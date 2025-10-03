import axiosInstance from "./axiosInstance"

export default async function login({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const response = await axiosInstance.get(`users?email=${email}&password=${password}`
  )
  return response
}
