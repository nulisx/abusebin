"use client"

import Link from "next/link"
import { useAuth, ROLE_COLORS, EFFECT_URLS, hasEffectAccess } from "@/lib/auth"
import { UserMenu } from "./user-menu"
import { UserAvatar } from "./user-avatar"
import Image from "next/image"

export function NavBar() {
  const { user, isAuthenticated } = useAuth()

  // Define sparkle effects for different roles
  const getSparkleEffect = (role: string) => {
    switch (role) {
      case "Admin":
        return "https://files.catbox.moe/vqvalf.gif"
      case "Manager":
        return "https://files.catbox.moe/p9n473.gif"
      case "Rich":
        return "https://files.catbox.moe/2qqmwy.gif"
      case "Kitty":
        return "https://files.catbox.moe/kzzl7i.gif"
      default:
        return null
    }
  }

  const sparkleGif = user
    ? hasEffectAccess(user) && user.effectEnabled && user.activeEffect && EFFECT_URLS[user.activeEffect]
      ? EFFECT_URLS[user.activeEffect]
      : getSparkleEffect(user.role)
    : null

  return (
    <nav className="flex items-center justify-between p-4 border-b border-black">
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80">
        <Image src="/images/abusebin-logo.png" alt="abuse.bin logo" width={32} height={32} className="object-contain" />
        <div className="text-white text-xl font-bold">abuse.bin</div>
      </Link>
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-white hover:text-gray-300">
          Home
        </Link>
        <Link href="/add-paste" className="text-white hover:text-gray-300">
          Add Paste
        </Link>
        <Link href="/hall-of-retards" className="text-white hover:text-gray-300">
          Hall of Retards
        </Link>
        <Link href="/upgrades" className="text-white hover:text-gray-300">
          Upgrades
        </Link>
        <Link href="/tos" className="text-white hover:text-gray-300">
          TOS
        </Link>
        <Link href="/users" className="text-white hover:text-gray-300">
          Users
        </Link>
        <Link href="/medias" className="text-white hover:text-gray-300">
          Medias
        </Link>

        {isAuthenticated && user ? (
          <UserMenu>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <UserAvatar
                    src={user.avatar || "https://files.catbox.moe/ezqzq0.png"}
                    alt="Avatar"
                    size={32}
                    userId={user.id}
                    fallbacksrc="/images/design-mode/ezqzq0.png"
                  />
                </div>
                <div className="relative">
                  <span
                    className="font-medium"
                    style={{
                      color:
                        user.role === "User" && user.nameColor
                          ? user.nameColor
                          : user.role === "Council"
                            ? undefined
                            : ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]
                              ? (() => {
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
                                  return colorMap[ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]] || "#d1d5db"
                                })()
                              : "#d1d5db",
                    }}
                    className={user.role === "Council" ? "rainbow-text" : ""}
                  >
                    {user.username}
                  </span>
                  {sparkleGif && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-70"
                      style={{
                        backgroundImage: `url('${sparkleGif}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        mixBlendMode: "screen",
                        filter: "brightness(1.2) contrast(1.1)",
                      }}
                    />
                  )}
                </div>
                <div className="relative flex items-center">
                  <span
                    className="text-base"
                    style={{
                      color:
                        user.role === "Council"
                          ? undefined
                          : ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]
                            ? (() => {
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
                                return colorMap[ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]] || "#d1d5db"
                              })()
                            : "#d1d5db",
                    }}
                    className={user.role === "Council" ? "rainbow-text" : ""}
                  >
                    [{user.role}]
                  </span>
                  {sparkleGif && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-70"
                      style={{
                        backgroundImage: `url('${sparkleGif}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        mixBlendMode: "screen",
                        filter: "brightness(1.2) contrast(1.1)",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </UserMenu>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-white hover:text-gray-300">
              Login
            </Link>
            <Link href="/register" className="text-white hover:text-gray-300">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavBar
