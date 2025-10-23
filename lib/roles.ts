export type UserRole =
  | "Admin"
  | "Manager"
  | "Mod"
  | "Council"
  | "Helper"
  | "Corrupt"
  | "Clique"
  | "Rich"
  | "Kitty"
  | "Criminal"
  | "User"
  | "Effect Perms"

export const ADMIN_ROLES: UserRole[] = ["Admin"]

export const MODERATOR_ROLES: UserRole[] = ["Admin", "Manager", "Mod"]

export const PRIVILEGED_ROLES: UserRole[] = ["Admin", "Manager", "Mod", "Council", "Helper"]

export function hasAdminAccess(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role)
}

export function hasModeratorAccess(role: UserRole): boolean {
  return MODERATOR_ROLES.includes(role)
}

export function hasPrivilegedAccess(role: UserRole): boolean {
  return PRIVILEGED_ROLES.includes(role)
}
