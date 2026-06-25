/** REST user shape — camelCase per the backend DTO convention (CLAUDE.md §2). */
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  verifiedAt: string | null
}

export function fullName(user: Pick<User, 'firstName' | 'lastName' | 'email'>): string {
  const name = `${user.firstName} ${user.lastName}`.trim()
  return name || user.email
}
