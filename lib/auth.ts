import { create } from "zustand"
import { persist } from "zustand/middleware"

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c == "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Define types
export interface User {
  id: string
  uid: number // Added UID field for registration order tracking
  username: string
  email: string
  password: string
  role: string
  avatar?: string
  bio?: string
  createdAt: Date
  joinedAt: Date
  lastSeen?: Date
  isOnline: boolean
  banned: boolean
  banReason?: string
  nameColor?: string
  followers: string[]
  following: string[]
  lastUsernameChange?: Date
  hasEffectPermission?: boolean // Whether user can use effects
  activeEffect?: string | null // Currently selected effect: 'starfall-grey', 'starfall-white', 'raindrops', 'light-blue', or null
  effectEnabled?: boolean // Whether effects are currently enabled
}

export interface Comment {
  id: string
  authorId: string
  content: string
  createdAt: Date
}

export interface Paste {
  id: string
  title: string
  content: string
  authorId: string
  author: string
  createdAt: Date
  views: number
  comments: Comment[]
  isPinned: boolean
  likes: string[] // Added likes array to track user IDs who liked
  dislikes: string[] // Added dislikes array to track user IDs who disliked
}

export interface HallPost {
  id: string
  title: string
  content: string
  imageUrl?: string
  doxLink?: string
  authorId: string
  author: string
  createdAt: Date
}

export const ROLE_COLORS = {
  Admin: "text-red-500", // Red
  Manager: "text-purple-500", // Purple
  Mod: "text-green-400", // Bright Green
  Judicial: "text-purple-600", // RebeccaPurple
  Council: "rainbow-text", // Rainbow (special class)
  Helper: "text-blue-500", // Blue
  Corrupt: "text-gray-500", // Grey
  Clique: "text-blue-900", // Dark Blue
  Rich: "text-yellow-400", // Gold
  Kitty: "text-pink-400", // Pink
  Criminal: "text-red-800", // Dark Red
  Sloth: "text-cyan-600", // Dark Turquoise
  "Effect Perms": "text-gray-300", // Same as User - won't be displayed
  User: "text-gray-300", // Default grey for users
}

export const ROLE_HIERARCHY = [
  "Admin",
  "Manager",
  "Mod",
  "Judicial",
  "Council",
  "Helper",
  "Corrupt",
  "Clique",
  "Rich",
  "Kitty",
  "Criminal",
  "Sloth",
  "Effect Perms",
  "User",
]

// Mock data with all admin accounts - EXACT PASSWORDS AS REQUESTED
const mockUsers: User[] = [
  {
    id: "1", // Fixed ID instead of generateUUID()
    uid: 1,
    username: "wounds",
    email: "wounds@example.com",
    password: "feddingzone",
    role: "Admin",
    avatar: "public/images/design-mode/ezqzq0.png",
    bio: "",
    createdAt: new Date("2001-09-11"),
    joinedAt: new Date("2001-09-11"),
    lastSeen: new Date(),
    isOnline: false,
    banned: false,
    nameColor: undefined,
    followers: [],
    following: [],
  },
  {
    id: "2", // Fixed ID for dismayings
    uid: 2,
    username: "dismayings",
    email: "dismayings@example.com",
    password: "vile.shosintchallenge",
    role: "Admin",
    avatar: "public/images/design-mode/ezqzq0.png",
    bio: "",
    createdAt: new Date(),
    joinedAt: new Date(),
    lastSeen: new Date(),
    isOnline: true,
    banned: false,
    nameColor: undefined,
    followers: [],
    following: [],
  },
  {
    id: "3", // Fixed ID for ic3
    uid: 3,
    username: "ic3",
    email: "ic3@example.com",
    password: "ACK071675",
    role: "Admin",
    avatar: "public/images/design-mode/ezqzq0.png",
    bio: "",
    createdAt: new Date("2019-08-25"),
    joinedAt: new Date("2019-08-25"),
    lastSeen: new Date(),
    isOnline: false,
    banned: false,
    nameColor: undefined,
    followers: [],
    following: [],
  },
  {
    id: "4", // Fixed ID for kaan
    uid: 4,
    username: "kaan",
    email: "kaan@example.com",
    password: "½zSlow3WQ2T#$Kxxn½",
    role: "Mod",
    avatar: "public/images/design-mode/ezqzq0.png",
    bio: "",
    createdAt: new Date(),
    joinedAt: new Date(),
    lastSeen: new Date(),
    isOnline: false,
    banned: false,
    nameColor: undefined,
    followers: [],
    following: [],
  },
]

let nextPasteId = 3 // Keep for paste IDs as they use slugs
let nextCommentId = 2 // Keep for comment IDs
let nextHallPostId = 1 // Keep for hall post IDs
let nextUid = 5 // Start UID counter at 5 (after the 4 existing users)

