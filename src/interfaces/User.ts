export interface User {
  sub: string
  email: string
  role: UserRoleEnum
}

export enum UserRoleEnum {
  ADMIN = "admin",
  USER = "user",
}
