import { ROLE_COLORS, EFFECT_URLS, hasEffectAccess, type User } from "@/lib/auth"

interface UserDisplayProps {
  username: string
  role: string
  className?: string
  nameColor?: string
  activeEffect?: string | null
  effectEnabled?: boolean
  user?: User
}

export function UserDisplay({
  username,
  role,
  className,
  nameColor,
  activeEffect,
  effectEnabled,
  user,
}: UserDisplayProps) {
  // For User role: use custom nameColor if provided, otherwise use default grey
  // For eligible roles (excluding Admin, Council, Rich): use custom nameColor if provided, otherwise use role color
  // For Admin, Council, Rich: ALWAYS use role colors (no customization allowed)
  const canCustomizeName = !["Admin", "Council", "Rich"].includes(role)

  const displayColor =
    canCustomizeName && nameColor ? nameColor : ROLE_COLORS[role as keyof typeof ROLE_COLORS] || ROLE_COLORS.User

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

  const shouldShowCustomEffect = user
    ? hasEffectAccess(user) && effectEnabled && activeEffect
    : effectEnabled && activeEffect
  const sparkleGif =
    shouldShowCustomEffect && activeEffect && EFFECT_URLS[activeEffect]
      ? EFFECT_URLS[activeEffect]
      : getSparkleEffect(role)

  const getColorValue = (colorClass: string) => {
    const colorMap: { [key: string]: string } = {
      "text-red-500": "#ef4444", // Admin - Red
      "text-purple-500": "#a855f7", // Manager - Purple
      "text-green-400": "#4ade80", // Mod - Bright Green
      "text-purple-600": "#9333ea", // Judicial - RebeccaPurple
      "text-blue-500": "#3b82f6", // Helper - Blue
      "text-gray-500": "#6b7280", // Corrupt - Grey
      "text-blue-900": "#1e3a8a", // Clique - Dark Blue
      "text-yellow-400": "#facc15", // Rich - Gold
      "text-pink-400": "#f472b6", // Kitty - Pink
      "text-red-800": "#991b1b", // Criminal - Dark Red
      "text-cyan-600": "#0891b2", // Sloth - Dark Turquoise
      "text-gray-300": "#d1d5db", // User - Default grey
    }
    return colorMap[colorClass] || "#d1d5db"
  }

  // Special handling for Council rainbow text
  if (role === "Council") {
    return (
      <div className={`relative inline-block ${className}`}>
        <span className="rainbow-text font-medium">{username}</span>
        {sparkleGif && (
          <div
            className="absolute inset-0 pointer-events-none rounded overflow-hidden"
            style={{
              backgroundImage: `url('${sparkleGif}')`,
              backgroundSize: "150% 150%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              mixBlendMode: "screen",
              filter: "brightness(1.8) contrast(1.5) saturate(1.5) drop-shadow(0 0 8px rgba(255,255,255,0.6))",
              zIndex: 5,
              opacity: 1,
              transform: "scale(1.2)",
              animation: "sparkle-pulse 2s ease-in-out infinite",
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className="font-medium relative z-10"
        style={{
          color: canCustomizeName && nameColor ? nameColor : getColorValue(displayColor),
        }}
      >
        {username}
      </span>

      {sparkleGif && (
        <div
          className="absolute inset-0 pointer-events-none rounded overflow-hidden"
          style={{
            backgroundImage: `url('${sparkleGif}')`,
            backgroundSize: "150% 150%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            mixBlendMode: "screen",
            filter: "brightness(1.8) contrast(1.5) saturate(1.5) drop-shadow(0 0 8px rgba(255,255,255,0.6))",
            zIndex: 5,
            opacity: 1,
            transform: "scale(1.2)",
            animation: "sparkle-pulse 2s ease-in-out infinite",
          }}
        />
      )}
    </div>
  )
}
