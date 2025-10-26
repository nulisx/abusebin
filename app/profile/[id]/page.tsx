"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import Layout from "@/components/layout"
import { toast } from "sonner"
import { Ban, CheckCircle, Trash2, Users, UserPlus, UserMinus, ImageOff, ChevronLeft, ChevronRight } from "lucide-react"
import { UserDisplay } from "@/components/user-display"
import { FollowersModal } from "@/components/followers-modal"
import { useAuth } from "@/lib/auth"
import Link from "next/link"
import { UserAvatar } from "@/components/user-avatar"
import { RoleBadge } from "@/components/role-badge"

const PASTES_PER_PAGE = 5
const COMMENTS_PER_PAGE = 15

export default function ProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const {
    users,
    user: currentUser,
    pastes,
    banUser,
    unbanUser,
    deleteUserAccountAdmin,
    followUser,
    unfollowUser,
    isFollowing,
    removeUserAvatar,
    getUserPasteCount,
    getUserTotalLikes,
    likePaste,
    dislikePaste,
    addCommentToPaste,
    deleteComment,
    canDeleteComment,
    editComment,
    getUserByUsername,
  } = useAuth()
  const [loading, setLoading] = useState(true)
  const [banReason, setBanReason] = useState("")
  const [showBanModal, setShowBanModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [followersModalOpen, setFollowersModalOpen] = useState(false)
  const [followingModalOpen, setFollowingModalOpen] = useState(false)
  const [currentPastePage, setCurrentPastePage] = useState(1)
  const [pasteComments, setPasteComments] = useState<{ [key: string]: string }>({})
  const [commentPages, setCommentPages] = useState<{ [key: string]: number }>({})
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState("")

  const user = getUserByUsername(id as string)
  const userPastes = pastes.filter((paste) => paste.authorId === user?.id)

  const isAdmin = currentUser && ["wounds", "ic3", "dismayings", "kaan"].includes(currentUser.username)
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
          <Image
            src="/images/loading-logo.gif"
            alt="Loading"
            width={200}
            height={200}
            className="object-contain mb-4"
          />
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
            <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
              Go Home
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const handleBanUnban = () => {
    if (!isAdmin || isSelf || user.role === "Admin") {
      toast.error("You cannot ban admin users or yourself.")
      return
    }

    if (user.banned) {
      unbanUser(user.id)
      toast.success(`${user.username} has been unbanned.`)
    } else {
      setShowBanModal(true)
    }
  }

  const confirmBan = () => {
    if (banReason.trim()) {
      banUser(user.id, banReason)
      toast.success(`${user.username} has been banned.`)
      setShowBanModal(false)
      setBanReason("")
    } else {
      toast.error("Please provide a reason for the ban.")
    }
  }

  const handleDeleteAccount = () => {
    if (!isAdmin || isSelf || user.role === "Admin") {
      toast.error("You cannot delete admin accounts or your own account.")
      return
    }
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (deleteConfirmText === "DELETE") {
      deleteUserAccountAdmin(user.id)
      toast.success(`${user.username}'s account has been permanently deleted.`)
      setShowDeleteModal(false)
      setDeleteConfirmText("")
      router.push("/users")
    } else {
      toast.error("Please type 'DELETE' to confirm.")
    }
  }

  const handleFollowToggle = () => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    if (user.id === "1" && following) {
      toast.error("You cannot unfollow wounds.")
      return
    }

    if (following) {
      unfollowUser(user.id)
      toast.success(`Unfollowed ${user.username}`)
    } else {
      followUser(user.id)
      toast.success(`Following ${user.username}`)
    }
  }

  const handleRemoveAvatar = () => {
    if (!isAdmin || isSelf) {
      toast.error("You cannot remove your own profile picture or you don't have permission.")
      return
    }

    const result = removeUserAvatar(user.id)
    if (result.success) {
      toast.success(`${user.username}'s profile picture has been removed.`)
    } else {
      toast.error(result.message || "Failed to remove profile picture.")
    }
  }

  const handleLike = (pasteId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      router.push("/login")
      return
    }

    if (!currentUser.createdAt) {
      toast.error("Your account must have a creation date to like pastes.")
      return
    }

    likePaste(pasteId)
    toast.success("Paste liked")
  }

  const handleDislike = (pasteId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      router.push("/login")
      return
    }

    if (!currentUser.createdAt) {
      toast.error("Your account must have a creation date to dislike pastes.")
      return
    }

    dislikePaste(pasteId)
    toast.success("Paste disliked")
  }

  const handleAddComment = (pasteId: string) => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    const commentContent = pasteComments[pasteId]
    if (commentContent && commentContent.trim()) {
      addCommentToPaste(pasteId, commentContent)
      setPasteComments({ ...pasteComments, [pasteId]: "" })
      toast.success("Comment added")
    }
  }

  const handleDeleteComment = (pasteId: string, commentId: string, commentAuthorId: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to delete comments.")
      return
    }

    const canDelete = canDeleteComment(commentAuthorId)

    if (!canDelete) {
      toast.error("You can only delete your own comments.")
      return
    }

    deleteComment(pasteId, commentId)
    toast.success("Comment deleted")
  }

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId)
    setEditingCommentContent(currentContent)
  }

  const handleSaveComment = (pasteId: string, commentId: string) => {
    if (editingCommentContent.trim()) {
      editComment(pasteId, commentId, editingCommentContent)
      setEditingCommentId(null)
      setEditingCommentContent("")
      toast.success("Comment updated")
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingCommentContent("")
  }

  const getUniqueCommenters = () => {
    const commenterIds = new Set<string>()
    userPastes.forEach((paste) => {
      paste.comments.forEach((comment) => {
        // Only count comments from other users (not the paste owner)
        if (comment.authorId !== user.id) {
          commenterIds.add(comment.authorId)
        }
      })
    })
    return Array.from(commenterIds)
  }

  const getCommenterWithLatestComment = () => {
    const commenterMap = new Map<
      string,
      { user: (typeof users)[0]; comment: string; timestamp: Date; pasteId: string; pasteTitle: string }
    >()

    userPastes.forEach((paste) => {
      paste.comments.forEach((comment) => {
        // Only include comments from other users (not the paste owner)
        if (comment.authorId !== user.id) {
          const commenter = users.find((u) => u.id === comment.authorId)
          if (commenter) {
            const existing = commenterMap.get(comment.authorId)
            const commentDate = new Date(comment.createdAt)

            // Keep the most recent comment from this commenter
            if (!existing || commentDate > existing.timestamp) {
              commenterMap.set(comment.authorId, {
                user: commenter,
                comment: comment.content,
                timestamp: commentDate,
                pasteId: paste.id,
                pasteTitle: paste.title,
              })
            }
          }
        }
      })
    })

    return Array.from(commenterMap.values())
  }

  const uniqueCommenterIds = getUniqueCommenters()
  const uniqueCommenters = uniqueCommenterIds.map((id) => users.find((u) => u.id === id)).filter(Boolean)
  const commentersWithContent = getCommenterWithLatestComment()

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-black rounded-lg p-4 mb-6 border border-gray-800">
            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar src={user.avatar} alt={`${user.username}'s avatar`} size={60} userId={user.id} />
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-black"></span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <div className="relative">
                    <UserDisplay
                      username={user.username}
                      role={user.role}
                      nameColor={user.nameColor}
                      activeEffect={user.activeEffect}
                      effectEnabled={user.effectEnabled}
                      user={user}
                      className="text-xl font-bold"
                    />
                  </div>
                  <div className="relative">
                    <RoleBadge role={user.role} user={user} />
                  </div>
                </div>
                {user.bio && <p className="text-sm text-gray-300 mb-2">{user.bio}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <button
                    onClick={() => setFollowersModalOpen(true)}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>{user.followers?.length || 0} followers</span>
                  </button>
                  <button
                    onClick={() => setFollowingModalOpen(true)}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>{user.following?.length || 0} following</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isSelf && currentUser && (
                  <Button
                    onClick={handleFollowToggle}
                    size="sm"
                    className={following ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}
                    disabled={user.id === "1" && following}
                  >
                    {following ? (
                      user.id === "1" ? (
                        <>
                          <UserPlus className="w-4 h-4 mr-1" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserMinus className="w-4 h-4 mr-1" />
                          Unfollow
                        </>
                      )
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
                {isAdmin && !isSelf && user.role !== "Admin" && (
                  <>
                    <Button
                      size="sm"
                      className={user.banned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                      onClick={handleBanUnban}
                    >
                      {user.banned ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Unban
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 mr-1" />
                          Ban
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={handleRemoveAvatar}
                      title="Remove profile picture"
                    >
                      <ImageOff className="w-4 h-4 mr-1" />
                      Remove PFP
                    </Button>
                    <Button size="sm" className="bg-red-800 hover:bg-red-900" onClick={handleDeleteAccount}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {user.banned && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              <p className="text-red-400 text-sm">
                This user is banned. Reason: {user.banReason || "No reason provided."}
              </p>
            </div>
          )}

          <div className="mt-6 bg-black rounded-lg border border-gray-800">
            <div className="p-2 border-b border-gray-800">
              <h2 className="text-base font-semibold text-white">Info</h2>
            </div>
            <div className="p-2">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
                  <span className="text-white text-sm">UID</span>
                  <span className="text-white text-sm font-mono">{user.uid}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
                  <span className="text-white text-sm">Pastes</span>
                  <span className="text-white text-sm font-mono">{pasteCount}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
                  <span className="text-white text-sm">Likes</span>
                  <span className="text-white text-sm font-mono">{totalLikes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm">Created:</span>
                  <span className="text-white text-sm">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-black rounded-lg border border-gray-800">
            <div className="p-2 border-b border-gray-800">
              <h2 className="text-base font-semibold text-white">Pastes</h2>
            </div>
            <div className="p-2">
              {userPastes.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {paginatedPastes.map((paste) => {
                      const pasteCommenterIds = new Set(
                        paste.comments.filter((c) => c.authorId !== user.id).map((c) => c.authorId),
                      )
                      const pasteCommenterCount = pasteCommenterIds.size

                      return (
                        <Link
                          key={paste.id}
                          href={`/paste/${paste.id}`}
                          className="block bg-black border border-gray-800 rounded p-3 hover:border-gray-700 transition-colors"
                        >
                          <h3 className="text-white font-medium text-sm mb-3">{paste.title}</h3>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-6 text-gray-400">
                              <div className="text-center">
                                <div className="font-semibold text-white text-xs">{pasteCommenterCount}</div>
                                <div className="text-xs">Comments</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-white text-xs">{paste.views}</div>
                                <div className="text-xs">Views</div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-white text-xs">
                                {new Date(paste.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                              <div className="text-xs text-gray-400">Added</div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  <div className="mt-3 text-sm text-gray-400">
                    Showing {Math.min(endPasteIndex, userPastes.length)} out of {userPastes.length} pastes
                  </div>
                  {totalPastePages > 1 && (
                    <div className="flex items-center justify-between mt-3">
                      <Button
                        onClick={() => setCurrentPastePage(Math.max(1, currentPastePage - 1))}
                        disabled={currentPastePage === 1}
                        size="sm"
                        variant="outline"
                        className="bg-black border-gray-700 hover:bg-gray-800"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                      <span className="text-sm text-gray-400">
                        Page {currentPastePage} of {totalPastePages}
                      </span>
                      <Button
                        onClick={() => setCurrentPastePage(Math.min(totalPastePages, currentPastePage + 1))}
                        disabled={currentPastePage === totalPastePages}
                        size="sm"
                        variant="outline"
                        className="bg-black border-gray-700 hover:bg-gray-800"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-white mb-2">{user.username} has no pastes.</p>
                  <p className="text-gray-400 text-sm">Showing 0 out of 0 pastes</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-black rounded-lg border border-gray-800">
            <div className="p-2 border-b border-gray-800">
              <h2 className="text-base font-semibold text-white">Comments ({uniqueCommenters.length})</h2>
            </div>
            <div className="p-2">
              {commentersWithContent.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {commentersWithContent.slice(0, 11).map(({ user: commenter, comment, pasteId, pasteTitle }) => (
                    <Link
                      key={commenter.id}
                      href={`/paste/${pasteId}`}
                      className="flex items-center gap-2 p-2 bg-black border border-gray-800 rounded hover:border-gray-700 transition-colors"
                      title={`View comment on "${pasteTitle}"`}
                    >
                      <UserAvatar src={commenter.avatar} alt={commenter.username} size={28} userId={commenter.id} />
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <UserDisplay
                          username={commenter.username}
                          role={commenter.role}
                          nameColor={commenter.nameColor}
                          activeEffect={commenter.activeEffect}
                          effectEnabled={commenter.effectEnabled}
                          user={commenter}
                          className="text-sm"
                        />
                        <RoleBadge role={commenter.role} user={commenter} />
                        <span className="text-gray-400 text-sm">:</span>
                        <span className="text-gray-300 text-sm truncate">{comment}</span>
                      </div>
                    </Link>
                  ))}
                  {commentersWithContent.length > 11 && (
                    <div className="text-center text-sm text-gray-400 pt-2">
                      +{commentersWithContent.length - 11} more commenters
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-3">No comments yet...</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Followers Modal */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        userId={user.id}
        type="followers"
      />

      {/* Following Modal */}
      <FollowersModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        userId={user.id}
        type="following"
      />

      {/* Ban Modal - Updated with black styling */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg max-w-sm w-full border border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-red-500">Ban User: {user.username}</h2>
            <p className="text-gray-300 mb-4">Please provide a reason for banning this user.</p>
            <Textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for ban..."
              className="w-full bg-black border-gray-800 mb-4 text-white"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="bg-black hover:bg-gray-800 text-white border-gray-600"
                onClick={() => setShowBanModal(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmBan} disabled={!banReason.trim()}>
                Confirm Ban
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal - Updated with black styling */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg max-w-sm w-full border border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-red-500">Delete User: {user.username}</h2>
            <p className="text-gray-300 mb-4">This action is permanent. Type "DELETE" to confirm.</p>
            <Input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full bg-black border-gray-800 mb-4 text-white"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="bg-black hover:bg-gray-800 text-white border-gray-600"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleteConfirmText !== "DELETE"}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
