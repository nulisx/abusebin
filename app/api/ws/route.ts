import type { NextRequest } from "next/server"
import { Deno } from "deno"

const clients = new Set<WebSocket>()

export async function GET(req: NextRequest) {
  const upgradeHeader = req.headers.get("upgrade")

  if (upgradeHeader !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 })
  }

  const { socket, response } = Deno.upgradeWebSocket(req)

  socket.onopen = () => {
    clients.add(socket)
  }

  socket.onmessage = (event) => {
    const message = event.data
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  socket.onclose = () => {
    clients.delete(socket)
  }

  socket.onerror = () => {
    clients.delete(socket)
  }

  return response
}
