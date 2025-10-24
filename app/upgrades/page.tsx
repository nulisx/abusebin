"use client"

import type React from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavBar } from "@/components/nav-bar"
import { useAuth, ROLE_COLORS, hasEffectAccess, EFFECT_URLS } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, useEffect } from "react"

export default function PricingPage() {
  const { user, setActiveEffect, toggleEffectEnabled } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(user ? user.username : "Anonymous")
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewEffect, setPreviewEffect] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setDisplayName(user.username)
    } else {
      setDisplayName("Anonymous")
    }
  }, [user])

  const handlePurchase = (role: string) => {
    if (!user) {
      router.push("/register")
      return
    }

    if (role === "effects_perm") {
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        toast.success(
          "Your effects permission request has been submitted. You will be contacted shortly for payment confirmation.",
        )
        router.push("/purchase/contact")
      }, 1000)
      return
    }

    if (user.role === role) {
      toast.error(`You already own the ${role} role!`)
      return
    }

    setIsProcessing(true)

    setTimeout(() => {
      setIsProcessing(false)

      toast.success(
        `Your ${role} upgrade request has been submitted. You will be contacted shortly for payment confirmation.`,
      )
      router.push("/purchase/contact")
    }, 1000)
  }

  const ownsRole = (role: string) => {
    return user?.role === role
  }

  const handleEffectClick = (effectName: string) => {
    setPreviewEffect(effectName)

    // If user has effect permissions, also save the effect
    if (user && hasEffectAccess(user)) {
      setActiveEffect(effectName)
      if (!user.effectEnabled) {
        toggleEffectEnabled()
      }
      toast.success(
        `Effect "${effectName
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")}" activated!`,
      )
    }
  }

  const RolePreview = ({ role, name }: { role: string; name: string }) => {
    const getSparkleEffect = (role: string) => {
      // Show preview effect on Criminal, Rich, and Kitty when an effect is clicked
      if (previewEffect && (role === "Criminal" || role === "Rich" || role === "Kitty")) {
        return EFFECT_URLS[previewEffect] || null
      }

      // Default role effects (when no preview is active)
      switch (role) {
        case "Admin":
          return "public/images/design-mode/public/images/design-mode/vqvalf.gif"
        case "Manager":
          return "public/images/design-mode/public/images/design-mode/p9n473.gif"
        case "Rich":
          return "public/images/design-mode/public/images/design-mode/2qqmwy.gif"
        case "Kitty":
          return "public/images/design-mode/public/images/design-mode/kzzl7i.gif"
        case "Criminal":
          return ""
        case "User":
          return null
        default:
          return null
      }
    }

    const sparkleGif = getSparkleEffect(role)

    return (
      <div className="flex items-center gap-2 text-lg">
        <div className="relative">
          <span className={`${ROLE_COLORS[role as keyof typeof ROLE_COLORS]} font-medium`}>{name}</span>
          {sparkleGif && (
            <div
              className="absolute inset-0 pointer-events-none opacity-50"
              style={{
                backgroundImage: `url('${sparkleGif}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mixBlendMode: "screen",
              }}
            />
          )}
        </div>
        <div className="relative">
          <span className={`text-sm ${ROLE_COLORS[role as keyof typeof ROLE_COLORS] || "text-gray-300"}`}>
            [{role}]
          </span>
          {sparkleGif && (
            <div
              className="absolute inset-0 pointer-events-none opacity-50"
              style={{
                backgroundImage: `url('${sparkleGif}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mixBlendMode: "screen",
              }}
            />
          )}
        </div>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mb-8"></div>
          <h2 className="text-2xl font-bold mb-4">Processing Payment</h2>
          <p className="text-gray-400">Please wait while we process your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
        <p className="mb-2">
          Upgrades are automatically applied after 1 network confirmation. If your upgrade is not applied within 20
          minutes of the first confirmation, message us on Telegram with the TXID of the payment.
        </p>
        <p>
          Purchases are final and non-refundable and cannot be transferred. Yes, we do accept All payments. Major
          violations of TOS will result in account deletion - whether you have a rank or not. All questions regarding
          upgrades, or to purchase with other crypto, contact{" "}
          <a
            href="https://t.me/junkjaw"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @junkjaw
          </a>{" "}
          or{" "}
          <a
            href="https://t.me/unedrable"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @unedrable
          </a>{" "}
          on Telegram.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 rounded-lg p-6 border-2 border-red-900">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#991b1b" }}>
                Criminal
              </h2>
              <div className="mb-2">
                <RolePreview role="Criminal" name={displayName} />
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <h3 className="font-semibold">PERKS</h3>
              <PerkItem check>More noticeable</PerkItem>
              <PerkItem check>Instant paste edits</PerkItem>
              <PerkItem>Remove your own pastes</PerkItem>
              <PerkItem>Change your Namecolor</PerkItem>
              <PerkItem>Bypass Paste creation cooldown</PerkItem>
              <PerkItem>Unlist your own paste</PerkItem>
              <PerkItem>Password protect your own paste</PerkItem>
              <PerkItem>more features in future</PerkItem>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-bold text-green-500">$15</p>
              {ownsRole("Criminal") ? (
                <Button className="w-full" style={{ backgroundColor: "#4b5563", color: "white" }} disabled>
                  Already owned
                </Button>
              ) : (
                <Button
                  className="w-full"
                  style={{ backgroundColor: "#991b1b", color: "white" }}
                  onClick={() => handlePurchase("Criminal")}
                >
                  {user ? "Purchase" : "Sign in to purchase"}
                </Button>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-6 border-2 border-yellow-500">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#facc15" }}>
                Rich
              </h2>
              <div className="mb-2">
                <RolePreview role="Rich" name={displayName} />
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <h3 className="font-semibold">PERKS</h3>
              <PerkItem check>More noticeable</PerkItem>
              <PerkItem check>Instant paste edits</PerkItem>
              <PerkItem check>Remove your own pastes</PerkItem>
              <PerkItem check>Change your Namecolor</PerkItem>
              <PerkItem check>Bypass Paste creation cooldown</PerkItem>
              <PerkItem check>Unlist your own paste</PerkItem>
              <PerkItem check>Password protect your own paste</PerkItem>
              <PerkItem>more features in future</PerkItem>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-bold text-green-500">$35</p>
              {ownsRole("Rich") ? (
                <Button className="w-full" style={{ backgroundColor: "#4b5563", color: "white" }} disabled>
                  Already owned
                </Button>
              ) : (
                <Button
                  className="w-full"
                  style={{ backgroundColor: "#facc15", color: "black" }}
                  onClick={() => handlePurchase("Rich")}
                >
                  {user ? "Purchase" : "Sign in to purchase"}
                </Button>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-6 border-2 border-pink-500">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#f472b6" }}>
                Kitty
              </h2>
              <div className="mb-2">
                <RolePreview role="Kitty" name={displayName} />
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <h3 className="font-semibold">PERKS</h3>
              <PerkItem check>More noticeable</PerkItem>
              <PerkItem check>Instant paste edits</PerkItem>
              <PerkItem check>Remove your own pastes</PerkItem>
              <PerkItem check>Change your Namecolor</PerkItem>
              <PerkItem check>Bypass Paste creation cooldown</PerkItem>
              <PerkItem check>Unlist your own paste</PerkItem>
              <PerkItem check>Password protect your own paste</PerkItem>
              <PerkItem check>more features in future</PerkItem>
            </div>
            <div className="space-y-4">
              <p className="text-2xl font-bold text-green-500">$50</p>
              {ownsRole("Kitty") ? (
                <Button className="w-full" style={{ backgroundColor: "#4b5563", color: "white" }} disabled>
                  Already owned
                </Button>
              ) : (
                <Button
                  className="w-full"
                  style={{ backgroundColor: "#f472b6", color: "white" }}
                  onClick={() => handlePurchase("Kitty")}
                >
                  {user ? "Purchase" : "Sign in to purchase"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto mt-12">
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h2 className="text-2xl font-bold mb-4 text-white">Buy More Effects</h2>
            <p className="text-gray-400 mb-6">
              {user && hasEffectAccess(user)
                ? "Click on an effect to activate it."
                : "Purchase effects to customize your profile."}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(EFFECT_URLS).map(([effectName, effectUrl]) => {
                const isActive = user?.activeEffect === effectName
                const canUse = user && hasEffectAccess(user)

                return (
                  <button
                    key={effectName}
                    onClick={() => handleEffectClick(effectName)}
                    className={`bg-black rounded-lg p-4 border ${
                      isActive
                        ? "border-blue-500 ring-2 ring-blue-500"
                        : "border-zinc-800 hover:border-zinc-600 cursor-pointer"
                    } flex flex-col items-center justify-center h-32 relative overflow-hidden transition-all`}
                  >
                    <img
                      src={effectUrl || "/placeholder.svg"}
                      alt={effectName}
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    {isActive && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
                        Active
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="space-y-4">
              <p className="text-2xl font-bold text-green-500">$10</p>
              {user && hasEffectAccess(user) ? (
                <Button className="w-full" style={{ backgroundColor: "#4b5563", color: "white" }} disabled>
                  Already owned
                </Button>
              ) : (
                <Button
                  className="w-full"
                  style={{ backgroundColor: "#3B82F6", color: "white" }}
                  onClick={() => handlePurchase("effects_perm")}
                >
                  {user ? "Purchase" : "Sign in to purchase"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PerkItem({ children, check = false }: { children: React.ReactNode; check?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {check ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
      <span className="text-gray-300">{children}</span>
    </div>
  )
}
