import { ROLE_COLORS, getDisplayRole, type User, EFFECT_URLS, hasEffectAccess } from "@/lib/auth"

interface RoleBadgeProps {
  role: string
  user?: User
  className?: string
}

export function RoleBadge({ role, user, className }: RoleBadgeProps) {
  const displayRole = user ? getDisplayRole(user) : role

  const getSparkleEffect = (role: string) => {
    switch (role) {
      case "Admin":
        return "https://files.catbox.moe/vqvalf.gif"
      case "Manager":
        return "https://files.catbox.moe/p9n473.gif"
      case "Rich":
        return "https://files.catbox.moe/2qqmwy.gif"
      case "Kitty":
        return "https://files.catbox.moe/kzzl7i.gif"
      default:
        return null
    }
  }

  const shouldShowCustomEffect = user ? hasEffectAccess(user) && user.effectEnabled && user.activeEffect : false
  const sparkleGif =
    shouldShowCustomEffect && user?.activeEffect && EFFECT_URLS[user.activeEffect]
      ? EFFECT_URLS[user.activeEffect]
      : getSparkleEffect(displayRole)

  // Special handling for Council rainbow text
  if (displayRole === "Council") {
    return (
      <div className={`relative inline-block ${className}`}>
        <span className="px-1 py-0 rounded-full text-sm font-medium rainbow-text">[{displayRole}]</span>
        {sparkleGif && (
          <div
            className="absolute inset-0 pointer-events-none opacity-100"
            style={{
              backgroundImage: `url('${sparkleGif}')`,
              backgroundSize: "150% 150%",
              backgroundPosition: "center",
              mixBlendMode: "screen",
              filter: "brightness(1.8) contrast(1.5) saturate(1.5) drop-shadow(0 0 8px rgba(255,255,255,0.6))",
              transform: "scale(1.2)",
            }}
          />
        )}
      </div>
    )
  }

  const roleColor = ROLE_COLORS[displayRole as keyof typeof ROLE_COLORS] || "text-gray-300"

  return (
    <div className={`relative inline-block ${className}`}>
      <span className={`px-1 py-0 rounded-full text-sm font-medium ${roleColor} relative z-10`}>[{displayRole}]</span>
      {sparkleGif && (
        <div
          className="absolute inset-0 pointer-events-none opacity-100"
          style={{
            backgroundImage: `url('${sparkleGif}')`,
            backgroundSize: "150% 150%",
            backgroundPosition: "center",
            mixBlendMode: "screen",
            filter: "brightness(1.8) contrast(1.5) saturate(1.5) drop-shadow(0 0 8px rgba(255,255,255,0.6))",
            transform: "scale(1.2)",
          }}
        />
      )}
    </div>
  )
}
