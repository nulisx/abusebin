"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { UserDisplay } from "@/components/user-display"
import { LoadingScreen } from "@/components/loading-screen"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RoleBadge } from "@/components/role-badge"
import { toast } from "sonner"

export default function BannedUsersPage() {
  const router = useRouter()
  const { users, isSuperAdmin, unbanUser, deleteUserAccountAdmin } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSuperAdmin()) {
      router.push("/")
    } else {
      const timer = setTimeout(() => setLoading(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isSuperAdmin, router])

  if (loading) {
    return <LoadingScreen />
  }

  const bannedUsers = users.filter((user) => user.banned)

  const handleUnban = (userId: string) => {
    unbanUser(userId)
    toast.success("User unbanned successfully")
  }

  const handleDelete = (userId: string) => {
    deleteUserAccountAdmin(userId)
    toast.success("User account permanently deleted.")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <main className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Banned Users</h1>

        {bannedUsers.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No banned users found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">Username</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Reason</TableHead>
                <TableHead className="text-gray-400">Joined Date</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bannedUsers.map((user) => (
                <TableRow key={user.id} className="border-gray-800">
                  <TableCell>
                    <Link href={"/profile/" + user.username} className="hover:opacity-80 flex items-center gap-2">
                      <UserDisplay username={user.username} role={user.role} />
                      <RoleBadge role={user.role} className="text-xs" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-red-500">Banned</span>
                  </TableCell>
                  <TableCell>{user.banReason || "N/A"}</TableCell>
                  <TableCell>{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      onClick={() => handleUnban(user.id)}
                      size="sm"
                      className="bg-black hover:bg-gray-800 text-white border border-gray-600"
                    >
                      Unban
                    </Button>
                    <Button onClick={() => handleDelete(user.id)} variant="destructive" size="sm">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  )
}