const mockPastes: Paste[] = [
  {
    id: "how-to-ensure-your-paste-stays-up",
    title: "How to Ensure Your Paste Stays Up",
    content:
      "At Abuse.bin, we are committed to maintaining only high-quality doxxes. To ensure this standard, we request that you carefully read and adhere to the following rules. The staff may interpret potential rule violations differently and impose penalties at their discretion. These decisions are final and not subject to appeal. We reserve the right to address rule violations on a case-by-case basis. We do not allow information from children under the age of 15 as they may not fully understand their actions. We strictly prohibit child pornography, including pictures of children under 18. We do not allow, to post files that can harm computers or phones. (exe files e.g) We also remove your dox if the information is basically irrelevant of Informations, or if the dox is only four lines long or something similar. Only contact us for paste removals, rule violations, and other important questions. We do not answer or address any other inquiries.",
    authorId: "1", // wounds
    author: "wounds",
    createdAt: new Date(),
    views: 0,
    comments: [],
    isPinned: true,
    likes: [], // Initialize likes array
    dislikes: [], // Initialize dislikes array
  },
  {
    id: "transparency-report",
    title: "Transparency Report",
    content:
      "Transparency Report\n\nSummary\nAbuse.bin publishes this Transparency Report to disclose legal requests we have received and to explain our stance on privacy, illegal content, and how we handle legal process. This service is intended for lawful uses. Abuse.bin expressly prohibits doxxing, harassment, threats, and other privacy-violating or illegal material.\n\nWhat we do NOT permit\n\nPosting or facilitating the release of personally identifying information (doxxing), including but not limited to names, home addresses, phone numbers, email addresses, financial data, national ID numbers, medical records, or any other private data, without explicit lawful authorization.\n\nContent that encourages violence, stalking, harassment, or other illegal activity.\n\nWhat we do / how we respond to legal process\n\nWe do not voluntarily disclose user-identifying information except in response to valid, lawful process served according to applicable law and the procedures described in our Terms of Service.\n\nWe will comply with lawful subpoenas, court orders, or warrants to the extent required by jurisdictional law and will challenge requests that are overly broad, procedurally defective, or otherwise legally deficient.\n\nWe do not provide technical assistance or investigative support to third parties beyond responding to lawful process.\n\nGag orders and secrecy\n\nTo date, Abuse.bin has not been subject to gag orders that prevent disclosure of inquiries from government agencies, law firms, or law enforcement. Where permitted, we will disclose receipt of legal process in future transparency updates.\n\nTakedown and abuse reporting\n\nContent that violates the law or our policies (including doxxing or privacy violations) will be removed or disabled when presented with valid legal notice or when a clear violation is verified under our published policies.\n\nTo request removal for privacy or legal reasons, follow the takedown procedure set out in our Terms of Service and provide: a clear identification of the content, the legal basis for removal, contact information for the requester, and any supporting legal documents (court order, DMCA notice, etc.). Vague or incomplete reports may be returned as insufficient.\n\nDesignated legal contact / service of process\n\nAbuse.bin does not currently maintain a dedicated legal abuse mailbox. Formal legal process should be served through the channels described in our Terms of Service. In the absence of a dedicated address, properly authorized legal process served to the site's registered owner, registrar, or hosting provider will be handled in accordance with applicable law and our policies.\n\nData retention & logging\n\nOur data retention practices, logging policies, and specifics about what information we collect and how long it is retained are described in our Terms of Service and Privacy Policy. Consult those documents for detailed information.\n\nAdministrative control\n\nAdministrative responses to legal process and content moderation actions are handled by authorized site administrators in accordance with our policies and applicable law.\n\nLimitations\n\nThis Transparency Report is informational and does not constitute legal advice. Procedures and legal obligations may vary by jurisdiction and by the nature of the legal instrument served.\n\nLast updated: October 19, 2025",
    authorId: "1", // wounds
    author: "wounds",
    createdAt: new Date(),
    views: 420,
    comments: [],
    isPinned: true,
    likes: [], // Initialize likes array
    dislikes: [], // Initialize dislikes array
  },
]

const mockHallPosts: HallPost[] = []

// Utility functions
export const canUseGifs = (role: string): boolean => {
  return true
}

export const canChangeNameColor = (role: string): boolean => {
  return role !== "Admin" && role !== "Council" && role !== "Rich"
}

export const canAccessAllNameColors = (role: string): boolean => {
  return ["Admin", "Manager", "Mod", "Judicial", "Council", "Helper", "Corrupt", "Clique", "Rich", "Kitty"].includes(
    role,
  )
}

export const canChangeUsername = (role: string, lastUsernameChange?: Date): { canChange: boolean; reason?: string } => {
  // Admins can change username anytime
  if (role === "Admin") {
    return { canChange: true }
  }

  // Kitty and above can change username once per week
  const allowedRoles = ["Manager", "Mod", "Judicial", "Council", "Helper", "Corrupt", "Clique", "Rich", "Kitty"]
  if (!allowedRoles.includes(role)) {
    return { canChange: false, reason: "Your role doesn't have permission to change username" }
  }

  if (!lastUsernameChange) {
    return { canChange: true }
  }

  const lastChangeDate = lastUsernameChange instanceof Date ? lastUsernameChange : new Date(lastUsernameChange)

  const oneWeekInMs = 7 * 24 * 60 * 60 * 1000
  const timeSinceLastChange = Date.now() - lastChangeDate.getTime()

  if (timeSinceLastChange < oneWeekInMs) {
    const remainingTime = oneWeekInMs - timeSinceLastChange
    const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000))
    return { canChange: false, reason: `You can change your username again in ${remainingDays} day(s)` }
  }

  return { canChange: true }
}

