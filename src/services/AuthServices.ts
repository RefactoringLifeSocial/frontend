import axiosInstance from "./axiosInstance"

interface loginProps {
  email: string
  password: string
}

interface verifyCodeProps {
  email: string
  code: string
}
export async function login({ email, password }: loginProps) {
  const response = await axiosInstance.get(
    `users?email=${email}&password=${password}`
  )
  return response
}

export async function sendPasswordResetEmail({ email }: { email: string }) {
  function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const response = await axiosInstance.get(`users?email=${email}`)

  if (response.status === 200 && response.data.length > 0) {
    const user = response.data[0]
    const code = generateCode()

    const updateResponse = await axiosInstance.patch(`users/${user.id}`, {
      code: code,
    })

    return updateResponse
  } else {
    throw new Error("Usuario no encontrado")
  }
}


export async function verifyCode({
  email,
  code,
}: verifyCodeProps) {
  const response = await axiosInstance.get(`users?email=${email}&code=${code}`)
  return response
}

export async function resetPassword({ email, password }: loginProps) {
  const user = await axiosInstance.get(`users?email=${email}`)

  if (user.status === 200 && user.data.length > 0) {
    const userId = user.data[0].id

    const updateResponse = await axiosInstance.patch(`users/${userId}`, {
      password: password,
    })
    return updateResponse
  } else {
    throw new Error("Usuario no encontrado")
  }
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
