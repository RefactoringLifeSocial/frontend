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

export async function sendPasswordResetEmail({ email }: { email: string }) {
  function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Buscar el usuario por email
  const response = await axiosInstance.get(`users?email=${email}`)

  if (response.status === 200 && response.data.length > 0) {
    const user = response.data[0] // JSON Server devuelve un array
    const code = generateCode()

    // Actualizar al usuario con el código generado
    const updateResponse = await axiosInstance.patch(`users/${user.id}`, {
      code: code,
    })

    return updateResponse
  } else {
    throw new Error("Usuario no encontrado")
  }
}

export async function resetPassword({ email, password }: loginProps) {
  const response = await axiosInstance.get(
    `users?email=${email}&password=${password}`
  )
  return response
}
