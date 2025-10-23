"use client"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { FileText, Plus, ExternalLink, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function HallOfRetards() {
  const { user, isSuperAdmin, hallPosts, deleteHallPost } = useAuth()
  const router = useRouter()

  const handleCreatePost = () => {
    router.push("/hall-of-retards/create")
  }

  const handleDeletePost = (postId: string) => {
    deleteHallPost(postId)
    toast.success("Hall post deleted successfully")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 rainbow-text animate-rainbow">HALL OF RETARDS</h1>

        {isSuperAdmin() && (
          <div className="flex justify-end mb-8">
            <Button onClick={handleCreatePost} className="bg-red-900 hover:bg-red-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New Hall Post
            </Button>
          </div>
        )}

        {hallPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hallPosts.map((post) => (
              <div key={post.id} className="bg-black rounded-lg p-6 border-2 border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold rainbow-text animate-rainbow">{post.title}</h2>
                  {isSuperAdmin() && (
                    <Button
                      onClick={() => handleDeletePost(post.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {post.content && <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>}

                {post.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={post.imageUrl || "/placeholder.svg"}
                      alt={post.title}
                      className="max-w-full rounded-lg max-h-96 object-contain"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=500"
                      }}
                    />
                  </div>
                )}

                {post.doxLink && (
                  <div className="mt-4">
                    <Link
                      href={`/paste/${post.doxLink}`}
                      className="flex items-center text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View linked paste
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-medium mb-2">No Hall Posts Yet</h2>
            <p className="text-gray-400">Hall posts will appear here when created by admins.</p>
          </div>
        )}
      </main>
    </div>
  )
}