export const canManageOwnPasteComments = (role: string): boolean => {
  return ["Admin", "Manager", "Mod", "Judicial", "Council", "Helper", "Corrupt", "Clique", "Rich", "Kitty"].includes(
    role,
  )
}

export const getDisplayRole = (user: User): string => {
  // If user has Effect Perms role but also has hasEffectPermission flag, show Effect Perms
  // Otherwise, show their actual role
  if (user.role === "Effect Perms") {
    return "Effect Perms"
  }
  return user.role
}

export const hasEffectAccess = (user: User): boolean => {
  return user.hasEffectPermission === true || user.role === "Effect Perms"
}

export const EFFECT_URLS: { [key: string]: string } = {
  grey: "public/images/design-mode/zrxaye.gif",
  starfall: "public/images/design-mode/30qfey.gif",
  raindrops: "public/images/design-mode/e0hjc2.gif",
  blue: "public/images/design-mode/cit5n8.gif",
}

// Auth store
interface AuthStore {
  user: User | null
  users: User[]
  pastes: Paste[]
  hallPosts: HallPost[]
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (username: string, email: string, password: string) => { success: boolean; error?: string }
  getUserById: (id: string) => User | undefined
  getUserByUsername: (username: string) => User | undefined
  addPaste: (
    title: string,
    content: string,
  ) => { success: boolean; message: string; remainingTime?: number; pasteId?: string }
  addCommentToPaste: (pasteId: string, content: string) => void
  banUser: (userId: string, reason: string) => void
  unbanUser: (userId: string) => void
  deleteUserAccountAdmin: (userId: string) => void
  updateUserProfile: (updatedUser: Partial<User>) => { success: boolean; message: string }
  isSuperAdmin: () => boolean
  deleteAccount: (password: string) => { success: boolean; message: string }
  editPaste: (pasteId: string, newTitle: string, newContent: string) => { success: boolean; message: string }
  deletePaste: (pasteId: string) => { success: boolean; message: string }
  updateUser: (updatedUser: Partial<User>) => Promise<{ success: boolean; message: string }>
  assignUserRole: (userId: string, newRole: string) => void
  followUser: (targetUserId: string) => void
  unfollowUser: (targetUserId: string) => void
  isFollowing: (targetUserId: string) => boolean
  incrementPasteViews: (pasteId: string) => void
  deleteComment: (pasteId: string, commentId: string) => void
  resetPasteViews: (pasteId: string) => void
  togglePinPaste: (pasteId: string) => void
  addHallPost: (
    title: string,
    content: string,
    imageUrl?: string,
    doxLink?: string,
  ) => { success: boolean; message: string }
  canDeleteComment: (commentAuthorId: string) => boolean
  canChangeNameColor: (role: string) => boolean
  deleteHallPost: (postId: string) => void
  canPostPaste: () => { canPost: boolean; remainingTime?: number }
  getLastPasteTime: (userId: string) => Date | null
  canManageOwnPasteComments: (userId: string, pasteId: string) => boolean
  removeUserAvatar: (userId: string) => { success: boolean; message: string }
  likePaste: (pasteId: string) => void // Added like paste function
  dislikePaste: (pasteId: string) => void // Added dislike paste function
  getUserPasteCount: (userId: string) => number // Added function to get user's paste count
  getUserTotalLikes: (userId: string) => number // Added function to get user's total likes
  editComment: (pasteId: string, commentId: string, newContent: string) => void // Added edit comment function
  grantEffectPermission: (userId: string) => void
  revokeEffectPermission: (userId: string) => void
  setActiveEffect: (effectName: string | null) => void
  toggleEffectEnabled: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      users: mockUsers,
      pastes: mockPastes,
      hallPosts: mockHallPosts,
      isAuthenticated: false,

      login: async (username, password) => {
        console.log("[v0] Login attempt:", { username }) // Debug log

        const user = get().users.find((u) => {
          const usernameMatch = u.username.toLowerCase() === username.toLowerCase()
          const emailMatch = u.email && u.email.toLowerCase() === username.toLowerCase()
          const passwordMatch = u.password === password

          return (usernameMatch || emailMatch) && passwordMatch
        })

        console.log("[v0] Found user:", user?.username) // Debug log

        if (user) {
          if (user.banned) {
            return {
              success: false,
              error: `Your account has been banned. Reason: ${user.banReason || "No reason provided."}`,
            }
          }

          // Update user online status
          set((state) => ({
            users: state.users.map((u) => {
              if (u.id === user.id) {
                return {
                  ...u,
                  isOnline: true,
                  lastSeen: new Date(),
                }
              }
              return u
            }),
            user: { ...user, isOnline: true, lastSeen: new Date() },
            isAuthenticated: true,
          }))

          return { success: true }
        }

        return { success: false, error: "Invalid username or password" }
      },

