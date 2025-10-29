"use client"

type WSCallback = (data: any) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<WSCallback>> = new Map()
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' = 'disconnected'

  connect() {
    if (typeof window === 'undefined') return
    if (this.ws?.readyState === WebSocket.OPEN) return

    this.connectionStatus = 'connecting'
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/ws`

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected')
        this.connectionStatus = 'connected'
        this.reconnectAttempts = 0
        this.notifyListeners('connection', { status: 'connected' })
      }

      this.ws.onclose = () => {
        console.log('❌ WebSocket disconnected')
        this.connectionStatus = 'disconnected'
        this.notifyListeners('connection', { status: 'disconnected' })
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.connectionStatus = 'disconnected'
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
    } catch (error) {
      console.error('Error creating WebSocket:', error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      this.connect()
    }, delay)
  }

  private handleMessage(message: any) {
    const { type, data } = message
    
    if (type === 'connected') {
      console.log('WebSocket connection confirmed')
      return
    }

    this.notifyListeners(type, data)
  }

  private notifyListeners(type: string, data: any) {
    const callbacks = this.listeners.get(type)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in WebSocket callback for ${type}:`, error)
        }
      })
    }

    // Also notify wildcard listeners
    const wildcardCallbacks = this.listeners.get('*')
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((callback) => {
        try {
          callback({ type, data })
        } catch (error) {
          console.error('Error in wildcard WebSocket callback:', error)
        }
      })
    }
  }

  on(type: string, callback: WSCallback) {
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

  off(type: string, callback: WSCallback) {
    const callbacks = this.listeners.get(type)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }

  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  getStatus() {
    return this.connectionStatus
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.listeners.clear()
  }
}

// Export singleton instance
export const wsClient = typeof window !== 'undefined' ? new WebSocketClient() : null

// Auto-connect when available
if (typeof window !== 'undefined') {
  wsClient?.connect()
}
