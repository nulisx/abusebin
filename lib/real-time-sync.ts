/**
 * Real-time sync utility for broadcasting events across browser tabs/windows
 * Uses localStorage events for cross-tab communication
 */

type EventPriority = "low" | "medium" | "high"

interface SyncEvent {
  type: string
  data: any
  priority: EventPriority
  timestamp: number
}

class RealTimeSync {
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor() {
    if (typeof window !== "undefined") {
      // Listen for storage events from other tabs
      window.addEventListener("storage", this.handleStorageEvent.bind(this))
    }
  }

  /**
   * Broadcast an event to all other tabs/windows
   */
  broadcast(type: string, data: any, priority: EventPriority = "medium") {
    if (typeof window === "undefined") return

    const event: SyncEvent = {
      type,
      data,
      priority,
      timestamp: Date.now(),
    }

    // Use localStorage to trigger storage events in other tabs
    const key = `sync_event_${Date.now()}_${Math.random()}`
    localStorage.setItem(key, JSON.stringify(event))

    // Clean up immediately
    setTimeout(() => {
      localStorage.removeItem(key)
    }, 100)
  }

  /**
   * Subscribe to a specific event type
   */
  on(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(type)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }

  /**
   * Handle storage events from other tabs
   */
  private handleStorageEvent(event: StorageEvent) {
    if (!event.key?.startsWith("sync_event_")) return
    if (!event.newValue) return

    try {
      const syncEvent: SyncEvent = JSON.parse(event.newValue)
      const callbacks = this.listeners.get(syncEvent.type)

      if (callbacks) {
        callbacks.forEach((callback) => {
          try {
            callback(syncEvent.data)
          } catch (error) {
            console.error(`Error in sync event callback for ${syncEvent.type}:`, error)
          }
        })
      }
    } catch (error) {
      console.error("Error parsing sync event:", error)
    }
  }

  /**
   * Remove all listeners
   */
  destroy() {
    this.listeners.clear()
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.handleStorageEvent.bind(this))
    }
  }
}

// Export singleton instance
export const realTimeSync = typeof window !== "undefined" ? new RealTimeSync() : null
