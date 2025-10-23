"use client"

import Image from "next/image"
import Link from "next/link"
import { useAuth, ROLE_COLORS } from "@/lib/auth"
import { UserMenu } from "./user-menu"

export function Navigation() {
  const { user, isAuthenticated } = useAuth()

  return (
    <nav className="flex items-center justify-between p-4 border-b border-gray-800">
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80">
        <Image src="/images/abusebin-logo.png" alt="Abusebin" width={32} height={32} className="object-contain" />
        <div className="text-white text-xl font-bold">abuse.bin</div>
      </Link>
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-gray-300 hover:text-white">
          Home
        </Link>
        <Link href="/add-paste" className="text-gray-300 hover:text-white">
          Add Paste
        </Link>
        <Link href="/hall-of-retards" className="text-gray-300 hover:text-white">
          Hall of Retards
        </Link>
        <Link href="/upgrades" className="text-gray-300 hover:text-white">
          Upgrades
        </Link>
        <Link href="/tos" className="text-gray-300 hover:text-white">
          TOS
        </Link>
        <Link href="/users" className="text-gray-300 hover:text-white">
          Users
        </Link>
        <Link href="/medias" className="text-gray-300 hover:text-white">
          Medias
        </Link>

        {isAuthenticated && user ? (
          <UserMenu>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  <Image
                    src={user.avatar || "https://files.catbox.moe/ezqzq0.png"}
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <span className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || "text-white"}>
                  {user.username}
                </span>
                <span className={`text-sm ${ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || "text-gray-300"}`}>
                  {user.role}
                </span>
              </div>
            </div>
          </UserMenu>
        ) : (
          <>
            <Link href="/login" className="text-gray-300 hover:text-white">
              Login
            </Link>
            <Link href="/register" className="text-gray-300 hover:text-white">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
