"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { UserDisplay } from "@/components/user-display"
import Layout from "@/components/layout"
import { TelegramIcon, DiscordIcon } from "@/components/icons"
import { RoleBadge } from "@/components/role-badge"
import { useAuth } from "@/lib/auth"

export default function ContactPage() {
  const { users } = useAuth()

  const admins = [
    {
      username: "wounds",
      role: "Admin" as const,
      telegramLink: "https://t.me/junkjaw",
    },
    {
      username: "dismayings",
      role: "Admin" as const,
      telegramLink: "https://t.me/unedrable",
    },
  ]

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-8">Follow Us</h1>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className="bg-[#0088cc] hover:bg-[#0088cc]/90 text-white border-0 gap-2"
              onClick={() => window.open("https://t.me/abusebinannc", "_blank")}
            >
              <TelegramIcon className="w-5 h-5" />
              Telegram
            </Button>
            <Button
              variant="outline"
              className="bg-[#5865F2] hover:bg-[#5865F2]/90 text-white border-0 gap-2"
              onClick={() => window.open("https://discord.com", "_blank")}
            >
              <DiscordIcon className="w-5 h-5" />
              Discord
            </Button>
          </div>
        </section>
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-8">Contact Us</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {admins.map((admin) => {
              const userData = users.find((u) => u.username === admin.username)

              return (
                <div key={admin.username} className="bg-zinc-900/50 rounded-lg p-6 flex flex-col items-center gap-4">
                  <Image
                    src={userData?.avatar || "/images/design-mode/a9q5s0.png"}
                    alt={`${admin.username}'s avatar`}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                  <div className="flex items-center gap-2">
                    <UserDisplay username={admin.username} role={admin.role} nameColor={userData?.nameColor} />
                    <RoleBadge role={admin.role} />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-[#0088cc]"
                      onClick={() => window.open(admin.telegramLink, "_blank")}
                    >
                      <TelegramIcon className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-[#5865F2]"
                      onClick={() => window.open("https://discord.com", "_blank")}
                    >
                      <DiscordIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </Layout>
  )
}
