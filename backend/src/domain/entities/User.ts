import { UserRole } from "../../shared/constants/Roles"

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole,
  createdAt: Date
}