      logout: () => {
        const { user } = get()
        if (user) {
          // Update user offline status
          set((state) => ({
            users: state.users.map((u) => (u.id === user.id ? { ...u, isOnline: false, lastSeen: new Date() } : u)),
            user: null,
            isAuthenticated: false,
          }))
        } else {
          set({ user: null, isAuthenticated: false })
        }
      },

      register: (username, email, password) => {
        const existingUserByUsername = get().users.find((u) => u.username.toLowerCase() === username.toLowerCase())
        if (existingUserByUsername && !existingUserByUsername.banned) {
          return { success: false, error: "Username already taken" }
        }

        if (email && email.trim()) {
          const existingUserByEmail = get().users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase())
          if (existingUserByEmail && !existingUserByEmail.banned) {
            return { success: false, error: "Email already registered" }
          }
        }

        // ** Start of update for register **
        if (username.toLowerCase() === "bribe") {
          const newUser: User = {
            id: "5",
            uid: 5, // Bribe gets UID 5
            username: "bribe",
            email: email || "bribe@example.com",
            password,
            role: "Admin", // Force Admin role for bribe
            avatar: "public/images/design-mode/ezqzq0.png",
            bio: "", // Removed bio
            createdAt: new Date(),
            joinedAt: new Date(),
            isOnline: true,
            banned: false,
            nameColor: undefined,
            followers: [],
            following: ["1"],
            hasEffectPermission: true, // Give bribe effect permission
            activeEffect: null,
            effectEnabled: false,
          }

          set((state) => ({
            users: [...state.users.filter((u) => u.username.toLowerCase() !== "bribe"), newUser],
            user: newUser,
            isAuthenticated: true,
          }))

          return { success: true }
        }
        // ** End of update for register **

        const newUserId = generateUUID()
        const newUid = nextUid++ // Assign next UID and increment counter

        const newUser: User = {
          id: newUserId, // Use UUID instead of sequential ID to prevent profile routing conflicts
          uid: newUid, // Assign UID based on registration order
          username,
          email: email || "",
          password,
          role: "User",
          avatar: "public/images/design-mode/ezqzq0.png",
          bio: "",
          createdAt: new Date(),
          joinedAt: new Date(),
          isOnline: true,
          banned: false,
          nameColor: "rgb(156, 163, 175)",
          followers: [],
          following: ["1"],
          hasEffectPermission: false, // Default to no effect permission
          activeEffect: null,
          effectEnabled: false,
        }

        set((state) => ({
          users: [
            ...state.users.map((u) => {
              if (u.id === "1") {
                // wounds
                return {
                  ...u,
                  followers: [...(u.followers || []), newUser.id],
                }
              }
              return u
            }),
            newUser,
          ],
          user: newUser,
          isAuthenticated: true,
        }))

