"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth, ROLE_HIERARCHY } from "@/lib/auth"
import { LoadingScreen } from "@/components/loading-screen"
import { NavBar } from "@/components/nav-bar"
import { UserDisplay } from "@/components/user-display"
import { RoleBadge } from "@/components/role-badge"
import { toast } from "sonner"

export default function EffectPermsPage() {
  const router = useRouter()
  const { user, users, grantEffectPermission, revokeEffectPermission, isSuperAdmin } = useAuth()
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

  const sortedUsers = filteredUsers.sort((a, b) => {
    const aRoleIndex = ROLE_HIERARCHY.indexOf(a.role)
    const bRoleIndex = ROLE_HIERARCHY.indexOf(b.role)

    // Lower index = higher role (Admin is 0, User is last)
    if (aRoleIndex !== bRoleIndex) {
      return aRoleIndex - bRoleIndex
    }

    // If same role, sort by username
    return a.username.localeCompare(b.username)
  })

  const handleToggleEffectPermission = (userId: string, currentStatus: boolean) => {
    if (currentStatus) {
      revokeEffectPermission(userId)
      toast.success("Effect permission revoked")
    } else {
      grantEffectPermission(userId)
      toast.success("Effect permission granted")
    }
  }

  const usersWithPerms = sortedUsers.filter((u) => u.hasEffectPermission).length
  const totalUsers = sortedUsers.length

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Effect Permissions Management</h1>
              <p className="text-sm text-gray-400 mt-1">
                {usersWithPerms} of {totalUsers} users have effect permissions
              </p>
            </div>
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
                  {/* Username and Role */}
                  <div className="flex items-center gap-3 flex-1">
                    <UserDisplay username={u.username} role={u.role} nameColor={u.nameColor} />
                    <RoleBadge role={u.role} className="text-xs" />
                    {u.hasEffectPermission && (
                      <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded border border-green-600/30">
                        Has Effect Perms
                      </span>
                    )}
                  </div>

                  {/* Toggle Button */}
                  <Button
                    onClick={() => handleToggleEffectPermission(u.id, u.hasEffectPermission || false)}
                    size="sm"
                    className={`${
                      u.hasEffectPermission
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    {u.hasEffectPermission ? "Revoke" : "Grant"}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {sortedUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No users found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
