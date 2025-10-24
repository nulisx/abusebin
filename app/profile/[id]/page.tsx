"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import { UserDisplay } from "@/components/user-display"
import { RoleBadge } from "@/components/role-badge"
import { FollowersModal } from "@/components/followers-modal"
import { Ban, CheckCircle, Trash2, Users, UserPlus, UserMinus, ImageOff, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/lib/auth"

const PASTES_PER_PAGE = 5

export default function ProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const { users, user: currentUser, pastes, banUser, unbanUser, deleteUserAccountAdmin, followUser, unfollowUser, isFollowing, removeUserAvatar, getUserPasteCount, getUserTotalLikes, getUserByUsername } = useAuth()
  const [loading, setLoading] = useState(true)
  const [banReason, setBanReason] = useState("")
  const [showBanModal, setShowBanModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [followersModalOpen, setFollowersModalOpen] = useState(false)
  const [followingModalOpen, setFollowingModalOpen] = useState(false)
  const [currentPastePage, setCurrentPastePage] = useState(1)

  const user = getUserByUsername(id)
  const userPastes = pastes.filter((paste) => paste.authorId === user?.id)
  const isAdmin = currentUser && ["wounds","ic3","dismayings","kaan"].includes(currentUser.username)
  const isSelf = currentUser?.id === user?.id
  const following = currentUser ? isFollowing(user?.id || "") : false
  const pasteCount = user ? getUserPasteCount(user.id) : 0
  const totalLikes = user ? getUserTotalLikes(user.id) : 0
  const totalPastePages = Math.ceil(userPastes.length / PASTES_PER_PAGE)
  const startPasteIndex = (currentPastePage - 1) * PASTES_PER_PAGE
  const endPasteIndex = startPasteIndex + PASTES_PER_PAGE
  const paginatedPastes = userPastes.slice(startPasteIndex, endPasteIndex)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <Image src="/images/loading-logo.gif" alt="Loading" width={200} height={200} className="object-contain mb-4"/>
          <div className="text-white text-xl">Loading....</div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-white">User not found</h1>
            <p className="text-gray-400 mb-6">The user you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">Go Home</Button>
          </div>
        </div>
      </Layout>
    )
  }

  const handleFollowToggle = () => {
    if (!currentUser) { router.push("/login"); return }
    if (following) { unfollowUser(user.id); toast.success(`Unfollowed ${user.username}`) }
    else { followUser(user.id); toast.success(`Following ${user.username}`) }
  }

  const handleRemoveAvatar = () => {
    if (!isAdmin || isSelf) { toast.error("You cannot remove your own profile picture or you don't have permission."); return }
    const result = removeUserAvatar(user.id)
    if (result.success) toast.success(`${user.username}'s profile picture has been removed.`)
    else toast.error(result.message || "Failed to remove profile picture.")
  }

  const handleBanUnban = () => {
    if (!isAdmin || isSelf || user.role === "Admin") { toast.error("You cannot ban admin users or yourself."); return }
    if (user.banned) { unbanUser(user.id); toast.success(`${user.username} has been unbanned.`) }
    else setShowBanModal(true)
  }

  const confirmBan = () => {
    if (banReason.trim()) { banUser(user.id, banReason); toast.success(`${user.username} has been banned.`); setShowBanModal(false); setBanReason("") }
    else toast.error("Please provide a reason for the ban.")
  }

  const handleDeleteAccount = () => {
    if (!isAdmin || isSelf || user.role === "Admin") { toast.error("You cannot delete admin accounts or your own account."); return }
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (deleteConfirmText === "DELETE") { deleteUserAccountAdmin(user.id); toast.success(`${user.username}'s account has been permanently deleted.`); setShowDeleteModal(false); setDeleteConfirmText(""); router.push("/users") }
    else toast.error("Please type 'DELETE' to confirm.")
  }

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black rounded-lg p-4 mb-6 border border-gray-800 flex items-center gap-4">
            <div className="relative">
              <UserAvatar src={user.avatar} alt={`${user.username}'s avatar`} size={60} userId={user.id} />
              {user.isOnline && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-black"></span>}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <UserDisplay username={user.username} role={user.role} nameColor={user.nameColor} activeEffect={user.activeEffect} effectEnabled={user.effectEnabled} user={user} className="text-xl font-bold" />
                <RoleBadge role={user.role} user={user} />
              </div>
              {user.bio && <p className="text-sm text-gray-300 mb-2">{user.bio}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <button onClick={() => setFollowersModalOpen(true)} className="flex items-center gap-1 hover:text-white transition-colors"><Users className="w-4 h-4" /><span>{user.followers?.length || 0} followers</span></button>
                <button onClick={() => setFollowingModalOpen(true)} className="flex items-center gap-1 hover:text-white transition-colors"><Users className="w-4 h-4" /><span>{user.following?.length || 0} following</span></button>
              </div>
            </div>
            {!isSelf && currentUser && <Button onClick={handleFollowToggle} size="sm" className={following ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}>{following ? "Unfollow" : "Follow"}</Button>}
            {isAdmin && !isSelf && user.role !== "Admin" && (
              <>
                <Button size="sm" className={user.banned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} onClick={handleBanUnban}>{user.banned ? "Unban" : "Ban"}</Button>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={handleRemoveAvatar}>Remove PFP</Button>
                <Button size="sm" className="bg-red-800 hover:bg-red-900" onClick={handleDeleteAccount}>Delete</Button>
              </>
            )}
          </div>
        </div>
      </main>
      <FollowersModal isOpen={followersModalOpen} onClose={() => setFollowersModalOpen(false)} userId={user.id} type="followers" />
      <FollowersModal isOpen={followingModalOpen} onClose={() => setFollowingModalOpen(false)} userId={user.id} type="following" />
    </Layout>
  )
}
