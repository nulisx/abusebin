"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"
import { UserDisplay } from "./user-display"
import Link from "next/link"
import { UserAvatar } from "./user-avatar" // Import UserAvatar component

interface FollowersModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  type: "followers" | "following"
}

export function FollowersModal({ isOpen, onClose, userId, type }: FollowersModalProps) {
  const { users, getUserById } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const user = getUserById(userId)
  if (!user) return null

  // Safe access to followers/following arrays
  const userIds = type === "followers" ? user.followers || [] : user.following || []

  const filteredUsers = users
    .filter((u) => userIds.includes(u.id))
    .filter((u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((u) => ({
      ...u,
      displayName: u.banned ? `${u.username} BANNED` : u.username,
    }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {type === "followers" ? "Followers" : "Following"} ({userIds.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="search"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black border-gray-800 text-white focus:border-gray-700"
          />

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((followUser) => (
                <Link
                  key={followUser.id}
                  href={`/profile/${followUser.username}`}
                  onClick={onClose}
                  className={`flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition-colors ${
                    followUser.banned ? "opacity-75" : ""
                  }`}
                >
                  {/* Fixed avatar display to use UserAvatar component for consistency */}
                  <UserAvatar
                    src={followUser.avatar || "https://files.catbox.moe/ezqzq0.png"}
                    alt={`${followUser.username}'s avatar`}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    unoptimized={followUser.avatar?.includes("gif")}
                  />
                  {/* </CHANGE> */}
                  <div className="flex-1">
                    <UserDisplay
                      username={followUser.displayName} // Show BANNED label for banned users
                      role={followUser.role}
                      nameColor={followUser.banned ? "#ef4444" : followUser.nameColor} // Red color for banned users
                    />
                    <p className="text-xs text-gray-400">{followUser.role}</p>
                  </div>
                  {followUser.isOnline && !followUser.banned && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">{searchQuery ? "No users found" : `No ${type} yet`}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
