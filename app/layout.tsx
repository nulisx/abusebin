import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "abuse.bin",
  description: "",
  generator: "Abuse.bin",
  icons: {
    icon: "./public/images/design-mode/a9q5s0.png", // 👈 tab icon (favicon)
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#000000",
              border: "1px solid #374151",
              color: "#ffffff",
              fontSize: "16px",
              padding: "16px",
              minWidth: "300px",
            },
          }}
        />
      </body>
    </html>
  )
}
