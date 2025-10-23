"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  className?: string
  showIcon?: boolean
}

export function LogoutButton({ className, showIcon = false }: LogoutButtonProps) {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <Button onClick={handleLogout} className={className}>
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      Logout
    </Button>
  )
}
