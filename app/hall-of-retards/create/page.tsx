"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import dynamic from "next/dynamic"
import { toast } from "sonner"

const NavBar = dynamic(() => import("@/components/nav-bar"))
const Button = dynamic(() => import("@/components/ui/button"))
const Input = dynamic(() => import("@/components/ui/input"))
const Textarea = dynamic(() => import("@/components/ui/textarea"))

export default function CreateHallPost() {
  const { user, isSuperAdmin, addHallPost, pastes } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [doxLink, setDoxLink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user || !isSuperAdmin()) router.push("/hall-of-retards")
  }, [user, isSuperAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description) {
      toast.error("Title and description are required")
      return
    }
    setIsSubmitting(true)
    try {
      let validatedDoxLink = doxLink.trim()
      if (validatedDoxLink) {
        const pasteExists = pastes.find(
          (p) => p.id === validatedDoxLink || p.title.toLowerCase() === validatedDoxLink.toLowerCase()
        )
        if (!pasteExists) {
          toast.error("Paste not found. Please enter a valid paste ID or name.")
          setIsSubmitting(false)
          return
        }
        validatedDoxLink = pasteExists.id
      }
      const result = addHallPost(title, description, imageUrl || undefined, validatedDoxLink || undefined)
      if (result.success) {
        toast.success("Hall post created successfully")
        router.push("/hall-of-retards")
      } else toast.error(result.message || "Failed to create hall post")
    } catch {
      toast.error("Failed to create hall post")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => router.push("/hall-of-retards")
  if (!user || !isSuperAdmin()) return null

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 rainbow-text animate-rainbow">
          Create Hall of Retards Post
        </h1>
        <div className="max-w-4xl mx-auto bg-black rounded-lg p-6 border-2 border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium block">Title *</label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" className="bg-black border-gray-700" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium block">Description *</label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" className="bg-black border-gray-700 min-h-[200px]" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-sm font-medium block">Image Link (optional)</label>
              <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Enter image URL" className="bg-black border-gray-700" />
            </div>
            <div className="space-y-2">
              <label htmlFor="doxLink" className="text-sm font-medium block">Dox Link (optional) - Paste ID or Name</label>
              <Input id="doxLink" value={doxLink} onChange={(e) => setDoxLink(e.target.value)} placeholder="Enter paste ID or name" className="bg-black border-gray-700" />
              <p className="text-xs text-gray-400">Enter a paste ID (e.g., "my-paste") or paste title to link to an existing paste</p>
            </div>
            <div className="flex justify-between pt-4">
              <Button type="button" onClick={handleCancel} variant="outline" className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Hall Post"}</Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
