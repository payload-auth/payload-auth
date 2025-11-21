import { UserRole } from '@/access/userHasRole'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function roleFormat(user: UserRole | null | undefined) {
  if (!user) {
    return 'user'
  }
  if (typeof user.role === 'string') {
    return user.role
  }
  return user.role?.join(', ')
}
