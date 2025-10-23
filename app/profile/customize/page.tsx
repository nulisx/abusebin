"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, Save, Trash2, RotateCcw, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  useAuth,
  canAccessAllNameColors,
  canChangeUsername,
  ROLE_COLORS,
  EFFECT_URLS,
  hasEffectAccess,
} from "@/lib/auth"
import { NavBar } from "@/components/nav-bar"
import Link from "next/link"
import { toast } from "sonner"
import { UserAvatar } from "@/components/user-avatar"
import { UserDisplay } from "@/components/user-display"

const nameColors = [
  // Basic colors (available to all)
  { color: "rgb(156, 163, 175)", class: "bg-gray-400", premium: false, name: "Grey" },
  { color: "rgb(59, 130, 246)", class: "bg-blue-500", premium: false, name: "Blue" },
  { color: "rgb(192, 132, 252)", class: "bg-purple-400", premium: false, name: "Purple" },
  { color: "rgb(239, 68, 68)", class: "bg-red-500", premium: false, name: "Red" },
  { color: "rgb(234, 179, 8)", class: "bg-yellow-500", premium: false, name: "Yellow" },

  // Premium colors (higher roles only)
  { color: "rgb(34, 197, 94)", class: "bg-green-500", premium: true, name: "Green" },
  { color: "rgb(14, 165, 233)", class: "bg-sky-500", premium: true, name: "Sky Blue" },
  { color: "rgb(255, 255, 255)", class: "bg-white", premium: true, name: "White" },
  { color: "rgb(0, 255, 255)", class: "bg-cyan-500", premium: true, name: "Cyan" },
  { color: "rgb(0, 0, 139)", class: "bg-blue-900", premium: true, name: "Dark Blue" },
  { color: "rgb(255, 192, 203)", class: "bg-pink-300", premium: true, name: "Light Pink" },
  { color: "rgb(128, 0, 128)", class: "bg-purple-800", premium: true, name: "Deep Purple" },
  { color: "rgb(255, 140, 0)", class: "bg-orange-600", premium: true, name: "Dark Orange" },

  // Extended premium colors for higher roles
  { color: "rgb(255, 20, 147)", class: "bg-pink-600", premium: true, name: "Deep Pink" },
  { color: "rgb(50, 205, 50)", class: "bg-green-400", premium: true, name: "Lime Green" },
  { color: "rgb(255, 215, 0)", class: "bg-yellow-400", premium: true, name: "Gold" },
  { color: "rgb(138, 43, 226)", class: "bg-violet-600", premium: true, name: "Blue Violet" },
  { color: "rgb(255, 69, 0)", class: "bg-red-600", premium: true, name: "Red Orange" },
  { color: "rgb(0, 191, 255)", class: "bg-sky-400", premium: true, name: "Deep Sky Blue" },
  { color: "rgb(255, 105, 180)", class: "bg-pink-400", premium: true, name: "Hot Pink" },
  { color: "rgb(32, 178, 170)", class: "bg-teal-500", premium: true, name: "Light Sea Green" },
  { color: "rgb(255, 99, 71)", class: "bg-red-400", premium: true, name: "Tomato" },
  { color: "rgb(147, 112, 219)", class: "bg-purple-500", premium: true, name: "Medium Purple" },
  { color: "rgb(0, 250, 154)", class: "bg-green-300", premium: true, name: "Medium Spring Green" },
  { color: "rgb(255, 165, 0)", class: "bg-orange-500", premium: true, name: "Orange" },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateUser, isAuthenticated, users, getUserByUsername } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [settings, setSettings] = useState({
    bio: "",
    avatar: "",
    nameColor: nameColors[0].color,
    username: "",
    activeEffect: null as string | null,
    effectEnabled: false,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setHasInitialized(true)
    }, 100)

    return () => clearTimeout(initTimer)
  }, [])

  useEffect(() => {
    if (!hasInitialized) {
      return
    }

    console.log("[v0] Customize page - Auth state:", { isAuthenticated, hasUser: !!user })

    if (isAuthenticated === false) {
      console.log("[v0] Not authenticated, redirecting to login")
      router.push("/login")
      return
    }

    if (isAuthenticated && !user) {
      console.log("[v0] Authenticated but no user, waiting...")
      setIsLoading(true)
      return
    }

    if (user) {
      console.log("[v0] User loaded:", user.username)
      setSettings({
        bio: user.bio || "",
        avatar: user.avatar || "https://files.catbox.moe/ezqzq0.png",
        nameColor: user.nameColor || nameColors[0].color,
        username: user.username || "",
        activeEffect: user.activeEffect || null,
        effectEnabled: user.effectEnabled || false,
      })
      setIsLoading(false)
    }
  }, [user, isAuthenticated, router, hasInitialized])

  if (!hasInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">Loading your settings...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Please log in</h1>
            <p className="text-gray-400 mb-6">You need to be logged in to customize your profile.</p>
            <Button onClick={() => router.push("/login")} className="bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const saveAvatarOnly = async (avatarData: string) => {
    try {
      const updatedUser: any = {
        avatar: avatarData,
      }

      const result = await updateUser(updatedUser)
      if (result.success) {
        toast.success("Avatar updated successfully")
        setUploadedFile(null)
      } else {
        toast.error(result.message || "Failed to update avatar")
      }
    } catch (error) {
      console.error("Error updating avatar:", error)
      toast.error("Failed to update avatar. Please try again.")
    }
  }

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      try {
        const result = reader.result as string
        setSettings((prev) => ({ ...prev, avatar: result }))
        setUploadedFile(file)
        // Auto-save the avatar immediately
        saveAvatarOnly(result)
      } catch (error) {
        console.error("Error processing file:", error)
        toast.error("Failed to process image. Please try again.")
      }
    }
    reader.onerror = () => {
      console.error("FileReader error")
      toast.error("Failed to read image file. Please try again.")
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
    event.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }

  const getDefaultRoleColor = () => {
    const colorMap: { [key: string]: string } = {
      "text-red-500": "#ef4444",
      "text-purple-500": "#a855f7",
      "text-green-400": "#4ade80",
      "text-purple-600": "#9333ea",
      "text-blue-500": "#3b82f6",
      "text-gray-500": "#6b7280",
      "text-blue-900": "#1e3a8a",
      "text-yellow-400": "#facc15",
      "text-pink-400": "#f472b6",
      "text-red-800": "#991b1b",
      "text-cyan-600": "#0891b2",
      "text-gray-300": "#d1d5db",
    }
    const roleColor = ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || ROLE_COLORS.User
    return colorMap[roleColor] || "#d1d5db"
  }

  const handleResetNameColor = () => {
    const defaultColor = getDefaultRoleColor()
    setSettings((prev) => ({ ...prev, nameColor: defaultColor }))
    toast.success("Name color reset to default role color!")
  }

  const handleSave = async () => {
    try {
      const updatedUser: any = {
        bio: settings.bio,
      }

      if (user.role !== "Admin" && user.role !== "Council" && settings.nameColor !== user.nameColor) {
        updatedUser.nameColor = settings.nameColor
      }

      if (settings.avatar && settings.avatar !== user.avatar) {
        updatedUser.avatar = settings.avatar
      }

      if (settings.username !== user.username) {
        const usernameChangeStatus = canChangeUsername(user.role, user.lastUsernameChange)

        if (!usernameChangeStatus.canChange) {
          toast.error(usernameChangeStatus.reason || "You cannot change your username at this time.")
          return
        }

        const existingUser = getUserByUsername(settings.username)
        if (existingUser && existingUser.id !== user.id) {
          toast.error("Username is already taken. Please choose a different one.")
          return
        }

        if (settings.username.length < 3 || settings.username.length > 20) {
          toast.error("Username must be between 3 and 20 characters.")
          return
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(settings.username)) {
          toast.error("Username can only contain letters, numbers, underscores, and hyphens.")
          return
        }

        updatedUser.username = settings.username
        updatedUser.lastUsernameChange = new Date()
      }

      if (hasEffectAccess(user)) {
        updatedUser.activeEffect = settings.activeEffect
        updatedUser.effectEnabled = settings.effectEnabled
      }

      const result = await updateUser(updatedUser)
      if (result.success) {
        toast.success("Changes saved successfully")
        setUploadedFile(null)
      } else {
        toast.error(result.message || "Failed to save changes")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to save changes. Please try again.")
    }
  }

  const handlePreview = () => {
    setPreviewMode(!previewMode)
  }

  const usernameChangeStatus = canChangeUsername(user.role, user.lastUsernameChange)

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex flex-col items-center">
            <div
              className={`relative group cursor-pointer rounded-full overflow-hidden ${
                isDragging ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={handleAvatarClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              title="Change Avatar"
            >
              <UserAvatar
                src={settings.avatar || "https://files.catbox.moe/ezqzq0.png"}
                alt="Profile"
                size={128}
                userId={user.id}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm text-center px-2">Change Avatar</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          <h1 className="text-2xl font-bold text-center">User Settings</h1>

          <Dialog open={previewMode} onOpenChange={setPreviewMode}>
            <DialogContent className="bg-gray-900 text-white" style={{ border: "2px solid #000000" }}>
              <DialogHeader>
                <DialogTitle className="text-center">Profile Preview</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative">
                  <UserAvatar src={settings.avatar || "https://files.catbox.moe/ezqzq0.png"} alt="Preview" size={80} />
                </div>
                <UserDisplay
                  username={settings.username || user.username}
                  role={user.role}
                  nameColor={settings.nameColor}
                  className="text-xl font-bold"
                  activeEffect={settings.activeEffect}
                  effectEnabled={settings.effectEnabled}
                  user={user}
                />
                {settings.bio && <p className="text-sm text-gray-300 text-center">{settings.bio}</p>}
              </div>
            </DialogContent>
          </Dialog>

          {usernameChangeStatus.canChange && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <label className="text-sm font-medium">
                  Username {user.role === "Admin" ? "(Can change anytime)" : "(Once per week)"}
                </label>
              </div>
              <Input
                value={settings.username}
                onChange={(e) => setSettings((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Enter new username"
                className="bg-black border-gray-800 text-white"
                maxLength={20}
              />
              <p className="text-xs text-gray-400">
                Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              value={settings.bio}
              onChange={(e) => {
                if (e.target.value.length <= 35) {
                  setSettings((prev) => ({ ...prev, bio: e.target.value }))
                }
              }}
              placeholder="Tell us about yourself..."
              className="bg-black border-gray-800 resize-none h-32 focus:border-gray-700"
              maxLength={35}
            />
            <p className="text-xs text-gray-400 text-right">{settings.bio.length}/35 characters</p>
          </div>

          {user.role !== "Admin" && user.role !== "Council" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Name Color {canAccessAllNameColors(user.role) && "(All colors unlocked)"}
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetNameColor}
                  className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white flex items-center gap-2"
                  title="Reset to default role color"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {nameColors.map((color, index) => {
                  const canUseColor = !color.premium || canAccessAllNameColors(user.role) || user.role === "Rich"

                  return (
                    <div key={index} className="relative">
                      <button
                        className={`w-full h-10 rounded ${color.class} ${
                          settings.nameColor === color.color ? "ring-2 ring-white" : ""
                        } ${!canUseColor ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        onClick={() => canUseColor && setSettings((prev) => ({ ...prev, nameColor: color.color }))}
                        title={!canUseColor ? "Upgrade to unlock" : color.name}
                      />
                      {!canUseColor && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Link href="/upgrades" className="text-xs text-white hover:underline">
                            Upgrade
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {hasEffectAccess(user) && (
            <div className="space-y-4 pt-4 border-t border-gray-800">
              <h2 className="text-xl font-bold">Visual Effects</h2>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Select Effect</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSettings((prev) => ({ ...prev, activeEffect: null, effectEnabled: false }))}
                    className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white flex items-center gap-2"
                    title="Clear all effects"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Effects
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(EFFECT_URLS).map(([effectName, effectUrl]) => {
                    const isSelected = settings.activeEffect === effectName
                    const displayName = effectName
                      .split("-")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")

                    return (
                      <button
                        key={effectName}
                        onClick={() =>
                          setSettings((prev) => ({ ...prev, activeEffect: effectName, effectEnabled: true }))
                        }
                        className={`relative rounded-lg border-2 transition-all overflow-hidden h-32 ${
                          isSelected ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        <img
                          src={effectUrl || "/placeholder.svg"}
                          alt={displayName}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                          <div className="text-xs font-medium text-center text-white">{displayName}</div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button variant="outline" className="bg-gray-700 hover:bg-gray-600 border-0" onClick={handlePreview}>
              <Eye className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="bg-gray-700 hover:bg-gray-600 border-0" onClick={handleSave}>
              <Save className="w-5 h-5" />
            </Button>
          </div>

          {user.role !== "Admin" && (
            <div className="pt-8 border-t border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-center">Danger Zone</h2>
              <div className="flex justify-center">
                <Link href="/settings/delete-account">
                  <Button
                    variant="outline"
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
