"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useAuth, ROLE_HIERARCHY } from "@/lib/auth"
import { LoadingScreen } from "@/components/loading-screen"
import { NavBar } from "@/components/nav-bar"
import { UserDisplay } from "@/components/user-display"
import { RoleBadge } from "@/components/role-badge"
import { toast } from "sonner"

type UserRole =
  | "Admin"
  | "Manager"
  | "Mod"
  | "Judicial"
  | "Council"
  | "Helper"
  | "Corrupt"
  | "Clique"
  | "Rich"
  | "Kitty"
  | "Criminal"
  | "Sloth"
  | "User"

export default function RolesPage() {
  const router = useRouter()
  const { user, users, assignUserRole, deleteUserAccountAdmin, isSuperAdmin } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !isSuperAdmin()) {
      router.push("/")
    } else {
      const timer = setTimeout(() => setLoading(false), 500)
      return () => clearTimeout(timer)
    }
  }, [user, isSuperAdmin, router])

  if (loading) {
    return <LoadingScreen />
  }

  const filteredUsers = users.filter((u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()))

  // Sort users by role hierarchy
  const sortedUsers = filteredUsers.sort((a, b) => {
    const aIndex = ROLE_HIERARCHY.indexOf(a.role as UserRole)
    const bIndex = ROLE_HIERARCHY.indexOf(b.role as UserRole)

    // If role not found in hierarchy, put at end
    const aPos = aIndex === -1 ? ROLE_HIERARCHY.length : aIndex
    const bPos = bIndex === -1 ? ROLE_HIERARCHY.length : bIndex

    return aPos - bPos
  })

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    assignUserRole(userId, newRole)
    toast.success(`User role updated to ${newRole}`)
  }

  const handleDeleteAccount = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user account? This action cannot be undone.")) {
      deleteUserAccountAdmin(userId)
      toast.success("User account deleted successfully")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">User Management</h1>
            <Input
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-[#141414] border-gray-800"
            />
          </div>

          <div className="bg-[#141414] rounded-lg border border-gray-800">
            <div className="divide-y divide-gray-800">
              {sortedUsers.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  {/* Username and Role on same line */}
                  <div className="flex items-center gap-3">
                    <UserDisplay username={u.username} role={u.role} nameColor={u.nameColor} />
                    <RoleBadge role={u.role} className="text-xs" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => handleRoleChange(u.id, value as UserRole)}
                      defaultValue={u.role}
                      disabled={u.id === user?.id} // Can't change own role
                    >
                      <SelectTrigger className="w-32 bg-[#1A1A1A] border-gray-800">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-gray-800">
                        {ROLE_HIERARCHY.map((role) => (
                          <SelectItem
                            key={role}
                            value={role}
                            disabled={u.id === user?.id} // Can't change own role
                            className="text-gray-300 hover:bg-[#252525] hover:text-white"
                          >
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAccount(u.id)}
                      disabled={
                        !user ||
                        !isSuperAdmin() ||
                        u.id === user.id ||
                        u.username === "ic3" ||
                        u.username === "wounds" ||
                        u.username === "dismayings" ||
                        u.username === "slit" ||
                        u.username === "bribe"
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
