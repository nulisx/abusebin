"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { usePastes } from "@/lib/paste-context"
import dynamic from "next/dynamic"
import { toast } from "sonner"

// dynamically import UI components to reduce bundle size
const NavBar = dynamic(() => import("@/components/nav-bar"), { ssr: false })
const Button = dynamic(() => import("@/components/ui/button"), { ssr: false })
const Input = dynamic(() => import("@/components/ui/input"), { ssr: false })
const AlertTriangle = dynamic(() => import("lucide-react").then((mod) => mod.AlertTriangle), { ssr: false })

export default function DeleteAccountPage() {
  const router = useRouter()
  const { user, deleteAccount } = useAuth()
  const { deleteUserPastes } = usePastes()
  const [password, setPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  // Redirects
  if (typeof window !== "undefined") {
    if (!user) {
      router.push("/login")
      return null
    }

    if (user.role === "Admin") {
      router.push("/profile/customize")
      return null
    }
  }

  const handleDeleteAccount = async () => {
    setError("")

    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm account deletion")
      return
    }

    if (!password) {
      setError("Please enter your password")
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteAccount(password)

      if (result.success) {
        toast.success(result.message)
        router.push("/")
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      setError("Failed to delete account. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="bg-black rounded-lg p-6 border border-red-500/30">
          <h1 className="text-2xl font-bold mb-6 text-center">Delete Account</h1>

          <div className="flex items-center gap-3 p-4 mb-6 bg-red-900/20 rounded-md border border-red-500/30">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <p className="text-sm">
              This action is <span className="font-bold">permanent</span> and cannot be undone. All your pastes,
              comments, and profile information will be permanently deleted.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-black border-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type DELETE to confirm</label>
              <Input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="bg-black border-gray-800"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText !== "DELETE" || !password}
            >
              {isDeleting ? "Deleting Account..." : "Delete My Account"}
            </Button>

            <Button
              variant="outline"
              className="w-full border-gray-800 bg-black hover:bg-gray-800"
              onClick={() => router.push("/profile/customize")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
