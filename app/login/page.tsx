"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"
import { NavBar } from "@/components/nav-bar"
import { toast } from "sonner"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user } = useAuth()

  const redirectTo = searchParams.get("redirectTo") || "/"

  useEffect(() => {
    if (user) {
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Please enter both username and password")
      setIsLoading(false)
      return
    }

    try {
      console.log("Attempting login with:", formData)
      const result = await login(formData.username.trim(), formData.password)
      console.log("Login result:", result)

      if (result.success) {
        toast.success("Login successful!")
        router.push(redirectTo)
      } else {
        setError(result.error || "Invalid username or password")
        toast.error(result.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <NavBar />

      <div className="flex items-center justify-center flex-1 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-sm p-6 rounded-lg bg-[#141414] border border-black">
          <h1 className="mb-6 text-xl font-medium text-center text-white">Login</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1"></label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full px-3 py-2 text-white border-0 rounded bg-[#1A1A1A] focus:ring-1 focus:ring-gray-500"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1"></label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-white border-0 rounded bg-[#1A1A1A] focus:ring-1 focus:ring-gray-500"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-2 mt-6 text-white transition-colors rounded bg-[#1A1A1A] hover:bg-[#252525] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="text-center text-sm mt-6">
            <span className="text-gray-400">Don't have an account? </span>
            <Link href="/register" className="text-blue-400 hover:text-blue-300 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
