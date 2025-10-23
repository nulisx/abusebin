"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { NavBar } from "@/components/nav-bar"
import { toast } from "sonner"

export default function NewPaste() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null)
  const router = useRouter()
  const { addPaste, user, isAuthenticated, pastes, canPostPaste } = useAuth()

  const rateLimitStatus = canPostPaste()
  const isRateLimited = !rateLimitStatus.canPost

  useEffect(() => {
    if (isRateLimited && rateLimitStatus.remainingTime) {
      setCooldownRemaining(rateLimitStatus.remainingTime)

      const interval = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            return null
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setCooldownRemaining(null)
    }
  }, [isRateLimited, rateLimitStatus.remainingTime])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    if (newTitle.length > 15) {
      toast.error("Paste title cannot exceed 15 characters!")
      return
    }
    setTitle(newTitle)
  }

  const handleSubmit = async () => {
    if (!title || !content) return
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (title.length > 15) {
      toast.error("Paste title cannot exceed 15 characters!")
      return
    }

    const existingPaste = pastes.find((paste) => paste.title.toLowerCase() === title.toLowerCase())

    if (existingPaste) {
      toast.error("Title already taken")
      return
    }

    if (isRateLimited && rateLimitStatus.remainingTime) {
      if (user && (user.role === "Criminal" || user.role === "Rich")) {
        toast.error("Wait 1 minute and 30 seconds.")
      } else {
        const remainingMinutes = Math.floor(rateLimitStatus.remainingTime / 60)
        const remainingSeconds = rateLimitStatus.remainingTime % 60

        toast.error(`Paste Creation Cooldown. Wait ${remainingMinutes}m ${remainingSeconds}s before posting again.`)
      }
      return
    }

    const result = await addPaste(title, content)
    if (result.success) {
      toast.success("Paste submitted successfully!")
      router.push("/")
    } else {
      if (result.remainingTime && user && (user.role === "Criminal" || user.role === "Rich")) {
        toast.error("Wait 1 minute and 30 seconds.")
      } else {
        toast.error(result.message)
      }
    }
  }

  const handleClear = () => {
    setTitle("")
    setContent("")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="flex-1 p-4">
          {isAuthenticated ? (
            <>
              <div key="warning1" className="mb-2 text-sm text-gray-400">
                READ TOS BEFORE POSTING! Pastes that violate our terms WILL be removed.
              </div>
              <div key="warning2" className="mb-2 text-sm text-gray-400">
                READ TOS BEFORE POSTING! Pastes that violate our terms WILL be removed.
              </div>
              <div key="warning3" className="mb-2 text-sm text-gray-400">
                READ TOS BEFORE POSTING! Pastes that violate our terms WILL be removed.
              </div>
            </>
          ) : (
            <div className="mb-2 text-center">
              <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm">
                Login to post pastes
              </Link>
            </div>
          )}

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!isAuthenticated}
            className="mt-4 h-[calc(100vh-200px)] w-full resize-none rounded border border-gray-800 bg-black p-4 text-white focus:border-gray-700 focus:outline-none disabled:opacity-50"
            placeholder={!isAuthenticated ? "Login to post pastes" : "Paste your content here..."}
          />
        </div>

        <div className="w-80 border-l border-gray-800 p-4">
          <div className="flex justify-center">
            <Image
              src="/images/abusebin-logo.png"
              alt="Abusebin logo"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          <div className="mt-6 text-center">
            {!isAuthenticated ? (
              <Link href="/login" className="text-blue-400 hover:text-blue-300">
                <div className="font-bold mb-2">LOGIN TO POST PASTES</div>
              </Link>
            ) : (
              <div className="text-red-500">
                READ TOS BEFORE POSTING
                <br />
                Posts that violate our terms WILL be removed
              </div>
            )}
          </div>

          <div className="mt-4 text-sm">Title</div>
          <Input
            value={title}
            onChange={handleTitleChange}
            disabled={!isAuthenticated}
            placeholder="Paste title (max 15 chars)"
            className="mt-1 w-full rounded border border-gray-800 bg-black px-3 py-2 text-white focus:border-gray-700 focus:outline-none disabled:opacity-50"
            maxLength={15}
          />
          <div className="text-xs text-gray-500 mt-1">{title.length}/15 characters</div>

          <Button
            onClick={handleClear}
            disabled={!isAuthenticated}
            className="mt-4 w-full bg-black border border-gray-600 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            CLEAR
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isAuthenticated || !title || !content}
            className="mt-4 w-full bg-black border border-gray-600 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isRateLimited && user && (user.role === "Criminal" || user.role === "Rich")
              ? "Wait 1 minute and 30 seconds."
              : "Submit paste"}
          </Button>

          <div className="mt-4 text-center text-xs text-gray-400">
            Please note that all posted information becomes public and must follow our terms of service
          </div>
        </div>
      </div>
    </div>
  )
}
