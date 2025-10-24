"use client"

import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ROLE_COLORS } from "@/lib/auth"
import { TelegramIcon, DiscordIcon } from "@/components/icons"

export default function ContactPage() {
  // Mock admin data for display - replaced ic3 with bribe
  const admins = [
    {
      username: "wounds",
      role: "Admin",
      avatar: "ezqzq0.jpg", // Updated to use new wounds avatar
      telegramLink: "https://t.me/junkjaw",
    },
{
      username: "wounds",
      role: "Admin",
      avatar: "ezqzq0.jpg", // Updated to use new wounds avatar
      telegramLink: "https://t.me/junkjaw",
    },
    {
      username: "dismayings",
      role: "Admin",
      avatar: "ezqzq0.png", // Default avatar for dismayings
      telegramLink: "https://t.me/unedrable", // Updated telegram link
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <div className="container mx-auto px-4 py-16">
        {/* Follow Us Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-8">Follow Us</h1>
          <div className="flex justify-center space-x-4">
            <Button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3">
              <TelegramIcon className="w-5 h-5 mr-2" /> Telegram
            </Button>
            <Button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3">
              <DiscordIcon className="w-5 h-5 mr-2" /> Discord
            </Button>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="text-center">
          <h2 className="text-5xl font-bold mb-12">Contact Us</h2>

          <div className="flex justify-center space-x-8 max-w-4xl mx-auto">
            {admins.map((admin) => (
              <div key={admin.username} className="bg-gray-900 rounded-lg p-8 flex-1">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gray-700">
                  <Image
                    src={admin.avatar || "/default-avatar.png"} // Updated to use new default avatar
                    alt={`${admin.username} avatar`}
                    width={96}
                    height={96}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="text-center mb-4">
                  <div className={`text-xl font-bold ${ROLE_COLORS.Admin} glowing-red-text`}>
                    {admin.username} {admin.role}
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button
                    size="sm"
                    className="bg-gray-700 hover:bg-gray-600"
                    onClick={() => window.open("https://t.me/abusebinannc", "_blank")}
                  >
                    <TelegramIcon className="w-5 h-5" />
                  </Button>
                  <Button size="sm" className="bg-gray-700 hover:bg-gray-600">
                    <DiscordIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .glowing-red-text {
          text-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 15px #ff0000;
        }
      `}</style>
    </div>
  )
}
