import { NextRequest } from "next/server"

const clients = new Set<WebSocket>()

export const config = {
  runtime: "edge",
}

export default function handler(req: NextRequest) {
  const upgradeHeader = req.headers.get("upgrade")
  if (upgradeHeader !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 })
  }

  const { 0: client, 1: server } = Object.values(new WebSocketPair()) as [WebSocket, WebSocket]
  clients.add(server)

  server.accept()

  server.addEventListener("message", (event) => {
    clients.forEach((ws) => {
      if (ws.readyState === ws.OPEN) ws.send(event.data)
    })
  })

  server.addEventListener("close", () => clients.delete(server))
  server.addEventListener("error", () => clients.delete(server))

  return new Response(null, { status: 101, webSocket: client })
}
