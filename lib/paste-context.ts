"use client"

import { create } from "zustand"
import { useAuth } from "./auth" // Import useAuth

interface PasteState {
  getCommentCount: (pasteId: string) => number
  getPasteById: (pasteId: string) => ReturnType<typeof useAuth>["pastes"][number] | undefined
}

export const usePastes = create<PasteState>((set, get) => ({
  getCommentCount: (pasteId: string) => {
    const authState = useAuth.getState() // Access the state of useAuth
    const paste = authState.pastes.find((p) => p.id === pasteId)
    return paste ? paste.comments.length : 0
  },
  getPasteById: (pasteId: string) => {
    const authState = useAuth.getState() // Access the state of useAuth
    return authState.pastes.find((p) => p.id === pasteId)
  },
}))