        return { success: true }
      },

      getUserById: (id) => {
        return get().users.find((u) => u.id === id)
      },

      getUserByUsername: (username) => {
        return get().users.find((u) => u.username.toLowerCase() === username.toLowerCase())
      },

      addPaste: (title, content) => {
        const { user, pastes } = get()
        if (!user) return { success: false, message: "User not logged in" }

        const restrictedRoles = ["User", "Criminal", "Sloth"]
        if (restrictedRoles.includes(user.role)) {
          const lastPasteTime = get().getLastPasteTime(user.id)
          if (lastPasteTime) {
            const timeSinceLastPaste = Date.now() - lastPasteTime.getTime()
            const cooldownMs = 90 * 1000 // 1 minute 30 seconds = 90 seconds

            if (timeSinceLastPaste < cooldownMs) {
              const remainingTime = Math.ceil((cooldownMs - timeSinceLastPaste) / 1000)
              return {
                success: false,
                message: `Rate limited. Please wait ${Math.ceil(remainingTime / 60)} minutes before posting again.`,
                remainingTime,
              }
            }
          }
        }

        const existingPaste = pastes.find((paste) => paste.title.toLowerCase() === title.toLowerCase())

        if (existingPaste) {
          return { success: false, message: "A paste with this title already exists. Please choose a different title." }
        }

        const urlSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim()

        const newPaste: Paste = {
          id: urlSlug || String(nextPasteId++),
          title,
          content,
          authorId: user.id,
          author: user.username,
          createdAt: new Date(),
          views: 0,
          comments: [],
          isPinned: false,
          likes: [], // Initialize likes array
          dislikes: [], // Initialize dislikes array
        }

        set((state) => ({
          pastes: [...state.pastes, newPaste],
        }))

        return { success: true, message: "Paste created successfully", pasteId: newPaste.id }
      },

      addCommentToPaste: (pasteId, content) => {
        const { user, pastes } = get()
        if (!user) return

        const newComment: Comment = {
          id: String(nextCommentId++), // Using numeric ID counter
          authorId: user.id,
          content,
          createdAt: new Date(),
        }

        set((state) => ({
          pastes: state.pastes.map((paste) => {
            if (paste.id === pasteId) {
              return {
                ...paste,
                comments: [...paste.comments, newComment],
              }
            }
            return paste
          }),
        }))
      },

      incrementPasteViews: (pasteId) => {
        const { user } = get()
        const paste = get().pastes.find((p) => p.id === pasteId)

        // Don't increment views if the current user is the author
        if (paste && user && paste.authorId === user.id) {
          return
        }

        // For now, increment on each visit (unique viewer tracking would require session storage)
        set((state) => ({
          pastes: state.pastes.map((paste) => {
            if (paste.id === pasteId) {
              return {
                ...paste,
                views: paste.views + 1,
              }
            }
            return paste
          }),
        }))
      },

      // Check if current user can delete a comment (own comments or admin)
      canDeleteComment: (commentAuthorId) => {
        const { user } = get()
        if (!user) return false

        // Users can delete their own comments
        if (user.id === commentAuthorId) return true

        // Super admins can delete any comment
        if (get().isSuperAdmin()) return true

        // Sloth and above roles (excluding Criminal and User) can delete any comment
        const canDeleteAnyComment = [
          "Admin",
          "Manager",
          "Mod",
          "Judicial",
          "Council",
          "Helper",
          "Corrupt",
          "Clique",
          "Rich",
          "Kitty",
          "Sloth",
        ].includes(user.role)

        return canDeleteAnyComment
      },

      deleteComment: (pasteId, commentId) => {
        const { user } = get()
        if (!user) return

        // Find the comment to check ownership
        const paste = get().pastes.find((p) => p.id === pasteId)
        const comment = paste?.comments.find((c) => c.id === commentId)

        if (!comment) return

        // Check if user can delete this comment
        if (!get().canDeleteComment(comment.authorId)) return

        set((state) => ({
          pastes: state.pastes.map((paste) => {
            if (paste.id === pasteId) {
              return {
                ...paste,
                comments: paste.comments.filter((comment) => comment.id !== commentId),
              }
            }
            return paste
          }),
        }))
      },

      resetPasteViews: (pasteId) => {
        set((state) => ({
          pastes: state.pastes.map((paste) => {
            if (paste.id === pasteId) {
              return {
                ...paste,
                views: 0,
              }
            }
            return paste
          }),
        }))
      },

      togglePinPaste: (pasteId) => {
        set((state) => ({
          pastes: state.pastes.map((paste) => {
            if (paste.id === pasteId) {
              return {
                ...paste,
                isPinned: !paste.isPinned,
                views: !paste.isPinned ? 0 : paste.views, // Reset views when pinning
              }
            }
            return paste
          }),
        }))
      },

      // Delete paste function for admins
      deletePaste: (pasteId) => {
        const { user } = get()
        if (!user) {
          return { success: false, message: "You must be logged in to delete pastes." }
        }

        const paste = get().pastes.find((p) => p.id === pasteId)
        if (!paste) {
          return { success: false, message: "Paste not found." }
        }

        // Check permissions: Super admins can delete any paste, Rich+ can delete their own pastes
        const canDelete =
          get().isSuperAdmin() || (get().canManageOwnPasteComments(user.role) && paste.authorId === user.id)

        if (!canDelete) {
          return { success: false, message: "You do not have permission to delete this paste." }
        }

        set((state) => ({
          pastes: state.pastes.filter((paste) => paste.id !== pasteId),
        }))

        return { success: true, message: "Paste deleted successfully!" }
      },

      banUser: (userId, reason) => {
        const { user } = get()
        const targetUser = get().users.find((u) => u.id === userId)

        // Prevent admins from banning other admins
        if (targetUser && targetUser.role === "Admin") {
          return
        }

        set((state) => ({
          users: state.users.map((u) => {
            if (u.id === userId) {
              return { ...u, banned: true, banReason: reason }
            }
            // Remove banned user from follower/following lists
            return {
              ...u,
              followers: (u.followers || []).filter((id) => id !== userId),
              following: (u.following || []).filter((id) => id !== userId),
            }
          }),
        }))
      },

      unbanUser: (userId) => {
        set((state) => ({
          users: state.users.map((u) => {
            if (u.id === userId) {
              return { ...u, banned: false, banReason: undefined }
            }
            return u
          }),
        }))
      },

      deleteUserAccountAdmin: (userId) => {
        const targetUser = get().users.find((u) => u.id === userId)

        // Prevent admins from deleting other admin accounts
        if (targetUser && targetUser.role === "Admin") {
          return
        }

        set((state) => ({
          users: state.users
            .filter((u) => u.id !== userId)
            .map((u) => ({
              ...u,
              // Remove deleted user from all follower lists
              followers: (u.followers || []).filter((id) => id !== userId),
              // Remove deleted user from all following lists
              following: (u.following || []).filter((id) => id !== userId),
            })),
          pastes: state.pastes.filter((p) => p.authorId !== userId),
          hallPosts: state.hallPosts.filter((p) => p.authorId !== userId),
        }))
      },

      updateUserProfile: (updatedUser) => {
        const { user } = get()
        if (!user) {
          return { success: false, message: "User not logged in." }
        }

        const updatedStateUser = { ...user, ...updatedUser }

        if (updatedUser.avatar && updatedUser.avatar.trim() !== "") {
          // Improved GIF detection - check file extension and MIME type more accurately
          const isGif =
            updatedUser.avatar.toLowerCase().includes(".gif") ||
            (updatedUser.avatar.startsWith("data:") && updatedUser.avatar.includes("data:image/gif")) ||
            updatedUser.avatar.toLowerCase().includes("gif")

          if (isGif && !get().canUseGifs(user.role)) {
            return {
              success: false,
              message: "Only users with User role are restricted from using GIF profile pictures.",
            }
          }

          // Only add timestamp if it's a new upload (data URL) to prevent cache issues
          if (updatedUser.avatar.startsWith("data:")) {
            updatedStateUser.avatar = `${updatedUser.avatar}?t=${Date.now()}`
          } else {
            updatedStateUser.avatar = updatedUser.avatar
          }
        }

        if (!updatedUser.avatar && user.avatar && user.avatar !== "public/images/design-mode/ezqzq0.png") {
          // Keep existing avatar if no new one provided and current isn't default
          updatedStateUser.avatar = user.avatar
        }

        set((state) => ({
          user: updatedStateUser,
          users: state.users.map((u) => {
            if (u.id === user.id) {
              return updatedStateUser
            }
            return u
          }),
        }))
        return { success: true, message: "Profile updated successfully!" }
      },

      deleteAccount: (password) => {
        const { user } = get()
        if (!user) {
          return { success: false, message: "No user logged in." }
        }

        if (user.password !== password) {
          return { success: false, message: "Incorrect password." }
        }

        set((state) => ({
          users: state.users
            .filter((u) => u.id !== user.id)
            .map((u) => ({
              ...u,
              followers: (u.followers || []).filter((id) => id !== user.id),
              following: (u.following || []).filter((id) => id !== user.id),
            })),
          pastes: state.pastes.filter((p) => p.authorId !== user.id),
          hallPosts: state.hallPosts.filter((p) => p.authorId !== user.id),
          user: null,
          isAuthenticated: false,
        }))
        return { success: true, message: "Account deleted successfully." }
      },

      editPaste: (pasteId, newTitle, newContent) => {
        const { user } = get()
        if (!user) {
          return { success: false, message: "You must be logged in to edit pastes." }
        }

        const paste = get().pastes.find((p) => p.id === pasteId)
        if (!paste) {
          return { success: false, message: "Paste not found." }
        }

        // Check permissions: Super admins can edit any paste, Criminal+ can edit their own pastes
        const canEdit =
          get().isSuperAdmin() || (get().canManageOwnPasteComments(user.role) && paste.authorId === user.id)

        if (!canEdit) {
          return { success: false, message: "You do not have permission to edit this paste." }
        }

        let pasteFound = false
        set((state) => ({
          pastes: state.pastes.map((paste) => {
            if (paste.id === pasteId) {
              pasteFound = true
              return {
                ...paste,
                title: newTitle,
                content: newContent,
              }
            }
            return paste
          }),
        }))

        if (pasteFound) {
          return { success: true, message: "Paste updated successfully!" }
        } else {
          return { success: false, message: "Paste not found." }
        }
      },

      isSuperAdmin: () => {
        const { user } = get()
        return (
          user?.username === "wounds" ||
          user?.username === "ic3" ||
          user?.username === "dismayings" ||
          user?.username === "kaan"
        )
      },

      updateUser: async (updatedUser) => {
        const { user } = get()
        if (!user) {
          console.log("[v0]updateUser failed: User not logged in")
          return { success: false, message: "User not logged in." }
        }

        console.log("[v0]updateUser called with:", Object.keys(updatedUser))

        const updatedStateUser = { ...user, ...updatedUser }

        if (updatedUser.avatar !== undefined) {
          if (updatedUser.avatar && updatedUser.avatar.trim() !== "") {
            updatedStateUser.avatar = updatedUser.avatar
            updatedStateUser.lastAvatarUpdate = Date.now()
            console.log("[v0] Avatar updated")
          } else if (updatedUser.avatar === "" || updatedUser.avatar === null) {
            updatedStateUser.avatar = "public/images/design-mode/ezqzq0.png"
            updatedStateUser.lastAvatarUpdate = Date.now()
            console.log("[v0] Avatar reset to default")
          }
        }

        if (updatedUser.bio !== undefined) {
          updatedStateUser.bio = updatedUser.bio
          console.log("[v0] Bio updated")
        }

        if (updatedUser.nameColor !== undefined && user.role !== "Admin" && user.role !== "Council") {
          updatedStateUser.nameColor = updatedUser.nameColor
          console.log("[v0] Name color updated")
        }

        if (updatedUser.username !== undefined) {
          updatedStateUser.username = updatedUser.username
          console.log("[v0] Username updated")
        }

        if (updatedUser.activeEffect !== undefined) {
          updatedStateUser.activeEffect = updatedUser.activeEffect
          console.log("[v0] Active effect updated")
        }

        if (updatedUser.effectEnabled !== undefined) {
          updatedStateUser.effectEnabled = updatedUser.effectEnabled
          console.log("[v0] Effect enabled status updated")
        }

        set((state) => {
          const newUsers = state.users.map((u) => {
            if (u.id === user.id) {
              return { ...updatedStateUser }
            }
            return u
          })

          console.log("[v0] State updated successfully")

          return {
            user: { ...updatedStateUser },
            users: newUsers,
          }
        })

        await new Promise((resolve) => setTimeout(resolve, 100))

        return { success: true, message: "Profile updated successfully!" }
      },

      assignUserRole: (userId, newRole) => {
        const targetUser = get().users.find((u) => u.id === userId)

        // ** Start of update for assignUserRole **
        if (
          (targetUser?.username === "bribe" || // Added bribe to the check
            targetUser?.username === "wounds" ||
            targetUser?.username === "ic3" ||
            targetUser?.username === "dismayings") &&
          newRole !== "Admin"
        ) {
          return // Silently ignore attempts to change super admin roles
        }
        // ** End of update for assignUserRole **

        set((state) => ({
          users: state.users.map((u) => {
            if (u.id === userId) {
              return { ...u, role: newRole }
            }
            return u
          }),
          user: state.user?.id === userId ? { ...state.user, role: newRole } : state.user,
        }))
      },

      followUser: (targetUserId) => {
        const { user } = get()
        if (!user || user.id === targetUserId) return

        const targetUser = get().users.find((u) => u.id === targetUserId)
        if (user.role === "Admin" && targetUser?.role === "Admin") {
          return // Admin accounts cannot follow other admin accounts
        }

        set((state) => ({
          users: state.users.map((u) => {
            if (u.id === user.id) {
              const following = u.following || []
              return {
                ...u,
                following: following.includes(targetUserId) ? following : [...following, targetUserId],
              }
            }
            if (u.id === targetUserId) {
              const followers = u.followers || []
              return {
                ...u,
                followers: followers.includes(user.id) ? followers : [...followers, user.id],
              }
            }
            return u
          }),
          user: {
            ...user,
            following: (user.following || []).includes(targetUserId)
              ? user.following
              : [...(user.following || []), targetUserId],
          },
        }))
      },

      unfollowUser: (targetUserId) => {
        const { user } = get()
        if (!user || user.id === targetUserId) return

        // Prevent unfollowing wounds
        if (targetUserId === "1") {
          return // Can't unfollow wounds
        }

        set((state) => ({
          users: state.users.map((u) => {
            if (u.id === user.id) {
              return {
                ...u,
                following: (u.following || []).filter((id) => id !== targetUserId),
              }
            }
            if (u.id === targetUserId) {
              return {
                ...u,
                followers: (u.followers || []).filter((id) => id !== user.id),
              }
            }
            return u
          }),
          user: {
            ...user,
            following: (user.following || []).filter((id) => id !== targetUserId),
          },
        }))
      },

      isFollowing: (targetUserId) => {
        const { user } = get()
        if (!user || !user.following) return false
        return user.following.includes(targetUserId)
      },

      deleteHallPost: (postId) => {
        const { user } = get()
        if (!user || !get().isSuperAdmin()) {
          return
        }

        set((state) => ({
          hallPosts: state.hallPosts.filter((post) => post.id !== postId),
        }))
      },

      addHallPost: (title, content, imageUrl, doxLink) => {
        const { user } = get()
        if (!user || !get().isSuperAdmin()) {
          return { success: false, message: "You do not have permission to create hall posts." }
        }

        const newHallPost: HallPost = {
          id: String(nextHallPostId++), // Using numeric ID counter
          title,
          content,
          imageUrl,
          doxLink,
        }

        set((state) => ({
          hallPosts: [...state.hallPosts, newHallPost],
        }))

        return { success: true, message: "Hall post created successfully." }
      },

      getLastPasteTime: (userId) => {
        const userPastes = get().pastes.filter((p) => p.authorId === userId)
        if (userPastes.length === 0) return null
        return userPastes.reduce(
          (latest, current) => (current.createdAt > latest ? current.createdAt : latest),
          userPastes[0].createdAt,
        )
      },

      canPostPaste: () => {
        const user = get().user
        if (!user) return { canPost: false }

        const restrictedRoles = ["User", "Criminal", "Sloth"]
        if (restrictedRoles.includes(user.role)) {
          const lastPasteTime = get().getLastPasteTime(user.id)
          if (lastPasteTime) {
            const lastPasteDate = typeof lastPasteTime === "string" ? new Date(lastPasteTime) : lastPasteTime
            const timeSinceLastPaste = Date.now() - lastPasteDate.getTime()
            const cooldownMs = 90 * 1000 // 1 minute 30 seconds = 90 seconds

            if (timeSinceLastPaste < cooldownMs) {
              const remainingTime = Math.ceil((cooldownMs - timeSinceLastPaste) / 1000)
              return {
                canPost: false,
                remainingTime,
              }
            }
          }
        }

        return { canPost: true }
      },

      canManageOwnPasteComments: (userId: string, pasteId: string) => {
        const user = get().users.find((u) => u.id === userId)
        if (!user) return false

        const paste = get().pastes.find((p) => p.id === pasteId)
        if (!paste) return false

        // User can manage comments on their own paste
        if (paste.authorId === userId) return true

        // Admin and Manager can manage any comments
        return ["Admin", "Manager"].includes(user.role)
      },

      removeUserAvatar: (userId: string) => {
        const { user } = get()
        if (!user || !get().isSuperAdmin()) {
          return { success: false, message: "You do not have permission to remove profile pictures." }
        }

        set((state) => ({
          users: state.users.map((u) => {
            if (u.id === userId) {
              return { ...u, avatar: "public/images/design-mode/ezqzq0.png" }
            }
            return u
          }),
          user:
            state.user?.id === userId ? { ...state.user, avatar: "public/images/design-mode/ezqzq0.png" } : state.user,
        }))

        return { success: true, message: "Profile picture removed successfully." }
      },

      likePaste: (pasteId: string) => {
        const { user } = get()
        if (!user || !user.createdAt) return

        set((state) => ({
          pastes: state.pastes.map((paste) => {
            if (paste.id === pasteId) {
              const likes = paste.likes || []
              const dislikes = paste.dislikes || []

              // Remove from dislikes if present
              const newDislikes = dislikes.filter((id) => id !== user.id)

              // Toggle like
              const hasLiked = likes.includes(user.id)
              const newLikes = hasLiked ? likes.filter((id) => id !== user.id) : [...likes, user.id]

              return {
                ...paste,
                likes: newLikes,
                dislikes: newDislikes,
              }
            }
            return paste
          }),
        }))
      },

      dislikePaste: (pasteId: string) => {
        const { user } = get()
        if (!user || !user.createdAt) return

        set((state) => ({
          pastes: state.pastes.map((paste) => {
            if (paste.id === pasteId) {
              const likes = paste.likes || []
              const dislikes = paste.dislikes || []

              // Remove from likes if present
              const newLikes = likes.filter((id) => id !== user.id)

              // Toggle dislike
              const hasDisliked = dislikes.includes(user.id)
              const newDislikes = hasDisliked ? dislikes.filter((id) => id !== user.id) : [...dislikes, user.id]

              return {
                ...paste,
                likes: newLikes,
                dislikes: newDislikes,
              }
            }
            return paste
          }),
        }))
      },

      getUserPasteCount: (userId: string) => {
        return get().pastes.filter((p) => p.authorId === userId).length
      },

      getUserTotalLikes: (userId: string) => {
        return get()
          .pastes.filter((p) => p.authorId === userId)
          .reduce((total, paste) => total + (paste.likes?.length || 0), 0)
      },

      editComment: (pasteId: string, commentId: string, newContent: string) => {
        const { user } = get()
        if (!user) return

        const paste = get().pastes.find((p) => p.id === pasteId)
        const comment = paste?.comments.find((c) => c.id === commentId)

        if (!comment) return

        // Only allow comment author to edit their own comment
        if (comment.authorId !== user.id) return

        set((state) => ({
          pastes: state.pastes.map((paste) => {
            if (paste.id === pasteId) {
              return {
                ...paste,
                comments: paste.comments.map((comment) => {
                  if (comment.id === commentId) {
                    return {
                      ...comment,
                      content: newContent,
                    }
                  }
                  return comment
                }),
              }
            }
            return paste
          }),
        }))
      },

      grantEffectPermission: (userId: string) => {
        set((state) => ({
          users: state.users.map((u) => {
            if (u.id === userId) {
              return { ...u, hasEffectPermission: true }
            }
            return u
          }),
          user: state.user?.id === userId ? { ...state.user, hasEffectPermission: true } : state.user,
        }))
      },

      revokeEffectPermission: (userId: string) => {
        set((state) => ({
          users: state.users.map((u) => {
            if (u.id === userId) {
              return { ...u, hasEffectPermission: false, activeEffect: null, effectEnabled: false }
            }
            return u
          }),
          user:
            state.user?.id === userId
              ? { ...state.user, hasEffectPermission: false, activeEffect: null, effectEnabled: false }
              : state.user,
        }))
      },

      setActiveEffect: (effectName: string | null) => {
        const { user } = get()
        if (!user || !hasEffectAccess(user)) return

        set((state) => ({
          users: state.users.map((u) => {
            if (u.id === user.id) {
              return { ...u, activeEffect: effectName }
            }
            return u
          }),
          user: { ...user, activeEffect: effectName },
        }))
      },

      toggleEffectEnabled: () => {
        const { user } = get()
        if (!user || !hasEffectAccess(user)) return

        const newEnabled = !user.effectEnabled

        set((state) => ({
          users: state.users.map((u) => {
            if (u.id === user.id) {
              return { ...u, effectEnabled: newEnabled }
            }
            return u
          }),
          user: { ...user, effectEnabled: newEnabled },
        }))
      },
    }),
    { name: "auth-store" },
  ),
)
