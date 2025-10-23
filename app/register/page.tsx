"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { NavBar } from "@/components/nav-bar"
import { AlertTriangle } from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

export default function SignUpPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, username: value })

    // Clear previous errors
    setErrors((prev) => ({ ...prev, username: "" }))

    // Validate in real-time
    if (value.length > 25) {
      setErrors((prev) => ({ ...prev, username: "Username must be at most 25 characters long" }))
    } else if (/[^a-zA-Z0-9_]/.test(value)) {
      setErrors((prev) => ({ ...prev, username: "Username can only contain letters, numbers, and underscores" }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, password: value })

    // Clear previous errors
    setErrors((prev) => ({ ...prev, password: "" }))

    // Validate in real-time
    if (value.length > 25) {
      setErrors((prev) => ({ ...prev, password: "Password must be at most 25 characters long" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ username: "", password: "" })

    let hasError = false

    // Username validation - max 25 characters and no special characters
    if (!formData.username.trim()) {
      setErrors((prev) => ({ ...prev, username: "Username is required" }))
      hasError = true
    } else if (formData.username.length > 25) {
      setErrors((prev) => ({ ...prev, username: "Username must be at most 25 characters long" }))
      hasError = true
    } else if (/[^a-zA-Z0-9_]/.test(formData.username)) {
      setErrors((prev) => ({ ...prev, username: "Username can only contain letters, numbers, and underscores" }))
      hasError = true
    }

    // Password validation - max 25 characters (no minimum length)
    if (!formData.password.trim()) {
      setErrors((prev) => ({ ...prev, password: "Password is required" }))
      hasError = true
    } else if (formData.password.length > 25) {
      setErrors((prev) => ({ ...prev, password: "Password must be at most 25 characters long" }))
      hasError = true
    }

    if (hasError) {
      return
    }

    try {
      const { success, error } = register(formData.username, formData.email, formData.password)
      if (success) {
        // Show success message with logout option
        setShowSuccessMessage(true)
      } else {
        setErrors((prev) => ({ ...prev, username: error || "Registration failed" }))
      }
    } catch (error) {
      console.error("Registration error:", error)
      setErrors((prev) => ({ ...prev, username: "Registration failed. Please try again." }))
    }
  }

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <NavBar />

        <div className="flex items-center justify-center flex-1 min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-sm p-6 rounded-lg bg-[#141414]">
            <h1 className="mb-6 text-xl font-medium text-center text-white">Registration Successful</h1>

            <div className="p-4 mb-6 bg-green-900/20 border border-green-500/30 rounded-md text-center">
              <p className="text-white mb-2">Your account has been created successfully!</p>
              <p className="text-gray-400 text-sm">You are now logged in as {formData.username}</p>
            </div>

            <div className="space-y-4">
              <Button onClick={() => router.push("/")} className="w-full bg-[#1A1A1A] hover:bg-[#252525]">
                Go to Home
              </Button>

              <LogoutButton className="w-full bg-[#1A1A1A] hover:bg-[#252525]" showIcon={true} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <NavBar />

      <div className="flex items-center justify-center flex-1 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-sm p-6 rounded-lg bg-[#141414]">
          <h1 className="mb-6 text-xl font-medium text-center text-white">Sign Up</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleUsernameChange}
                className="w-full px-3 py-2 text-white border-0 rounded bg-[#1A1A1A] focus:ring-1 focus:ring-gray-500"
              />
              {errors.username && (
                <div className="mt-2 flex items-center gap-2 bg-[#332b00] text-white p-2 border-l-4 border-yellow-500">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm">{errors.username}</p>
                </div>
              )}
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email address (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-white border-0 rounded bg-[#1A1A1A] focus:ring-1 focus:ring-gray-500"
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 text-white border-0 rounded bg-[#1A1A1A] focus:ring-1 focus:ring-gray-500"
              />
              {errors.password && (
                <div className="mt-2 flex items-center gap-2 bg-[#332b00] text-white p-2 border-l-4 border-yellow-500">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm">{errors.password}</p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-2 mt-2 text-white transition-colors rounded bg-[#1A1A1A] hover:bg-[#252525]"
            >
              Sign up
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
