"use client"

import type React from "react"

interface ProfileInfoBarProps {
  uid?: number // Made UID optional to handle cases where it might be undefined
  pasteCount: number
  totalLikes: number
  createdAt: Date
}

export const ProfileInfoBar: React.FC<ProfileInfoBarProps> = ({ uid, pasteCount, totalLikes, createdAt }) => {
  return (
    <div className="bg-black rounded-lg border border-gray-800 p-4 mb-6">
      <h3 className="text-white text-lg font-semibold mb-3 border-b border-gray-800 pb-2">Info</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
          <span className="text-white text-sm">UID</span>
          <span className="text-white text-sm font-mono">{uid !== undefined ? uid : "N/A"}</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
          <span className="text-white text-sm">Pastes</span>
          <span className="text-white text-sm font-mono">{pasteCount}</span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
          <span className="text-white text-sm">Likes</span>
          <span className="text-white text-sm font-mono">{totalLikes}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white text-sm">Created:</span>
          <span className="text-white text-sm">
            {new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  )
}
