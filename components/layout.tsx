"use client"

import type React from "react"
import { NavBar } from "./nav-bar"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      {children}
    </div>
  )
}
