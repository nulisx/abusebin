import type { NextRequest } from "next/server"

const clients = new Set<WebSocket>()

export const config = { runtime: "edge" }

export async function GET(req: NextRequest) {
  if (req.headers.get("upgrade") !== "websocket") return new Response("Expected WebSocket", { status: 426 })
  const { 0: client, 1: server } = Object.values(new WebSocketPair())
  server.accept()
  clients.add(server)
  server.addEventListener("message", e => {
    clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) ws.send(e.data)
    })
  })
  server.addEventListener("close", () => clients.delete(server))
  server.addEventListener("error", () => clients.delete(server))
  return new Response(null, { status: 101, webSocket: server })
}
