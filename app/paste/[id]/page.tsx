"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { NavBar } from "@/components/nav-bar"
import { useAuth } from "@/lib/auth"
import { UserDisplay } from "@/components/user-display"
import { RoleBadge } from "@/components/role-badge"
import { LoadingScreen } from "@/components/loading-screen"
import { toast } from "sonner"
import { Eye, MessageSquare, Edit, Save, X, Pin, RotateCcw, Trash2, ThumbsUp, ThumbsDown } from "lucide-react"

export default function PastePage() {
  const params = useParams()
  const router = useRouter()
  const {
    pastes,
    users,
    user: currentUser,
    addCommentToPaste,
    editPaste,
    deletePaste,
    isSuperAdmin,
    incrementPasteViews,
    deleteComment,
    resetPasteViews,
    togglePinPaste,
    canDeleteComment,
    canManageOwnPasteComments,
    likePaste,
    dislikePaste,
    editComment, // Added editComment function
  } = useAuth()
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [hasIncrementedViews, setHasIncrementedViews] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState("")

  const pasteId = params.id as string
  const paste = pastes.find((p) => p.id === pasteId)
  const author = paste ? users.find((u) => u.id === paste.authorId) : null

  const canEditPaste =
    currentUser &&
    (isSuperAdmin() || (canManageOwnPasteComments(currentUser.role) && paste?.authorId === currentUser.id))
  const canDeletePaste =
    currentUser &&
    (isSuperAdmin() || (canManageOwnPasteComments(currentUser.role) && paste?.authorId === currentUser.id))
  const canManageComments =
    currentUser &&
    (isSuperAdmin() || (canManageOwnPasteComments(currentUser.role) && paste?.authorId === currentUser.id))

  const hasLiked = currentUser && paste?.likes?.includes(currentUser.id)
  const hasDisliked = currentUser && paste?.dislikes?.includes(currentUser.id)
  const canInteract = currentUser && currentUser.createdAt

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (paste) {
      setEditTitle(paste.title)
      setEditContent(paste.content)

      if (!hasIncrementedViews) {
        incrementPasteViews(pasteId)
        setHasIncrementedViews(true)
      }
    }
  }, [paste, pasteId, incrementPasteViews, hasIncrementedViews])

  if (loading) {
    return <LoadingScreen />
  }

  if (!paste) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Paste not found</h1>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    )
  }

  const handleCommentSubmit = () => {
    if (!currentUser) {
      router.push("/login")
      return
    }
    if (comment.trim()) {
      addCommentToPaste(pasteId, comment)
      setComment("")
      toast.success("Comment added successfully")
    }
  }

  const handleEditSave = () => {
    if (!canEditPaste) {
      toast.error("You do not have permission to edit this paste.")
      return
    }

    const result = editPaste(pasteId, editTitle, editContent)
    if (result.success) {
      setIsEditing(false)
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditTitle(paste.title)
    setEditContent(paste.content)
  }

  const handleDeleteComment = (commentId: string, commentAuthorId: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to delete comments.")
      return
    }

    const canDelete = canDeleteComment(commentAuthorId) || (canManageComments && paste?.authorId === currentUser.id)

    if (!canDelete) {
      toast.error("You can only delete your own comments or comments on your own pastes.")
      return
    }

    deleteComment(pasteId, commentId)
    toast.success("Comment deleted successfully")
  }

  const handleResetViews = () => {
    if (!currentUser || !isSuperAdmin()) {
      toast.error("You do not have permission to reset views.")
      return
    }

    resetPasteViews(pasteId)
    toast.success("Views reset successfully")
  }

  const handleTogglePin = () => {
    if (!currentUser || !isSuperAdmin()) {
      toast.error("You do not have permission to pin/unpin pastes.")
      return
    }

    togglePinPaste(pasteId)
    toast.success(paste.isPinned ? "Paste unpinned" : "Paste pinned")
  }

  const handleDeletePaste = () => {
    if (!canDeletePaste) {
      toast.error("You do not have permission to delete this paste.")
      return
    }

    const result = deletePaste(pasteId)
    if (result.success) {
      toast.success(result.message)
      router.push("/")
    } else {
      toast.error(result.message)
    }
  }

  const handleLike = () => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    if (!currentUser.createdAt) {
      toast.error("Your account must have a creation date to like pastes.")
      return
    }

    likePaste(pasteId)
    toast.success(hasLiked ? "Like removed" : "Paste liked")
  }

  const handleDislike = () => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    if (!currentUser.createdAt) {
      toast.error("Your account must have a creation date to dislike pastes.")
      return
    }

    dislikePaste(pasteId)
    toast.success(hasDisliked ? "Dislike removed" : "Paste disliked")
  }

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId)
    setEditingCommentContent(currentContent)
  }

  const handleSaveComment = (commentId: string) => {
    if (editingCommentContent.trim()) {
      editComment(pasteId, commentId, editingCommentContent)
      setEditingCommentId(null)
      setEditingCommentContent("")
      toast.success("Comment updated successfully")
    }
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingCommentContent("")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <div className="flex max-w-7xl mx-auto p-6 gap-8">
        {/* Left Side - Paste Content */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-black border border-gray-800 rounded-md p-3">
                <h1 className="text-2xl font-bold text-white">Edit Paste</h1>
                <div className="flex gap-2">
                  <Button onClick={handleEditSave} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleEditCancel}
                    size="sm"
                    className="bg-black hover:bg-gray-800 text-white border border-gray-600"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Paste title"
                className="bg-black border-gray-800 text-white"
              />
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Paste content"
                className="bg-black border-gray-800 min-h-[400px] font-mono text-white"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">{paste.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">{paste.comments.length}</span>
                  </div>
                  {paste.isPinned && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Pin className="w-4 h-4" />
                      <span className="text-sm">Pinned</span>
                    </div>
                  )}
                </div>
                {currentUser && (canEditPaste || isSuperAdmin()) && (
                  <div className="flex gap-2 bg-black border border-gray-800 rounded-md p-1">
                    {canEditPaste && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-gray-800"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    {isSuperAdmin() && (
                      <>
                        <Button
                          onClick={handleTogglePin}
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-gray-800"
                        >
                          <Pin className="w-4 h-4 mr-1" />
                          {paste.isPinned ? "Unpin" : "Pin"}
                        </Button>
                        <Button
                          onClick={handleResetViews}
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-gray-800"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reset Views
                        </Button>
                      </>
                    )}
                    {canDeletePaste && (
                      <Button
                        onClick={handleDeletePaste}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:bg-gray-800 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-black rounded-lg p-6 border border-gray-800">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-100 overflow-x-auto">
                  {paste.content}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Logo, Title, and Comments */}
        <div className="w-80 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/images/abusebin-logo.png"
              alt="abuse.bin logo"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Paste Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{paste.title}</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span>by</span>
              {author && <UserDisplay username={author.username} role={author.role} nameColor={author.nameColor} />}
            </div>
            <div className="mt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paste.id)
                  toast.success("Paste ID copied to clipboard")
                }}
                className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer"
                title="Click to copy paste ID"
              >
                ID: {paste.id}
              </button>
            </div>
          </div>

          {/* Like/Dislike Buttons */}
          <div className="bg-black rounded-lg p-3 border border-gray-800">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleLike}
                disabled={!canInteract}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm ${
                  canInteract
                    ? hasLiked
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-900 text-gray-600 cursor-not-allowed"
                }`}
                title={!canInteract ? "Login to like" : hasLiked ? "Unlike" : "Like"}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="font-semibold">{paste.likes?.length || 0}</span>
              </button>
              <button
                onClick={handleDislike}
                disabled={!canInteract}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-sm ${
                  canInteract
                    ? hasDisliked
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-900 text-gray-600 cursor-not-allowed"
                }`}
                title={!canInteract ? "Login to dislike" : hasDisliked ? "Remove dislike" : "Dislike"}
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="font-semibold">{paste.dislikes?.length || 0}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-black rounded-lg p-4 border border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Comments ({paste.comments.length})</h2>

            {/* Comment Form */}
            {currentUser ? (
              <div className="mb-4">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="bg-black border-gray-800 mb-2"
                  rows={3}
                  maxLength={20}
                />
                <Button
                  onClick={handleCommentSubmit}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!comment.trim()}
                >
                  Post
                </Button>
              </div>
            ) : (
              <div className="mb-4 text-center bg-black rounded-lg p-4 border border-gray-800">
                <p className="text-gray-400 text-sm mb-2">Login to comment</p>
                <Button
                  onClick={() => router.push("/login")}
                  size="sm"
                  variant="outline"
                  className="w-full bg-black border-gray-700 hover:bg-gray-800"
                >
                  Login
                </Button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {paste.comments.length > 0 ? (
                paste.comments.map((comment) => {
                  const commentAuthor = users.find((u) => u.id === comment.authorId)
                  const canDelete =
                    currentUser &&
                    (canDeleteComment(comment.authorId) || (canManageComments && paste?.authorId === currentUser.id))
                  const isCommentAuthor = currentUser && currentUser.id === comment.authorId
                  const isEditing = editingCommentId === comment.id

                  return (
                    <div key={comment.id} className="bg-black rounded p-3 border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 flex-1">
                          {commentAuthor && (
                            <>
                              <UserDisplay
                                username={commentAuthor.username}
                                role={commentAuthor.role}
                                nameColor={commentAuthor.nameColor}
                                activeEffect={commentAuthor.activeEffect}
                                effectEnabled={commentAuthor.effectEnabled}
                                user={commentAuthor}
                                className="text-sm"
                              />
                              <RoleBadge role={commentAuthor.role} user={commentAuthor} className="text-xs" />
                              <span className="text-white text-sm">:</span>
                              {!isEditing && <span className="text-white text-sm ml-1">{comment.content}</span>}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {(() => {
                              const now = new Date()
                              const commentDate = new Date(comment.createdAt)
                              const diffMs = now.getTime() - commentDate.getTime()
                              const diffMins = Math.floor(diffMs / 60000)
                              const diffHours = Math.floor(diffMs / 3600000)
                              const diffDays = Math.floor(diffMs / 86400000)
                              const diffMonths = Math.floor(diffMs / 2592000000)

                              if (diffMins < 60) return `${diffMins} minutes ago`
                              if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
                              if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
                              return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`
                            })()}
                          </span>
                          {isCommentAuthor && !isEditing && (
                            <Button
                              onClick={() => handleEditComment(comment.id, comment.content)}
                              size="sm"
                              variant="ghost"
                              className="text-blue-500 hover:text-blue-400 p-1"
                              title="Edit comment"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              onClick={() => handleDeleteComment(comment.id, comment.authorId)}
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-400 p-1"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {isEditing && (
                        <div className="space-y-2 mt-2">
                          <Textarea
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                            className="bg-black border-gray-800 text-sm"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSaveComment(comment.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-xs"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              size="sm"
                              variant="outline"
                              className="bg-black border-gray-700 hover:bg-gray-800 text-xs"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-400 text-sm text-center py-4">No comments yet...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
