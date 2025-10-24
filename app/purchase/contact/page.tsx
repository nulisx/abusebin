"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { NavBar } from "@/components/nav-bar"
import { useAuth, ROLE_COLORS } from "@/lib/auth"
import { TelegramIcon, DiscordIcon } from "@/components/icons"

export default function PurchaseContactPage() {
  const { users } = useAuth()
  const [admins, setAdmins] = useState<any[]>([])

  useEffect(() => {
    const adminUsers = users.filter(
      (user) => user.role === "Admin" && (user.username === "wounds" || user.username === "dismayings"),
    )

    if (adminUsers.length > 0) {
      setAdmins(
        adminUsers.map((user) => ({
          ...user,
          telegramLink: user.username === "wounds" ? "https://t.me/junkjaw" : "https://t.me/unedrable",
        })),
      )
    } else {
      // Fallback if users aren't loaded yet - ensure dismayings is always included
      setAdmins([
        {
          username: "wounds",
          role: "Admin",
          avatar: "public/images/design-mode/ezqzq0.png",
          telegramLink: "https://t.me/junkjaw",
        },
        {
          username: "dismayings",
          role: "Admin",
          avatar: "public/images/design-mode/ezqzq0.png", // Default avatar for dismayings
          telegramLink: "https://t.me/unedrable",
        },
      ])
    }
  }, [users])

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">Contact Us</h1>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {admins.map((admin) => (
            <div
              key={admin.username}
              className="bg-black rounded-lg p-6 flex flex-col items-center gap-4 border border-gray-800"
            >
              <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden">
                <Image
                  src={admin.avatar || "public/images/design-mode/ezqzq0.png"} // Updated to use new default avatar
                  alt={`${admin.username}'s avatar`}
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className={ROLE_COLORS[admin.role as keyof typeof ROLE_COLORS] || "text-white"}>
                    {admin.username}
                  </span>
                  {/* Sparkle effect for Admin role */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                      backgroundImage: "url('public/images/design-mode/vqvalf.gif')", // Updated to use new red sparkle effect
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      mixBlendMode: "screen",
                    }}
                  />
                </div>
                <div className="relative">
                  <span className={`text-sm ${ROLE_COLORS[admin.role as keyof typeof ROLE_COLORS] || "text-gray-300"}`}>
                    {admin.role}
                  </span>
                  {/* Sparkle effect for Admin role badge */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                      backgroundImage: "url('public/images/design-mode/vqvalf.gif')", // Updated to use new red sparkle effect
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      mixBlendMode: "screen",
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-blue-400"
                  onClick={() => window.open("https://t.me/abusebinannc", "_blank")}
                >
                  <TelegramIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-indigo-400"
                  onClick={() => window.open("https://discord.com", "_blank")}
                >
                  <DiscordIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-400">
          <p>Contact either admin to complete your purchase and confirm payment.</p>
          <p>Please have your payment method ready and specify which role you want to purchase.</p>
        </div>
      </main>
    </div>
  )
}
