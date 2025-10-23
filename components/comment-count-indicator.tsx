import { MessageCircle } from "lucide-react"

interface CommentCountIndicatorProps {
  pasteId: string
  initialCount: number
}

export function CommentCountIndicator({ pasteId, initialCount }: CommentCountIndicatorProps) {
  // In a real application, you would fetch the live comment count here
  // For now, we'll just use the initialCount or a mock value
  const commentCount = initialCount // Or fetch from a real API

  return (
    <span className="flex items-center gap-1">
      <MessageCircle className="w-3 h-3" />
      {commentCount}
    </span>
  )
}
