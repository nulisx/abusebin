"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/nav-bar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth, ROLE_COLORS, ROLE_HIERARCHY } from "@/lib/auth"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { UserAvatar } from "@/components/user-avatar"
import { LoadingScreen } from "@/components/loading-screen"
import { UserDisplay } from "@/components/user-display"

export default function UsersPage() {
  const { users, isAuthenticated, pastes } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [onlineCount, setOnlineCount] = useState(0)
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Count online users
  useEffect(() => {
    const count = users.filter((user) => user.isOnline).length
    setOnlineCount(count)
  }, [users])

  useEffect(() => {
    setUserCount(users.length)
  }, [users])

  if (loading) {
    return <LoadingScreen />
  }

  // Filter users based on search query
  const filteredUsers = users.filter((user) => user.username.toLowerCase().includes(searchQuery.toLowerCase()))

  // Group filtered users by role
  const groupedUsers = filteredUsers.reduce(
    (acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = []
      }
      acc[user.role].push(user)
      return acc
    },
    {} as Record<string, typeof users>,
  )

  const sortAdminUsers = (users: typeof filteredUsers) => {
    return users.sort((a, b) => {
      if (a.username === "wounds") return -1
      if (b.username === "wounds") return 1
      if (a.username === "dismayings") return -1
      if (b.username === "dismayings") return 1
      if (a.username === "bribe") return -1
      if (b.username === "bribe") return 1
      if (a.username === "ic3") return -1
      if (b.username === "ic3") return 1
      return 0
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-gray-400 text-sm">Showing {filteredUsers.length} registered users</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {onlineCount} user{onlineCount !== 1 ? "s" : ""} online
              </span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Live
              </Badge>
            </div>
          </div>
          <Input
            type="search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm bg-black border-gray-800 text-gray-300"
          />
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {/* Use ROLE_HIERARCHY for proper ordering */}
            {ROLE_HIERARCHY.map((role) => {
              let roleUsers = groupedUsers[role]
              if (!roleUsers?.length) return null

              // Sort admin users specially
              if (role === "Admin") {
                roleUsers = sortAdminUsers(roleUsers)
              }

              return (
                <div key={role} className="space-y-1">
                  <h2
                    className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                      role === "Council"
                        ? "rainbow-text"
                        : ROLE_COLORS[role as keyof typeof ROLE_COLORS] || "text-white"
                    }`}
                  >
                    <span>{role}</span>
                    <span>({roleUsers.length})</span>
                  </h2>
                  <div className="bg-black rounded-lg overflow-hidden">
                    <div className="">
                      {roleUsers.map((user) => (
                        <motion.div key={user.id} className={`py-2 px-4 items-center flex`}>
                          <Link href={`/profile/${user.username}`} className="hover:opacity-80 flex items-center gap-2">
                            <UserAvatar
                              src={user.avatar}
                              alt={`${user.username}'s avatar`}
                              size={24}
                              userId={user.id}
                            />
                            <UserDisplay
                              username={user.username}
                              role={user.role}
                              nameColor={user.nameColor}
                              activeEffect={user.activeEffect}
                              effectEnabled={user.effectEnabled}
                              user={user}
                              className="text-sm"
                            />
                            <span
                              className={`text-xs ${
                                user.role === "Council"
                                  ? "rainbow-text"
                                  : ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || "text-gray-400"
                              }`}
                            >
                              [{user.role}]
                            </span>
                            {user.isOnline && (
                              <span className="text-xs bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full">
                                Online
                              </span>
                            )}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
