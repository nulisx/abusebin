import { WebSocket, WebSocketServer } from 'ws'

export type WSMessage = {
  type: 'paste.created' | 'paste.updated' | 'paste.deleted' | 'comment.created' | 'reaction.created' | 'follow.created' | 'hall.created' | 'user.online' | 'user.offline'
  data: any
  timestamp: number
}

class WebSocketManager {
  private wss: WebSocketServer | null = null
  private clients: Set<WebSocket> = new Set()

  initialize(server: any) {
    this.wss = new WebSocketServer({ server })

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket client connected')
      this.clients.add(ws)

      ws.on('close', () => {
        console.log('WebSocket client disconnected')
        this.clients.delete(ws)
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        this.clients.delete(ws)
      })

      // Send initial connection confirmation
      ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }))
    })
  }

  broadcast(message: WSMessage) {
    const payload = JSON.stringify(message)
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload)
      }
    })
  }

  broadcastPasteCreated(paste: any) {
    this.broadcast({
      type: 'paste.created',
      data: paste,
      timestamp: Date.now(),
    })
  }

  broadcastPasteUpdated(paste: any) {
    this.broadcast({
      type: 'paste.updated',
      data: paste,
      timestamp: Date.now(),
    })
  }

  broadcastPasteDeleted(pasteId: string) {
    this.broadcast({
      type: 'paste.deleted',
      data: { id: pasteId },
      timestamp: Date.now(),
    })
  }

  broadcastCommentCreated(comment: any) {
    this.broadcast({
      type: 'comment.created',
      data: comment,
      timestamp: Date.now(),
    })
  }

  broadcastReactionCreated(reaction: any) {
    this.broadcast({
      type: 'reaction.created',
      data: reaction,
      timestamp: Date.now(),
    })
  }
}

export const wsManager = new WebSocketManager()
