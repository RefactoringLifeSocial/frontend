import { jwtDecode } from "jwt-decode"

export function decodeJwt(token: string) : any {
  const decode = jwtDecode(token)
  return decode
}