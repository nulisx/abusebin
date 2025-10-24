"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import { toast } from "sonner"
import { Search, Save, UserIcon } from "lucide-react"

const nameColors = [
  { color: "rgb(156, 163, 175)", class: "bg-gray-400", name: "Grey" },
  { color: "rgb(59, 130, 246)", class: "bg-blue-500", name: "Blue" },
  { color: "rgb(192, 132, 252)", class: "bg-purple-400", name: "Purple" },
  { color: "rgb(239, 68, 68)", class: "bg-red-500", name: "Red" },
  { color: "rgb(234, 179, 8)", class: "bg-yellow-500", name: "Yellow" },
  { color: "rgb(34, 197, 94)", class: "bg-green-500", name: "Green" },
  { color: "rgb(14, 165, 233)", class: "bg-sky-500", name: "Sky Blue" },
  { color: "rgb(255, 255, 255)", class: "bg-white", name: "White" },
  { color: "rgb(0, 255, 255)", class: "bg-cyan-500", name: "Cyan" },
  { color: "rgb(0, 0, 139)", class: "bg-blue-900", name: "Dark Blue" },
  { color: "rgb(255, 192, 203)", class: "bg-pink-300", name: "Light Pink" },
  { color: "rgb(128, 0, 128)", class: "bg-purple-800", name: "Deep Purple" },
  { color: "rgb(255, 140, 0)", class: "bg-orange-600", name: "Dark Orange" },
]

export default function UserManagementPage() {
  const router = useRouter()
  const { user, users, isAuthenticated, getUserByUsername, grantEffectPermission, revokeEffectPermission } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    avatar: "",
    nameColor: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login")
      return
    }

    if (user.role !== "Admin" && user.role !== "Manager") {
      router.push("/")
      toast.error("You don't have permission to access this page")
      return
    }
  }, [user, isAuthenticated, router])

  if (!isAuthenticated || !user || (user.role !== "Admin" && user.role !== "Manager")) {
    return null
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a username to search")
      return
    }

    const foundUser = getUserByUsername(searchQuery.trim())
    if (foundUser) {
      setSelectedUser(foundUser)
      setEditForm({
        username: foundUser.username,
        bio: foundUser.bio || "",
        avatar: foundUser.avatar || "/images/design-mode/a9q5s0.png",
        nameColor: foundUser.nameColor || "rgb(156, 163, 175)",
      })
      toast.success(`Found user: ${foundUser.username}`)
    } else {
      toast.error("User not found")
      setSelectedUser(null)
    }
  }

  const handleSave = async () => {
    if (!selectedUser) return

    setIsSaving(true)
    try {
      const { updateUser: updateUserInStore } = useAuth.getState()

      // Temporarily switch context to the selected user
      const originalUser = user
      useAuth.setState({ user: selectedUser })

      const result = await updateUserInStore({
        username: editForm.username,
        bio: editForm.bio,
        avatar: editForm.avatar,
        nameColor: editForm.nameColor,
      })

      // Restore original user context
      useAuth.setState({ user: originalUser })

      if (result.success) {
        toast.success("User profile updated successfully!")
        // Refresh the selected user data
        const updatedUser = getUserByUsername(editForm.username)
        if (updatedUser) {
          setSelectedUser(updatedUser)
        }
      } else {
        toast.error(result.message || "Failed to update user profile")
      }
    } catch (error) {
      console.error("[v0] Error updating user:", error)
      toast.error("An error occurred while updating the user profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleEffectPermission = () => {
    if (!selectedUser) return

    if (selectedUser.hasEffectPermission) {
      revokeEffectPermission(selectedUser.id)
      toast.success("Effect permission revoked")
    } else {
      grantEffectPermission(selectedUser.id)
      toast.success("Effect permission granted")
    }

    // Refresh selected user
    const updatedUser = getUserByUsername(selectedUser.username)
    if (updatedUser) {
      setSelectedUser(updatedUser)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">User Management</h1>

        {/* Search Section */}
        <div className="mb-8 flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter username to search..."
            className="bg-black border-gray-800 text-white flex-1"
          />
          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/* User Edit Form */}
        {selectedUser ? (
          <div className="space-y-6 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-800">
              <UserAvatar src={editForm.avatar} alt={selectedUser.username} size={64} userId={selectedUser.id} />
              <div>
                <h2 className="text-xl font-bold">{selectedUser.username}</h2>
                <p className="text-sm text-gray-400">Role: {selectedUser.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <Input
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="bg-black border-gray-800 text-white"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="bg-black border-gray-800 text-white resize-none h-24"
                  maxLength={35}
                />
                <p className="text-xs text-gray-400 text-right mt-1">{editForm.bio.length}/35 characters</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Avatar URL</label>
                <Input
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  className="bg-black border-gray-800 text-white"
                  placeholder="https://..."
                />
              </div>

              {selectedUser.role !== "Admin" && selectedUser.role !== "Council" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Name Color</label>
                  <div className="grid grid-cols-6 gap-2">
                    {nameColors.map((color, index) => (
                      <button
                        key={index}
                        className={`w-full h-10 rounded ${color.class} ${
                          editForm.nameColor === color.color ? "ring-2 ring-white" : ""
                        }`}
                        onClick={() => setEditForm({ ...editForm, nameColor: color.color })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Effect Permission</label>
                  <Button
                    onClick={handleToggleEffectPermission}
                    variant="outline"
                    size="sm"
                    className={`${
                      selectedUser.hasEffectPermission
                        ? "bg-green-600 hover:bg-green-700 border-green-600"
                        : "bg-gray-700 hover:bg-gray-600 border-gray-600"
                    } text-white`}
                  >
                    {selectedUser.hasEffectPermission ? "Granted" : "Not Granted"}
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  {selectedUser.hasEffectPermission
                    ? "User can select and use visual effects"
                    : "User cannot use visual effects"}
                </p>
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700">
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <UserIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Search for a user to manage their profile</p>
          </div>
        )}
      </main>
    </div>
  )
}
