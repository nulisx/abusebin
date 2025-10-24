"use client"

import type React from "react"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAuth, EFFECT_URLS } from "@/lib/auth"
import { useEffect, useState, useCallback } from "react"

interface UserAvatarProps {
  src?: string
  alt: string
  size?: number
  className?: string
  fallbackSrc?: string
  unoptimized?: boolean
  userId?: string // Optional: for real-time updates when user changes avatar
}

export function UserAvatar({
  src,
  alt,
  size = 32,
  className,
  fallbackSrc = "/images/design-mode/a9q5s0.png",
  unoptimized,
  userId,
}: UserAvatarProps) {
  const { users, user: currentUser } = useAuth()
  const [avatarSrc, setAvatarSrc] = useState(src || fallbackSrc)
  const [imageError, setImageError] = useState(false)
  const [imageKey, setImageKey] = useState(0) // Force re-render key
  const [isLoading, setIsLoading] = useState(false)
  const [effectUrl, setEffectUrl] = useState<string | null>(null)

  const isGifUrl = useCallback((url: string) => {
    if (!url) return false
    const lowerUrl = url.toLowerCase()
    return (
      lowerUrl.includes(".gif") ||
      lowerUrl.includes("gif") ||
      (url.startsWith("data:") && lowerUrl.includes("data:image/gif")) ||
      lowerUrl.includes("tenor.com") ||
      lowerUrl.includes("giphy.com") ||
      (lowerUrl.includes("imgur.com/") && lowerUrl.includes(".gif"))
    )
  }, [])

  useEffect(() => {
    let newSrc = src || fallbackSrc
    let newEffectUrl: string | null = null

    // Real-time avatar updates: if userId is provided, watch for changes to that user's avatar
    if (userId) {
      const targetUser = users.find((u) => u.id === userId)
      if (
        targetUser?.avatar &&
        targetUser.avatar.trim() !== "" &&
        targetUser.avatar !== "undefined" &&
        targetUser.avatar !== "null"
      ) {
        newSrc = targetUser.avatar
      } else {
        newSrc = fallbackSrc
      }

      if (targetUser?.effectEnabled && targetUser.activeEffect && EFFECT_URLS[targetUser.activeEffect]) {
        newEffectUrl = EFFECT_URLS[targetUser.activeEffect]
      }
    }

    // For current user, prioritize current user object avatar
    if (userId && currentUser && currentUser.id === userId) {
      if (
        currentUser.avatar &&
        currentUser.avatar.trim() !== "" &&
        currentUser.avatar !== "undefined" &&
        currentUser.avatar !== "null"
      ) {
        newSrc = currentUser.avatar
      } else {
        newSrc = fallbackSrc
      }

      if (currentUser.effectEnabled && currentUser.activeEffect && EFFECT_URLS[currentUser.activeEffect]) {
        newEffectUrl = EFFECT_URLS[currentUser.activeEffect]
      }
    }

    if (!newSrc || newSrc.trim() === "" || newSrc === "undefined" || newSrc === "null") {
      newSrc = fallbackSrc
    }

    setEffectUrl(newEffectUrl)

    if (newSrc !== avatarSrc) {
      if (newSrc.startsWith("data:") || isGifUrl(newSrc)) {
        setIsLoading(true)

        // Create a temporary image to preload
        const tempImg = new window.Image()

        const loadTimeout = setTimeout(() => {
          console.warn("[v0] Avatar loading timeout, falling back to default")
          setAvatarSrc(fallbackSrc)
          setImageError(true)
          setImageKey((prev) => prev + 1)
          setIsLoading(false)
        }, 10000) // 10 second timeout for GIFs

        tempImg.onload = () => {
          clearTimeout(loadTimeout)
          setAvatarSrc(newSrc)
          setImageError(false)
          setImageKey((prev) => prev + 1)
          setIsLoading(false)
          console.log("[v0] Avatar loaded successfully:", newSrc.substring(0, 50) + "...")
        }

        tempImg.onerror = () => {
          clearTimeout(loadTimeout)
          console.error("[v0] Failed to load avatar, falling back to default:", newSrc.substring(0, 50) + "...")
          setAvatarSrc(fallbackSrc)
          setImageError(true)
          setImageKey((prev) => prev + 1)
          setIsLoading(false)
        }

        if (!newSrc.startsWith("data:")) {
          tempImg.crossOrigin = "anonymous"
        }

        tempImg.src = newSrc
      } else {
        // For regular URLs, switch immediately but with better error handling
        setAvatarSrc(newSrc)
        setImageError(false)
        setImageKey((prev) => prev + 1)
        setIsLoading(false)
      }
    }
  }, [users, userId, src, currentUser, fallbackSrc, isGifUrl])

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement

      if (target.src !== fallbackSrc && !imageError) {
        setImageError(true)
        setAvatarSrc(fallbackSrc)
        setImageKey((prev) => prev + 1)
        setIsLoading(false)
      }
    },
    [fallbackSrc, imageError],
  )

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
    setImageError(false)
  }, [])

  const shouldUnoptimize = unoptimized || isGifUrl(avatarSrc || "")

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-800 rounded-full flex items-center justify-center z-10"
          style={{
            width: size,
            height: size,
          }}
        >
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <Image
        src={avatarSrc || fallbackSrc}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover w-full h-full"
        onError={handleImageError}
        onLoad={handleImageLoad}
        unoptimized={shouldUnoptimize}
        key={`avatar-${imageKey}-${avatarSrc?.substring(0, 20) || "fallback"}`} // Better cache busting key
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          opacity: isLoading ? 0.5 : 1,
          transition: "opacity 0.2s ease-in-out",
        }}
        priority={size > 64} // Prioritize larger avatars
        {...(size <= 64 && { loading: shouldUnoptimize ? "eager" : "lazy" })} // Only set loading when not priority
      />
      {effectUrl && (
        <div
          className="absolute inset-0 pointer-events-none rounded-full overflow-hidden"
          style={{
            backgroundImage: `url('${effectUrl}')`,
            backgroundSize: "120% 120%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            mixBlendMode: "screen",
            filter: "brightness(1.4) contrast(1.3) saturate(1.2)",
            zIndex: 5,
            opacity: 0.85,
            transform: "scale(1.1)",
          }}
        />
      )}
    </div>
  )
}
