"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  children: React.ReactNode
}

export function UserMenu({ children }: UserMenuProps) {
  const { user, logout, isSuperAdmin } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return <>{children}</>

  const isAdmin = ["wounds", "ic3"].includes(user.username)

  const handleProfileClick = () => {
    router.push(`/profile/${user.username}`)
    setIsOpen(false)
  }

  const handleCustomizeClick = () => {
    router.push("/profile/customize")
    setIsOpen(false)
  }

  const handleBannedPeopleClick = () => {
    router.push("/admin/banned")
    setIsOpen(false)
  }

  const handleGrantRolesClick = () => {
    router.push("/admin/roles")
    setIsOpen(false)
  }

  const handleEffectPermsClick = () => {
    router.push("/admin/effect-perms")
    setIsOpen(false)
  }
  // </CHANGE>

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">{children}</div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black border-gray-700">
        {isSuperAdmin() && (
          <>
            <DropdownMenuItem onClick={handleBannedPeopleClick} className="text-white hover:bg-gray-800">
              Check banned people
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleGrantRolesClick} className="text-white hover:bg-gray-800">
              Grant roles to other people
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEffectPermsClick} className="text-white hover:bg-gray-800">
              Give Effect perms
            </DropdownMenuItem>
            {/* </CHANGE> */}
          </>
        )}
        <DropdownMenuItem onClick={handleProfileClick} className="text-white hover:bg-gray-800">
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCustomizeClick} className="text-white hover:bg-gray-800">
          Customize profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-white hover:bg-gray-800">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
