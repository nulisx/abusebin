import { UserDisplay } from "./user-display"
import { RoleBadge } from "./role-badge"
import { UserAvatar } from "./user-avatar"

interface UserProfileHeaderProps {
  user: {
    id: string
    username: string
    role: string
    avatar?: string
    joinedAt: Date
    nameColor?: string
  }
  isOnline?: boolean
}

export function UserProfileHeader({ user, isOnline = false }: UserProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <UserAvatar src={user.avatar} alt={`${user.username}'s avatar`} size={80} userId={user.id} />
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-black"></span>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <UserDisplay username={user.username} role={user.role} nameColor={user.nameColor} className="text-2xl" />
          <RoleBadge role={user.role} />
        </div>
        <p className="text-sm text-gray-400">
          Joined {new Date(user.joinedAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
        </p>
      </div>
    </div>
  )
}
