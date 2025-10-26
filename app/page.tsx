"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NavBar } from "@/components/nav-bar"
import { useAuth } from "@/lib/auth"
import { Pin, ChevronLeft, ChevronRight } from "lucide-react"
import { UserDisplay } from "@/components/user-display"
import { RoleBadge } from "@/components/role-badge"
import { useSearchParams } from "next/navigation"

export default function HomePage() {
  const { pastes, users } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [highlightedPasteId, setHighlightedPasteId] = useState<string | null>(null)
  const pastesPerPage = 100
  const searchParams = useSearchParams()

  useEffect(() => {
    const highlight = searchParams.get("highlight")
    if (highlight) {
      setHighlightedPasteId(highlight)
      // Remove highlight after 5 seconds
      const timer = setTimeout(() => {
        setHighlightedPasteId(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const overallSyncStatus = "connected" // This should come from your real-time sync system

  const filteredPastes = searchQuery.trim()
    ? pastes.filter(
        (paste) =>
          paste.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paste.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : pastes

  // When searching, show only searched results + pinned pastes
  const displayPastes = searchQuery.trim()
    ? [...pastes.filter((paste) => paste.isPinned), ...filteredPastes.filter((paste) => !paste.isPinned)]
    : filteredPastes

  // Pagination logic
  const totalPages = Math.ceil(displayPastes.length / pastesPerPage)
  const startIndex = (currentPage - 1) * pastesPerPage
  const endIndex = startIndex + pastesPerPage
  const paginatedPastes = displayPastes.slice(startIndex, endIndex)

  // Separate pinned and unpinned from paginated results
  const pinnedPastes = paginatedPastes
    .filter((paste) => paste.isPinned)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const unpinnedPastes = paginatedPastes
    .filter((paste) => !paste.isPinned)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getAuthor = (authorId: string) => {
    return users.find((u) => u.id === authorId)
  }

  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const isPasteHighlighted = (pasteId: string) => {
    return highlightedPasteId === pasteId
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="mb-6 flex flex-col items-center">
          <Image
            src="/images/abusebin-logo.png"
            width={150}
            height={150}
            className="object-contain mb-4"
            alt="Abusebin Logo"
          />

          <Link href="/medias" className="text-blue-500 hover:text-blue-400 text-lg mb-2">
            Official Abuse.bin Social Medias
          </Link>

          {overallSyncStatus === "connected" && <div className="text-green-500 text-sm">Real-time updates active</div>}
        </div>

        {/* Search Section */}
        <div className="w-full max-w-sm mb-12">
          <h2 className="text-lg mb-3 text-center">Search for a paste</h2>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
            <Button onClick={handleSearch} className="bg-black hover:bg-gray-800 text-white">
              Search
            </Button>
          </div>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Showing {paginatedPastes.length} (of {displayPastes.length} total) pastes
            {totalPages > 1 && ` - Page ${currentPage} of ${totalPages}`}
          </p>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 mb-8">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="bg-black border-gray-600 text-white hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i

                if (pageNum < 1 || pageNum > totalPages) return null

                return (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className={
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "bg-black border-gray-600 text-white hover:bg-gray-800"
                    }
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="bg-black border-gray-600 text-white hover:bg-gray-800"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Pinned Pastes Table */}
        {pinnedPastes.length > 0 && (
          <div className="w-full max-w-6xl mb-12">
            <h2 className="text-xl mb-4">Pinned Pastes</h2>
            <div className="bg-black rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-700 font-semibold">
                <div>Title</div>
                <div>Comments</div>
                <div>Views</div>
                <div>Created by</div>
                <div>Added</div>
              </div>
              {pinnedPastes.map((paste) => {
                const author = getAuthor(paste.authorId)
                const isHighlighted = isPasteHighlighted(paste.id)
                return (
                  <Link
                    key={paste.id}
                    href={`/paste/${paste.id}`}
                    className={`grid grid-cols-5 gap-4 p-4 border-b border-gray-800 hover:bg-gray-800 ${
                      isHighlighted ? "bg-gray-900/50 border-gray-600/50" : ""
                    }`}
                  >
                    <div className="flex items-center text-white hover:text-gray-300 cursor-pointer">
                      {paste.isPinned && <Pin className="w-4 h-4 mr-1 text-yellow-500" />}
                      <span className="text-sm">{paste.title}</span>
                    </div>
                    <div>{paste.comments.length}</div>
                    <div>{paste.views}</div>
                    <div className="flex items-center gap-2">
                      {author && (
                        <>
                          <UserDisplay
                            username={author.username}
                            role={author.role}
                            nameColor={author.nameColor}
                            className="text-sm"
                          />
                          <RoleBadge role={author.role} className="text-xs" />
                        </>
                      )}
                    </div>
                    <div>{new Date(paste.createdAt).toLocaleDateString()}</div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Pastes Section - Always show title */}
        <div className="w-full max-w-6xl">
          <h2 className="text-xl mb-4">{searchQuery.trim() ? "Search Results" : "Recent Pastes"}</h2>

          {unpinnedPastes.length > 0 ? (
            <div className="bg-black rounded-lg overflow-hidden">
              <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-700 font-semibold">
                <div>Title</div>
                <div>Comments</div>
                <div>Views</div>
                <div>Created by</div>
                <div>Added</div>
              </div>
              {unpinnedPastes.map((paste) => {
                const author = getAuthor(paste.authorId)
                const isHighlighted = isPasteHighlighted(paste.id)
                return (
                  <Link
                    key={paste.id}
                    href={`/paste/${paste.id}`}
                    className={`grid grid-cols-5 gap-4 p-4 border-b border-gray-800 hover:bg-gray-800 ${
                      isHighlighted ? "bg-gray-900/50 border-gray-600/50" : ""
                    }`}
                  >
                    <div className="flex items-center text-white hover:text-gray-300 cursor-pointer">
                      <span className="text-sm">{paste.title}</span>
                    </div>
                    <div>{paste.comments.length}</div>
                    <div>{paste.views}</div>
                    <div className="flex items-center gap-2">
                      {author && (
                        <>
                          <UserDisplay
                            username={author.username}
                            role={author.role}
                            nameColor={author.nameColor}
                            className="text-sm"
                          />
                          <RoleBadge role={author.role} className="text-xs" />
                        </>
                      )}
                    </div>
                    <div>{new Date(paste.createdAt).toLocaleDateString()}</div>
                  </Link>
                )
              })}
            </div>
          ) : (
            /* Show empty state message when no unpinned pastes */
            <div className="bg-black rounded-lg p-8 text-center">
              <p className="text-gray-500 text-lg">
                {searchQuery.trim() ? "No pastes found matching your search." : "No recent pastes to display"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
