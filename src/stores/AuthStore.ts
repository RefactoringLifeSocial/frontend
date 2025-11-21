import { create } from "zustand"
import { decodeJwt } from "@/utils/functions/decodeJwt"
import { type User } from "@/interfaces/User"
import Cookies from "js-cookie"

export interface AuthUser {
  user: User
  token: string
}

interface AuthStore {
  authUser: AuthUser | null
  setAuthUser: (user: AuthUser | null) => void
  logout: () => void
  initAuth: () => void
}

// get initial auth user from cookies
const getInitialAuthUser = (): AuthUser | null => {
  const token = Cookies.get("token")

  if (!token) return null

  try {
    const user = decodeJwt(token)
    return {
      token,
      user,
    }
  } catch (error) {
    console.error("Error decoding token:", error)
    return null
  }
}

// Store for Zustand
export const useAuthStore = create<AuthStore>((set) => ({
  authUser: getInitialAuthUser(),

  setAuthUser: (user) => {
    set({ authUser: user })
  },

  logout: () => {
    Cookies.remove("token")
    set({ authUser: null })
  },

  initAuth: () => {
    const authUser = getInitialAuthUser()
    set({ authUser })
  },

  // Helper to get token
  getToken: () => {
    return Cookies.get("token")
  },
}))
