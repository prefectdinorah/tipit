import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateDonationId(): string {
  return `don_${nanoid(16)}`
}

export function generateSessionToken(): string {
  return nanoid(32)
}
